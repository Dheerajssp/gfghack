import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import json
import re

load_dotenv()

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    async def text_to_sql(self, user_query: str, schema_info: dict) -> str:
        """Convert natural language to SQL query"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="text-to-sql",
            system_message="You are a SQL expert. Convert natural language queries to SQL. Return ONLY the SQL query without any explanation or markdown formatting."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        schema_str = json.dumps(schema_info, indent=2)
        prompt = f"""Database Schema:
{schema_str}

User Query: {user_query}

Generate a valid SQLite query. Return ONLY the SQL query without any explanation, comments, or markdown."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Clean up the response
        sql = response.strip()
        sql = re.sub(r'```sql\s*', '', sql)
        sql = re.sub(r'```\s*', '', sql)
        sql = sql.strip()
        
        return sql
    
    async def recommend_chart_type(self, query_result: list, column_names: list) -> dict:
        """Recommend appropriate chart type based on query results"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="chart-recommendation",
            system_message="You are a data visualization expert. Analyze query results and recommend the best chart type."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        sample_data = query_result[:5] if len(query_result) > 5 else query_result
        prompt = f"""Column Names: {column_names}
Sample Data (first 5 rows): {sample_data}
Total Rows: {len(query_result)}

Recommend ONE chart type from: bar, line, pie
Also identify which column should be used for x-axis (or labels for pie) and which for y-axis (or values for pie).

Respond in JSON format:
{{
  "chartType": "bar|line|pie",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "reason": "brief explanation"
}}

Return ONLY valid JSON without any markdown or explanation."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Clean and parse JSON
        response_clean = response.strip()
        response_clean = re.sub(r'```json\s*', '', response_clean)
        response_clean = re.sub(r'```\s*', '', response_clean)
        response_clean = response_clean.strip()
        
        try:
            return json.loads(response_clean)
        except:
            # Fallback
            return {
                "chartType": "bar",
                "xAxis": column_names[0] if column_names else "x",
                "yAxis": column_names[1] if len(column_names) > 1 else "y",
                "reason": "Default recommendation"
            }
    
    async def generate_insights(self, query: str, data: list, chart_config: dict) -> str:
        """Generate insights from query results"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="insights",
            system_message="You are a data analyst. Provide concise, actionable insights from data."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        sample_data = data[:10] if len(data) > 10 else data
        prompt = f"""User Query: {query}
Data Sample: {sample_data}
Total Records: {len(data)}
Chart Type: {chart_config.get('chartType', 'N/A')}

Provide 2-3 key insights in a short paragraph (max 100 words). Focus on trends, patterns, or notable findings."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return response.strip()
    
    async def analyze_csv(self, df_info: dict) -> dict:
        """Analyze uploaded CSV and provide summary"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="csv-analysis",
            system_message="You are a data analyst. Analyze dataset information and provide insights."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Dataset Information:
Rows: {df_info['rows']}
Columns: {df_info['columns']}
Column Details: {df_info['column_info']}
Sample Data: {df_info['sample']}

Provide a brief analysis (2-3 sentences) about this dataset."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return {"summary": response.strip()}
    
    async def query_csv(self, user_query: str, df_info: dict) -> str:
        """Answer questions about uploaded CSV"""
        chat = LlmChat(
            api_key=self.api_key,
            session_id="csv-query",
            system_message="You are a data analyst assistant. Answer questions about datasets clearly and concisely."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Dataset Information:
{json.dumps(df_info, indent=2)}

User Question: {user_query}

Provide a clear, concise answer based on the dataset information."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return response.strip()