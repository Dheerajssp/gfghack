from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import sqlite3
import os
from pathlib import Path

# SQLite for data storage (keeping existing sales database)
SQLITE_DB_PATH = Path(__file__).parent.parent / 'sales.db'

def get_sqlite_connection():
    """Get SQLite connection for sales data"""
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_sales_database():
    """Initialize SQLite sales database"""
    from database import init_database
    init_database()

# SQLAlchemy Base for user/auth data (using MongoDB via Motor)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    oauth_provider = Column(String)  # 'google', 'github', etc.
    oauth_id = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class QueryHistory(Base):
    __tablename__ = 'query_history'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    query_text = Column(Text, nullable=False)
    sql_generated = Column(Text)
    chart_type = Column(String)
    insights = Column(Text)
    data = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Dataset(Base):
    __tablename__ = 'datasets'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    rows = Column(Integer)
    columns = Column(Integer)
    column_info = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SavedDashboard(Base):
    __tablename__ = 'saved_dashboards'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    query_ids = Column(JSON)  # List of query history IDs
    layout = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))