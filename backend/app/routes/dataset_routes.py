from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import uuid
from datetime import datetime, timezone
import os
from pathlib import Path

from app.auth import get_current_active_user
from app.services.ai_service import AIService
from app.config import settings

router = APIRouter(prefix='/explorer', tags=['Dataset Explorer'])
ai_service = AIService()

# Store uploaded datasets
uploaded_datasets = {}

class ExplorerQuery(BaseModel):
    datasetId: str
    query: str

@router.post('/upload')
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        # Generate dataset ID
        dataset_id = str(uuid.uuid4())
        
        # Save file
        file_path = settings.UPLOAD_DIR / f"{dataset_id}_{file.filename}"
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Store dataset
        uploaded_datasets[dataset_id] = {
            'name': file.filename,
            'dataframe': df,
            'file_path': str(file_path),
            'user_id': current_user['id'],
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
        analysis = await ai_service.analyze_csv(df_info)
        
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
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/query')
async def query_dataset(
    query_input: ExplorerQuery,
    current_user: dict = Depends(get_current_active_user)
):
    dataset = uploaded_datasets.get(query_input.datasetId)
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
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
    answer = await ai_service.query_csv(query_input.query, df_info)
    
    return {'answer': answer}

@router.get('/datasets')
async def get_datasets(current_user: dict = Depends(get_current_active_user)):
    user_datasets = []
    for dataset_id, dataset_data in uploaded_datasets.items():
        if dataset_data['user_id'] == current_user['id']:
            df = dataset_data['dataframe']
            user_datasets.append({
                'id': dataset_id,
                'name': dataset_data['name'],
                'rows': len(df),
                'columns': len(df.columns),
                'uploadedAt': dataset_data['uploadedAt']
            })
    return user_datasets