from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid

from app.config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

# MongoDB connection for auth data
mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
db = mongo_client[settings.DB_NAME]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_user_by_email(email: str):
    return await db.users.find_one({'email': email}, {'_id': 0})

async def get_user_by_id(user_id: str):
    return await db.users.find_one({'id': user_id}, {'_id': 0})

async def create_user(email: str, username: str, password: str, full_name: str = None):
    user_dict = {
        'id': str(uuid.uuid4()),
        'email': email,
        'username': username,
        'hashed_password': get_password_hash(password),
        'full_name': full_name or username,
        'is_active': True,
        'is_admin': False,
        'oauth_provider': None,
        'oauth_id': None,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_dict)
    # Remove MongoDB's _id and hashed_password before returning
    user_response = {k: v for k, v in user_dict.items() if k not in ['hashed_password', '_id']}
    return user_response

async def create_oauth_user(email: str, oauth_provider: str, oauth_id: str, full_name: str = None):
    user_dict = {
        'id': str(uuid.uuid4()),
        'email': email,
        'username': email.split('@')[0],
        'hashed_password': None,
        'full_name': full_name or email.split('@')[0],
        'is_active': True,
        'is_admin': False,
        'oauth_provider': oauth_provider,
        'oauth_id': oauth_id,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_dict)
    # Remove MongoDB's _id and hashed_password before returning
    user_response = {k: v for k, v in user_dict.items() if k not in ['hashed_password', '_id']}
    return user_response

async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return False
    if not user.get('hashed_password'):
        return False  # OAuth user
    if not verify_password(password, user['hashed_password']):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_active'):
        raise HTTPException(status_code=400, detail='Inactive user')
    return current_user