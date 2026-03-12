from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    create_user,
    get_user_by_email,
    create_oauth_user
)
from app.config import settings

router = APIRouter(prefix='/auth', tags=['Authentication'])

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str
    full_name: str = None
    country: str = None
    organization: str = None
    role: str = None
    bio: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class OAuthLogin(BaseModel):
    email: EmailStr
    oauth_provider: str
    oauth_id: str
    full_name: str = None

@router.post('/register', response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    # Validate passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Passwords do not match'
        )
    
    # Check if user exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered'
        )
    
    # Create user
    user = await create_user(
        email=user_data.email,
        username=user_data.username,
        password=user_data.password,
        full_name=user_data.full_name,
        country=user_data.country,
        organization=user_data.organization,
        role=user_data.role,
        bio=user_data.bio
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user['id']},
        expires_delta=access_token_expires
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': user
    }

@router.post('/login', response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect email or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user['id']},
        expires_delta=access_token_expires
    )
    
    # Remove sensitive data
    user_safe = {k: v for k, v in user.items() if k != 'hashed_password'}
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': user_safe
    }

@router.post('/oauth/google', response_model=Token)
async def google_oauth(oauth_data: OAuthLogin):
    # Check if user exists
    user = await get_user_by_email(oauth_data.email)
    
    if not user:
        # Create new OAuth user
        user = await create_oauth_user(
            email=oauth_data.email,
            oauth_provider=oauth_data.oauth_provider,
            oauth_id=oauth_data.oauth_id,
            full_name=oauth_data.full_name
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user['id']},
        expires_delta=access_token_expires
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': user
    }

@router.get('/me')
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    return current_user