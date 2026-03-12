from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import uuid
from datetime import datetime, timezone

from app.auth import get_current_active_user
from app.database import get_sqlite_connection
from database import get_table_schema
from app.services.ai_service import AIService
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix='/copilot', tags=['Data Copilot'])
ai_service = AIService()

# MongoDB for query history
mongo_client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = mongo_client[os.environ['DB_NAME']]

class CopilotQuery(BaseModel):
    query: str

class CopilotResponse(BaseModel):
    query_id: str
    sql: str
    data: List[dict]
    chartConfig: dict
    insights: str
    success: bool
    error: str = None

@router.post('/query', response_model=CopilotResponse)
async def process_copilot_query(
    query_input: CopilotQuery,
    current_user: dict = Depends(get_current_active_user)
):
    try:
        # Get database schema
        schema = get_table_schema()
        
        # Convert natural language to SQL with improved service
        sql_result = await ai_service.text_to_sql(query_input.query, schema)
        
        if not sql_result['success']:
            return CopilotResponse(
                query_id='',
                sql=sql_result.get('sql', ''),
                data=[],
                chartConfig={'chartType': 'table', 'xAxis': None, 'yAxis': None},
                insights='',
                success=False,
                error=sql_result['error']
            )
        
        sql = sql_result['sql']
        
        # Execute SQL query
        conn = get_sqlite_connection()
        cursor = conn.cursor()
        cursor.execute(sql)
        
        # Fetch results
        rows = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        
        # Convert to list of dicts
        data = [dict(zip(column_names, row)) for row in rows]
        
        conn.close()
        
        if not data:
            query_id = str(uuid.uuid4())
            return CopilotResponse(
                query_id=query_id,
                sql=sql,
                data=[],
                chartConfig={'chartType': 'table', 'xAxis': None, 'yAxis': None, 'reason': 'No data'},
                insights='No data found for this query.',
                success=True
            )
        
        # Recommend chart type
        chart_config = await ai_service.recommend_chart_type(data, column_names)
        
        # Generate insights
        insights = await ai_service.generate_insights(query_input.query, data, chart_config)
        
        # Save to query history
        query_id = str(uuid.uuid4())
        history_doc = {
            'id': query_id,
            'user_id': current_user['id'],
            'query_text': query_input.query,
            'sql_generated': sql,
            'chart_type': chart_config.get('chartType'),
            'insights': insights,
            'data': data[:100],  # Store first 100 rows
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        await db.query_history.insert_one(history_doc)
        
        return CopilotResponse(
            query_id=query_id,
            sql=sql,
            data=data,
            chartConfig=chart_config,
            insights=insights,
            success=True
        )
    
    except Exception as e:
        return CopilotResponse(
            query_id='',
            sql='',
            data=[],
            chartConfig={'chartType': 'table', 'xAxis': None, 'yAxis': None},
            insights='',
            success=False,
            error=str(e)
        )

@router.get('/history')
async def get_query_history(current_user: dict = Depends(get_current_active_user)):
    history = await db.query_history.find(
        {'user_id': current_user['id']},
        {'_id': 0}
    ).sort('created_at', -1).limit(50).to_list(50)
    
    return history

@router.get('/history/{query_id}')
async def get_query_by_id(
    query_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    query = await db.query_history.find_one(
        {'id': query_id, 'user_id': current_user['id']},
        {'_id': 0}
    )
    
    if not query:
        raise HTTPException(status_code=404, detail='Query not found')
    
    return query