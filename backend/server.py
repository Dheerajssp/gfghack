from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize sales database
from database import init_database
init_database()

# Create FastAPI app
app = FastAPI(
    title="AI Data Intelligence Platform",
    description="Professional analytics platform with AI-powered insights",
    version="2.0.0"
)

# Import routes
from app.routes import auth_routes, copilot_routes, dataset_routes, detective_routes, decision_routes, profile_routes

# Include routers
app.include_router(auth_routes.router, prefix="/api")
app.include_router(copilot_routes.router, prefix="/api")
app.include_router(dataset_routes.router, prefix="/api")
app.include_router(detective_routes.router, prefix="/api")
app.include_router(decision_routes.router, prefix="/api")
app.include_router(profile_routes.router, prefix="/api")

# CORS middleware
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

# Root endpoint
@app.get("/api/")
async def root():
    return {
        "message": "AI Data Intelligence Platform API",
        "version": "2.0.0",
        "status": "operational"
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down AI Data Intelligence Platform")
