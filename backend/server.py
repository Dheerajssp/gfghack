from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import pandas as pd
import json

from database import init_database, get_db_connection, get_table_schema
from llm_service import LLMService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize database
init_database()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM service
llm_service = LLMService()

# Store uploaded datasets in memory (in production, use database)
uploaded_datasets = {}

# Models
class CopilotQuery(BaseModel):
    query: str

class CopilotResponse(BaseModel):
    sql: str
    data: List[dict]
    chartConfig: dict
    insights: str

class ExplorerQuery(BaseModel):
    datasetId: str
    query: str

class DatasetInfo(BaseModel):
    id: str
    name: str
    rows: int
    columns: int
    uploadedAt: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "AI Data Intelligence Platform API"}

@api_router.post("/copilot/query", response_model=CopilotResponse)
async def process_copilot_query(query_input: CopilotQuery):
    try:
        # Get database schema
        schema = get_table_schema()
        
        # Convert natural language to SQL
        sql = await llm_service.text_to_sql(query_input.query, schema)
        
        # Execute SQL query
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(sql)
        
        # Fetch results
        rows = cursor.fetchall()
        column_names = [description[0] for description in cursor.description]
        
        # Convert to list of dicts
        data = [dict(zip(column_names, row)) for row in rows]
        
        conn.close()
        
        if not data:
            return CopilotResponse(
                sql=sql,
                data=[],
                chartConfig={"chartType": "bar", "xAxis": "x", "yAxis": "y", "reason": "No data"},
                insights="No data found for this query."
            )
        
        # Recommend chart type
        chart_config = await llm_service.recommend_chart_type(data, column_names)
        
        # Generate insights
        insights = await llm_service.generate_insights(query_input.query, data, chart_config)
        
        return CopilotResponse(
            sql=sql,
            data=data,
            chartConfig=chart_config,
            insights=insights
        )
    
    except Exception as e:
        logging.error(f"Error processing copilot query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/explorer/upload")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        # Generate dataset ID
        dataset_id = str(uuid.uuid4())
        
        # Store dataset
        uploaded_datasets[dataset_id] = {
            'name': file.filename,
            'dataframe': df,
            'uploadedAt': datetime.now(timezone.utc).isoformat()
        }
        
        # Prepare dataset info for analysis
        df_info = {
            'rows': len(df),
            'columns': len(df.columns),
            'column_info': {col: str(df[col].dtype) for col in df.columns},
            'sample': df.head(5).to_dict('records')
        }
        
        # Analyze dataset
        analysis = await llm_service.analyze_csv(df_info)
        
        # Get statistics
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        stats = df[numeric_cols].describe().to_dict() if numeric_cols else {}
        
        # Generate visualizations data
        visualizations = []
        
        # Distribution charts for numeric columns (max 3)
        for col in numeric_cols[:3]:
            hist_data = df[col].value_counts().head(10).to_dict()
            visualizations.append({
                'type': 'bar',
                'title': f'{col} Distribution',
                'data': [{'name': str(k), 'value': v} for k, v in hist_data.items()]
            })
        
        # Category comparison for categorical columns (max 2)
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        for col in categorical_cols[:2]:
            if df[col].nunique() <= 10:
                cat_data = df[col].value_counts().to_dict()
                visualizations.append({
                    'type': 'pie',
                    'title': f'{col} Breakdown',
                    'data': [{'name': str(k), 'value': v} for k, v in cat_data.items()]
                })
        
        return {
            'datasetId': dataset_id,
            'name': file.filename,
            'rows': len(df),
            'columns': len(df.columns),
            'columnNames': df.columns.tolist(),
            'summary': analysis['summary'],
            'statistics': stats,
            'visualizations': visualizations,
            'uploadedAt': uploaded_datasets[dataset_id]['uploadedAt']
        }
    
    except Exception as e:
        logging.error(f"Error uploading dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/explorer/query")
async def query_dataset(query_input: ExplorerQuery):
    try:
        dataset = uploaded_datasets.get(query_input.datasetId)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        df = dataset['dataframe']
        
        # Prepare dataset info
        df_info = {
            'name': dataset['name'],
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'sample': df.head(10).to_dict('records'),
            'dtypes': {col: str(df[col].dtype) for col in df.columns}
        }
        
        # Query using LLM
        answer = await llm_service.query_csv(query_input.query, df_info)
        
        return {'answer': answer}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error querying dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/explorer/datasets", response_model=List[DatasetInfo])
async def get_datasets():
    datasets = []
    for dataset_id, dataset_data in uploaded_datasets.items():
        df = dataset_data['dataframe']
        datasets.append(DatasetInfo(
            id=dataset_id,
            name=dataset_data['name'],
            rows=len(df),
            columns=len(df.columns),
            uploadedAt=dataset_data['uploadedAt']
        ))
    return datasets

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()