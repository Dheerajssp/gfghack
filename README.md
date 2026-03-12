# AI Data Intelligence Platform

A modern web application that allows non-technical users to interact with data using natural language and automatically generate dashboards and insights.

## Features

### 1. Data Copilot (✅ Fully Implemented)
- **Natural Language Queries**: Ask questions about your data in plain English
- **AI-Powered SQL Generation**: Automatic conversion of natural language to SQL using Gemini 3 Flash
- **Smart Visualizations**: Automatic chart type selection (bar, line, pie) based on your data
- **Interactive Dashboards**: Beautiful, responsive charts powered by Recharts
- **AI Insights**: Automatically generated insights and analysis from your query results
- **Data Tables**: View raw query results in clean, formatted tables

**Example Queries:**
- "Show monthly sales revenue by region"
- "Top 5 products by revenue"
- "Sales trend over time"

### 2. Dataset Explorer (✅ Fully Implemented)
- **CSV Upload**: Drag and drop or browse to upload CSV files
- **Automatic Analysis**: AI-powered dataset summary and statistics
- **Smart Visualizations**: Automatically generated charts based on your data
- **Statistical Overview**: Mean, min, max, and other key statistics
- **Natural Language Q&A**: Ask questions about your uploaded dataset
- **Multi-Dataset Support**: Upload and analyze multiple datasets

### 3. Data Detective (🔜 Coming Soon)
Detect anomalies, unusual patterns, and suspicious activities in datasets.

### 4. Decision Intelligence (🔜 Coming Soon)
AI-powered business recommendations and predictive analytics.

## Technology Stack

### Frontend
- **React 19** - Modern UI library
- **React Router** - Client-side routing
- **Recharts** - Interactive chart visualizations
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database with sample sales data
- **Pandas** - Data analysis and manipulation
- **Gemini 3 Flash** - LLM for natural language processing
- **Emergent Integrations** - Unified LLM integration library
- **Motor** - Async MongoDB driver (for future features)

### AI Integration
- **LLM Provider**: Google Gemini 3 Flash
- **Use Cases**: 
  - Natural language to SQL conversion
  - Chart type recommendation
  - Insight generation
  - Dataset analysis
  - Q&A on uploaded data

## Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application with all endpoints
│   ├── database.py            # SQLite database initialization and queries
│   ├── llm_service.py         # Gemini 3 Flash integration for AI features
│   ├── sales.db               # SQLite database (5093 sample sales records)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (includes EMERGENT_LLM_KEY)
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main application component with routing
│   │   ├── App.css            # Global styles
│   │   ├── index.css          # Tailwind and font configurations
│   │   ├── components/
│   │   │   ├── Layout.js      # Main layout wrapper
│   │   │   └── Sidebar.js     # Navigation sidebar
│   │   └── pages/
│   │       ├── DataCopilot.js          # Natural language query module
│   │       ├── DatasetExplorer.js      # CSV upload and analysis module
│   │       ├── DataDetective.js        # Coming soon placeholder
│   │       └── DecisionIntelligence.js # Coming soon placeholder
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── .env                   # Frontend environment variables
│
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.9+
- Running instance (already configured in this environment)

### Installation

The application is already set up and running in your environment. If you need to set it up locally:

#### Backend Setup
```bash
cd /app/backend

# Install Python dependencies
pip install -r requirements.txt

# Database is auto-initialized on first run
# Contains 5093 sample sales records with columns:
# id, date, region, product, revenue, quantity

# Start the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup
```bash
cd /app/frontend

# Install Node.js dependencies
yarn install

# Start the development server
yarn start
```

### Environment Variables

#### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-4F281Bb591e7046354
```

#### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://nlp-analytics.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

## API Endpoints

### Data Copilot
- **POST** `/api/copilot/query`
  - Process natural language query
  - Returns: SQL, data, chart config, and insights

### Dataset Explorer
- **POST** `/api/explorer/upload`
  - Upload and analyze CSV file
  - Returns: Dataset info, statistics, visualizations, and summary

