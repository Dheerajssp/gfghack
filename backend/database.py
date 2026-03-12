import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(__file__), 'sales.db')

def init_database():
    """Initialize SQLite database with sample sales data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create sales table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            region TEXT NOT NULL,
            product TEXT NOT NULL,
            revenue REAL NOT NULL,
            quantity INTEGER NOT NULL
        )
    ''')
    
    # Check if data already exists
    cursor.execute('SELECT COUNT(*) FROM sales')
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Generate sample data
        regions = ['North', 'South', 'East', 'West']
        products = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones']
        
        start_date = datetime(2024, 1, 1)
        sales_data = []
        
        for i in range(365):
            current_date = start_date + timedelta(days=i)
            for region in regions:
                for product in products:
                    if random.random() > 0.3:  # 70% chance of sale
                        quantity = random.randint(1, 50)
                        base_price = {'Laptop': 800, 'Mouse': 25, 'Keyboard': 60, 'Monitor': 300, 'Headphones': 80}
                        revenue = base_price[product] * quantity * random.uniform(0.9, 1.1)
                        sales_data.append((
                            current_date.strftime('%Y-%m-%d'),
                            region,
                            product,
                            round(revenue, 2),
                            quantity
                        ))
        
        cursor.executemany(
            'INSERT INTO sales (date, region, product, revenue, quantity) VALUES (?, ?, ?, ?, ?)',
            sales_data
        )
        conn.commit()
        print(f"Initialized database with {len(sales_data)} sales records")
    
    conn.close()

def get_db_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_table_schema():
    """Get database schema information"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    schema = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        schema[table_name] = [{'name': col[1], 'type': col[2]} for col in columns]
    
    conn.close()
    return schema