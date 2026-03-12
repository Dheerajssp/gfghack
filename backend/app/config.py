import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/data_intelligence')
    MONGO_URL = os.getenv('MONGO_URL')
    DB_NAME = os.getenv('DB_NAME')
    
    # Authentication
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # AI/LLM
    EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Upload
    UPLOAD_DIR = ROOT_DIR / 'uploads'
    MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
    
settings = Settings()

# Create upload directory
settings.UPLOAD_DIR.mkdir(exist_ok=True)