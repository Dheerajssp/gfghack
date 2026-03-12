from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import uuid
from datetime import datetime, timezone

from app.auth import get_current_active_user
from app.services.ml_service import MLService
from app.config import settings

router = APIRouter(prefix='/detective', tags=['Data Detective'])
ml_service = MLService()

# Store uploaded datasets for detective analysis
detective_datasets = {}

class DetectiveAnalysisRequest(BaseModel):
    dataset_id: str
    analysis_type: str  # 'outliers', 'time_series_anomalies'
    options: dict = {}

@router.post('/upload')
async def upload_dataset_for_detective(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    try:
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(pd.io.common.BytesIO(contents))
        
        # Generate dataset ID
        dataset_id = str(uuid.uuid4())
        
        # Store dataset
        detective_datasets[dataset_id] = {
            'name': file.filename,
            'dataframe': df,
            'user_id': current_user['id'],
            'uploaded_at': datetime.now(timezone.utc).isoformat()
        }
        
        return {
            'dataset_id': dataset_id,
            'name': file.filename,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'uploaded_at': detective_datasets[dataset_id]['uploaded_at']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/analyze/outliers')
async def detect_outliers(
    request: DetectiveAnalysisRequest,
    current_user: dict = Depends(get_current_active_user)
):
    dataset = detective_datasets.get(request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
    df = dataset['dataframe']
    columns = request.options.get('columns', None)
    contamination = request.options.get('contamination', 0.1)
    
    result = ml_service.detect_outliers(df, columns, contamination)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.post('/analyze/time-series')
async def detect_time_series_anomalies(
    request: DetectiveAnalysisRequest,
    current_user: dict = Depends(get_current_active_user)
):
    dataset = detective_datasets.get(request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
    df = dataset['dataframe']
    date_column = request.options.get('date_column')
    value_column = request.options.get('value_column')
    window = request.options.get('window', 7)
    
    if not date_column or not value_column:
        raise HTTPException(
            status_code=400,
            detail='date_column and value_column are required'
        )
    
    result = ml_service.detect_time_series_anomalies(df, date_column, value_column, window)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.get('/datasets')
async def get_detective_datasets(current_user: dict = Depends(get_current_active_user)):
    user_datasets = []
    for dataset_id, data in detective_datasets.items():
        if data['user_id'] == current_user['id']:
            df = data['dataframe']
            user_datasets.append({
                'id': dataset_id,
                'name': data['name'],
                'rows': len(df),
                'columns': len(df.columns),
                'uploaded_at': data['uploaded_at']
            })
    return user_datasets