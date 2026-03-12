from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd

from app.auth import get_current_active_user
from app.services.ml_service import MLService

router = APIRouter(prefix='/decision', tags=['Decision Intelligence'])
ml_service = MLService()

# Use datasets from detective or explorer
from app.routes.detective_routes import detective_datasets
from app.routes.dataset_routes import uploaded_datasets

class ForecastRequest(BaseModel):
    dataset_id: str
    source: str  # 'detective' or 'explorer'
    date_column: str
    value_column: str
    periods: int = 30

class RecommendationRequest(BaseModel):
    dataset_id: str
    source: str
    target_column: str

@router.post('/forecast')
async def forecast_time_series(
    request: ForecastRequest,
    current_user: dict = Depends(get_current_active_user)
):
    # Get dataset from appropriate source
    if request.source == 'detective':
        dataset = detective_datasets.get(request.dataset_id)
    else:
        dataset = uploaded_datasets.get(request.dataset_id)
    
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
    df = dataset['dataframe']
    
    result = ml_service.forecast_time_series(
        df,
        request.date_column,
        request.value_column,
        request.periods
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.post('/recommendations')
async def generate_recommendations(
    request: RecommendationRequest,
    current_user: dict = Depends(get_current_active_user)
):
    # Get dataset from appropriate source
    if request.source == 'detective':
        dataset = detective_datasets.get(request.dataset_id)
    else:
        dataset = uploaded_datasets.get(request.dataset_id)
    
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
    df = dataset['dataframe']
    
    result = ml_service.generate_recommendations(df, request.target_column)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.post('/what-if')
async def what_if_analysis(
    dataset_id: str,
    source: str,
    column: str,
    change_percentage: float,
    current_user: dict = Depends(get_current_active_user)
):
    # Get dataset
    if source == 'detective':
        dataset = detective_datasets.get(dataset_id)
    else:
        dataset = uploaded_datasets.get(dataset_id)
    
    if not dataset:
        raise HTTPException(status_code=404, detail='Dataset not found')
    
    df = dataset['dataframe'].copy()
    
    if column not in df.columns:
        raise HTTPException(status_code=400, detail=f'Column {column} not found')
    
    # Perform what-if analysis
    original_value = df[column].mean()
    new_value = original_value * (1 + change_percentage / 100)
    
    # Simple impact calculation
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    impacts = {}
    
    for col in numeric_cols:
        if col != column:
            correlation = df[column].corr(df[col])
            if abs(correlation) > 0.3:
                expected_change = correlation * change_percentage
                impacts[col] = {
                    'correlation': float(correlation),
                    'expected_change_percent': float(expected_change),
                    'current_avg': float(df[col].mean()),
                    'projected_avg': float(df[col].mean() * (1 + expected_change / 100))
                }
    
    return {
        'success': True,
        'column': column,
        'change_percentage': change_percentage,
        'original_avg': float(original_value),
        'new_avg': float(new_value),
        'impacts': impacts
    }