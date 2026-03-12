import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import json
import re
import sqlparse
from typing import Dict, List, Any

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    async def text_to_sql(self, user_query: str, schema_info: dict, max_retries: int = 3) -> dict:
        """
        Convert natural language to SQL query with validation and retry logic.
        Returns: {"sql": str, "explanation": str, "success": bool, "error": str}
        """
        chat = LlmChat(
            api_key=self.api_key,
            session_id="text-to-sql",
            system_message="""You are an expert SQL generator. You MUST follow these rules:
1. Generate COMPLETE and VALID SQL queries only
2. Use exact table and column names from the schema
3. Include all necessary clauses (SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT)
4. Return ONLY the SQL query without any explanation, markdown, or comments
5. Always add LIMIT clause to prevent huge result sets
6. Use proper aggregation functions (SUM, AVG, COUNT, etc.) when needed"""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Create detailed schema description
        schema_description = self._format_schema(schema_info)
        
        for attempt in range(max_retries):
            try:
                prompt = f"""Database Schema:
{schema_description}

User Query: {user_query}

Generate a complete, valid SQLite query. Requirements:
- Use EXACT table and column names from schema
- Include proper JOINs if multiple tables needed
- Add GROUP BY for aggregations
- Add ORDER BY for sorting
- Add LIMIT to restrict results (max 1000 rows)
- Return ONLY the SQL query

SQL Query:"""
                
                message = UserMessage(text=prompt)
                response = await chat.send_message(message)
                
                # Clean the response
                sql = self._clean_sql_response(response)
                
                # Validate SQL
                validation = self._validate_sql(sql, schema_info)
                
                if validation['valid']:
                    return {
                        'sql': sql,
                        'explanation': f'Generated SQL query for: {user_query}',
                        'success': True,
                        'error': None
                    }
                else:
                    if attempt < max_retries - 1:
                        # Retry with error feedback
                        user_query = f"{user_query}\n\nPrevious attempt failed: {validation['error']}. Please fix and regenerate."
                        continue
                    else:
                        return {
                            'sql': sql,
                            'explanation': 'Generated SQL but validation failed',
                            'success': False,
                            'error': validation['error']
                        }
            
            except Exception as e:
                if attempt < max_retries - 1:
                    continue
                return {
                    'sql': None,
                    'explanation': 'Failed to generate SQL',
                    'success': False,
                    'error': str(e)
                }
        
        return {
            'sql': None,
            'explanation': 'Failed after retries',
            'success': False,
            'error': 'Max retries exceeded'
        }
    
    def _format_schema(self, schema_info: dict) -> str:
        """Format schema information for better LLM understanding"""
        lines = []
        for table_name, columns in schema_info.items():
            lines.append(f"Table: {table_name}")
            lines.append("Columns:")
            for col in columns:
                lines.append(f"  - {col['name']} ({col['type']})")
            lines.append("")
        return "\n".join(lines)
    
    def _clean_sql_response(self, response: str) -> str:
        """Clean and format SQL response"""
        sql = response.strip()
        
        # Remove markdown code blocks
        sql = re.sub(r'```sql\s*', '', sql)
        sql = re.sub(r'```\s*', '', sql)
        
        # Remove comments
        sql = re.sub(r'--.*$', '', sql, flags=re.MULTILINE)
        
        # Remove extra whitespace
        sql = ' '.join(sql.split())
        
        # Format SQL for readability
        try:
            sql = sqlparse.format(sql, reindent=True, keyword_case='upper')
        except:
            pass
        
        return sql.strip()
    
    def _validate_sql(self, sql: str, schema_info: dict) -> dict:
        """Validate SQL query against schema"""
        if not sql:
            return {'valid': False, 'error': 'Empty SQL query'}
        
        sql_upper = sql.upper()
        
        # Check for required clauses
        if 'SELECT' not in sql_upper:
            return {'valid': False, 'error': 'Missing SELECT clause'}
        
        if 'FROM' not in sql_upper:
            return {'valid': False, 'error': 'Missing FROM clause'}
        
        # Check if table names exist
        for table_name in schema_info.keys():
            if table_name.lower() in sql.lower():
                return {'valid': True, 'error': None}
        
        return {'valid': False, 'error': 'No valid table name found in query'}
    
    async def recommend_chart_type(self, query_result: list, column_names: list) -> dict:
        """Recommend appropriate chart type based on query results"""
        if not query_result or not column_names:
            return {
                'chartType': 'table',
                'xAxis': None,
                'yAxis': None,
                'reason': 'No data to visualize'
            }
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id="chart-recommendation",
            system_message="You are a data visualization expert. Analyze data and recommend the best chart type."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        sample_data = query_result[:5] if len(query_result) > 5 else query_result
        
        prompt = f"""Analyze this data and recommend the best visualization:

Columns: {column_names}
Sample Data: {sample_data}
Total Rows: {len(query_result)}

Rules:
- Time series data → line chart
- Categories + numbers → bar chart
- Parts of whole → pie chart
- 2 numeric columns → scatter chart
- Large datasets → table

Respond ONLY with valid JSON:
{{
  "chartType": "bar|line|pie|scatter|table",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "reason": "brief explanation"
}}"""
        
        try:
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            
            # Clean and parse JSON
            response_clean = response.strip()
            response_clean = re.sub(r'```json\s*', '', response_clean)
            response_clean = re.sub(r'```\s*', '', response_clean)
            response_clean = response_clean.strip()
            
            result = json.loads(response_clean)
            return result
        except:
            # Fallback logic
            if len(column_names) >= 2:
                return {
                    'chartType': 'bar',
                    'xAxis': column_names[0],
                    'yAxis': column_names[1],
                    'reason': 'Default bar chart recommendation'
                }
            return {
                'chartType': 'table',
                'xAxis': None,
                'yAxis': None,
                'reason': 'Insufficient data for visualization'
            }
    
    async def generate_insights(self, query: str, data: list, chart_config: dict) -> str:
        """Generate AI insights from query results"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="insights",
            system_message="You are a data analyst. Provide concise, actionable insights."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        sample_data = data[:10] if len(data) > 10 else data
        
        prompt = f"""Analyze this data and provide 2-3 key insights:

User Query: {query}
Data Sample: {sample_data}
Total Records: {len(data)}
Visualization: {chart_config.get('chartType')}

Provide insights in 3-4 sentences. Focus on:
- Key trends or patterns
- Notable statistics
- Actionable recommendations

Insights:"""
        
        try:
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            return response.strip()
        except Exception as e:
            return f"Analysis complete. {len(data)} records found matching your query."
    
    async def analyze_csv(self, df_info: dict) -> dict:
        """Analyze uploaded CSV and provide summary"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="csv-analysis",
            system_message="You are a data analyst expert. Analyze datasets and provide insights."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Analyze this dataset:

Rows: {df_info['rows']}
Columns: {df_info['columns']}
Column Types: {df_info['column_info']}
Sample Data: {df_info['sample']}

Provide a 2-3 sentence analysis covering:
- Dataset purpose/type
- Key characteristics
- Notable patterns

Analysis:"""
        
        try:
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            return {'summary': response.strip()}
        except:
            return {'summary': f'Dataset with {df_info["rows"]} rows and {df_info["columns"]} columns uploaded successfully.'}
    
    async def query_csv(self, user_query: str, df_info: dict) -> str:
        """Answer questions about uploaded CSV"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="csv-query",
            system_message="You are a helpful data analyst assistant. Answer questions about datasets clearly."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Dataset Information:
{json.dumps(df_info, indent=2)}

User Question: {user_query}

Provide a clear, concise answer based on the dataset information.

Answer:"""
        
        try:
            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            return response.strip()
        except Exception as e:
            return "I'm unable to answer that question at the moment. Please try rephrasing it."