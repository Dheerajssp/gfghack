from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
from pathlib import Path

from app.auth import get_current_active_user, get_password_hash, verify_password
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix='/profile', tags=['Profile'])

# MongoDB connection
mongo_client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = mongo_client[os.environ['DB_NAME']]

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    country: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

@router.get('/me')
async def get_my_profile(current_user: dict = Depends(get_current_active_user)):
    """Get current user's complete profile with activity stats"""
    
    # Get activity stats
    query_count = await db.query_history.count_documents({'user_id': current_user['id']})
    dataset_count = await db.datasets.count_documents({'user_id': current_user['id']}) if 'datasets' in await db.list_collection_names() else 0
    
    # Get recent activity
    recent_queries = await db.query_history.find(
        {'user_id': current_user['id']},
        {'_id': 0, 'query_text': 1, 'created_at': 1}
    ).sort('created_at', -1).limit(5).to_list(5)
    
    profile = {
        **current_user,
        'activity': {
            'total_queries': query_count,
            'total_datasets': dataset_count,
            'recent_queries': recent_queries
        }
    }
    
    return profile

@router.put('/me')
async def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update current user's profile"""
    
    update_fields = {}
    if profile_data.full_name:
        update_fields['full_name'] = profile_data.full_name
    if profile_data.bio is not None:
        update_fields['bio'] = profile_data.bio
    if profile_data.organization is not None:
        update_fields['organization'] = profile_data.organization
    if profile_data.role:
        update_fields['role'] = profile_data.role
    if profile_data.country:
        update_fields['country'] = profile_data.country
    
    if update_fields:
        update_fields['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.users.update_one(
            {'id': current_user['id']},
            {'$set': update_fields}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({'id': current_user['id']}, {'_id': 0, 'hashed_password': 0})
    
    return {'message': 'Profile updated successfully', 'user': updated_user}

@router.post('/photo')
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload profile photo"""
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Only JPEG, PNG, and WebP images are allowed'
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = settings.UPLOAD_DIR / 'profiles'
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user['id']}_{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / filename
    
    # Save file
    contents = await file.read()
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    # Get backend URL from environment
    backend_url = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    # Update user profile with photo URL
    photo_url = f'{backend_url}/uploads/profiles/{filename}'
    await db.users.update_one(
        {'id': current_user['id']},
        {'$set': {
            'profile_image_url': photo_url,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        'message': 'Profile photo uploaded successfully',
        'photo_url': photo_url
    }

@router.post('/password')
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_active_user)
):
    """Change user password"""
    
    # Validate passwords match
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='New passwords do not match'
        )
    
    # Get current user with password
    user = await db.users.find_one({'id': current_user['id']})
    
    # Verify current password
    if not user.get('hashed_password'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Cannot change password for OAuth users'
        )
    
    if not verify_password(password_data.current_password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Current password is incorrect'
        )
    
    # Update password
    new_hashed_password = get_password_hash(password_data.new_password)
    await db.users.update_one(
        {'id': current_user['id']},
        {'$set': {
            'hashed_password': new_hashed_password,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {'message': 'Password changed successfully'}

@router.get('/stats')
async def get_profile_stats(current_user: dict = Depends(get_current_active_user)):
    """Get detailed activity statistics"""
    
    # Query history stats
    total_queries = await db.query_history.count_documents({'user_id': current_user['id']})
    
    # Dataset stats
    total_datasets = 0
    if 'datasets' in await db.list_collection_names():
        total_datasets = await db.datasets.count_documents({'user_id': current_user['id']})
    
    # Get recent activity timeline
    recent_activity = []
    
    # Recent queries
    queries = await db.query_history.find(
        {'user_id': current_user['id']},
        {'_id': 0, 'query_text': 1, 'created_at': 1, 'chart_type': 1}
    ).sort('created_at', -1).limit(10).to_list(10)
    
    for q in queries:
        recent_activity.append({
            'type': 'query',
            'description': q.get('query_text', 'Query'),
            'timestamp': q.get('created_at'),
            'meta': {'chart_type': q.get('chart_type')}
        })
    
    # Sort by timestamp
    recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {
        'total_queries': total_queries,
        'total_datasets': total_datasets,
        'recent_activity': recent_activity[:10]
    }