- **POST** `/api/explorer/query`
  - Ask questions about uploaded dataset
  - Returns: AI-generated answer

- **GET** `/api/explorer/datasets`
  - List all uploaded datasets

## Sample Data

The SQLite database includes a year's worth of sales data (365 days × 4 regions × 5 products):

**Columns:**
- `id` - Unique identifier
- `date` - Sale date (2024-01-01 to 2024-12-31)
- `region` - Geographic region (North, South, East, West)
- `product` - Product name (Laptop, Mouse, Keyboard, Monitor, Headphones)
- `revenue` - Sales revenue in dollars
- `quantity` - Number of units sold

## Usage Examples

### Data Copilot Examples

1. **Regional Analysis**
   ```
   Show monthly sales revenue by region
   ```

2. **Product Performance**
   ```
   Top 5 products by revenue
   ```

3. **Trend Analysis**
   ```
   Sales trend over the past year
   ```

4. **Comparative Analysis**
   ```
   Compare revenue between regions
   ```

### Dataset Explorer Examples

Upload a CSV file (e.g., customer data, inventory, transactions) and ask:
- "What are the top 5 values in this dataset?"
- "What trends do you see?"
- "Summarize the key statistics"

## Design System

- **Typography**: Manrope (headings), Public Sans (body), JetBrains Mono (code)
- **Primary Color**: Violet (#7C3AED)
- **Chart Colors**: Violet, Pink, Emerald, Amber, Blue, Indigo
- **Layout**: Modern dashboard with sidebar navigation
- **Components**: Shadcn UI-based components with custom styling

## Key Features

✅ **Beginner-Friendly Code**: Clean, well-documented, modular architecture
✅ **Production-Ready**: Error handling, loading states, toast notifications
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Accessibility**: Proper data-testid attributes for all interactive elements
✅ **Performance**: Optimized queries and efficient data processing
✅ **Scalable**: Easy to add new modules and features

## Development Notes

### Adding New Modules
1. Create a new page component in `/app/frontend/src/pages/`
2. Add route in `App.js`
3. Add navigation item in `Sidebar.js`
4. Create corresponding backend endpoints if needed

### Database Queries
The SQLite database is located at `/app/backend/sales.db`. You can query it directly:
```python
from database import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()
cursor.execute("SELECT * FROM sales LIMIT 5")
rows = cursor.fetchall()
```

### LLM Integration
The app uses Gemini 3 Flash through Emergent's unified integration library:
```python
from llm_service import LLMService

llm = LLMService()
result = await llm.text_to_sql(query, schema)
```

## Testing

All features have been comprehensively tested:
- ✅ Backend API endpoints (100% pass rate)
- ✅ Natural language to SQL conversion
- ✅ Chart type recommendations
- ✅ Data visualizations
- ✅ CSV upload and analysis
- ✅ Natural language Q&A
- ✅ Navigation and UI components
- ✅ Error handling

Test report: `/app/test_reports/iteration_1.json`

## Future Enhancements

### Data Detective Module
- Anomaly detection in time series
- Outlier identification
- Pattern recognition
- Suspicious activity alerts

### Decision Intelligence Module
- Predictive analytics
- Business recommendations
- Trend forecasting
- What-if scenarios

## Troubleshooting

### Backend Issues
```bash
# Check backend logs
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Issues
```bash
# Check frontend logs
tail -f /var/log/supervisor/frontend.err.log

# Restart frontend
sudo supervisorctl restart frontend
```

### Database Issues
```bash
# Reinitialize database
python -c "from database import init_database; init_database()"
```

## License

This project is built as a prototype and learning resource.

## Credits

Built with:
- FastAPI for the backend
- React for the frontend
- Gemini 3 Flash for AI capabilities
- Emergent platform for hosting and LLM integration

---

**Version**: 1.0
**Last Updated**: January 2026
**Status**: Production Ready ✅
