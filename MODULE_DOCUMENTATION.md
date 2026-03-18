# AI Data Intelligence Platform - Module Documentation

Complete guide to all 4 modules and their capabilities.

---

## 📊 Module 1: Data Copilot

### Overview
Data Copilot allows you to interact with your database using natural language. No SQL knowledge required!

### What It Does
- **Natural Language to SQL**: Simply ask questions in plain English (or Hindi/Spanish)
- **Automatic SQL Generation**: AI converts your question into valid SQL queries using Gemini 3 Flash
- **Smart Execution**: Runs the query on your SQLite sales database
- **Intelligent Visualization**: Automatically selects the best chart type (bar, line, pie) for your data
- **AI Insights**: Generates business insights and analysis from your results
- **Query History**: Saves your past queries for easy access

### Features
1. **Natural Language Queries**
   - Type your question in plain language
   - Example: "Show monthly sales revenue by region"
   - AI understands intent and context

2. **SQL Generation with Validation**
   - Generates complete, valid SQL queries
   - Includes proper SELECT, FROM, WHERE, GROUP BY, ORDER BY clauses
   - Validates query before execution
   - Auto-retry on failure with improved query

3. **Automatic Chart Selection**
   - Time series data → Line chart
   - Categories + numbers → Bar chart
   - Parts of whole → Pie chart
   - AI recommends best visualization

4. **Interactive Dashboards**
   - Beautiful Recharts visualizations
   - Interactive tooltips
   - Color-coded data
   - Responsive design

5. **AI-Generated Insights**
   - 2-3 key findings from your data
   - Trend analysis
   - Notable patterns
   - Actionable recommendations

6. **Data Table View**
   - Shows first 10 rows of results
   - Full dataset indicator
   - Formatted numbers

7. **Recent Queries**
   - Last 5 queries saved
   - Click to rerun
   - Quick access to common queries

### Example Queries
```
"Top 5 products by revenue"
"Show monthly sales revenue by region"
"Compare revenue between regions"
"Sales trend over the past year"
"Total revenue for each product"
"Average sales per region"
```

### Technical Details
- **Database**: SQLite with 5,093 sales records
- **Schema**: sales table (id, date, region, product, revenue, quantity)
- **LLM**: Gemini 3 Flash for SQL generation
- **Validation**: Multi-step validation with retry logic
- **Storage**: Query history saved to MongoDB

---

## 📂 Module 2: Dataset Explorer

### Overview
Upload your own CSV files and get instant analysis with automatic visualizations and AI-powered Q&A.

### What It Does
- **CSV Upload**: Drag & drop or browse to upload files
- **Automatic Analysis**: AI analyzes your dataset structure
- **Dataset Profiling**: Shows rows, columns, data types, statistics
- **Auto Visualizations**: Creates charts automatically based on data
- **Natural Language Q&A**: Ask questions about your uploaded data
- **Multi-Dataset Support**: Upload and analyze multiple files

### Features
1. **CSV File Upload**
   - Simple drag-and-drop interface
   - Browse from local files or drive
   - Supports any CSV format
   - Max file size: 50MB
   - Instant processing

2. **Automatic Dataset Analysis**
   - Row and column count
   - Data type detection
   - Missing values analysis
   - Statistical summary (mean, min, max, std)
   - AI-generated dataset description

3. **Automatic Visualizations**
   - **Distribution Charts**: For numeric columns (top 3)
     - Shows value distribution
     - Bar chart format
   - **Category Breakdown**: For categorical columns (top 2)
     - Pie chart format
     - Shows proportions

4. **Statistical Overview**
   - Mean, median, mode
   - Min, max values
   - Standard deviation
   - Quartiles
   - For all numeric columns

5. **Natural Language Q&A**
   - Ask questions about your data
   - Examples:
     - "What are the top 5 values?"
     - "Summarize the key statistics"
     - "What trends do you see?"
   - AI understands your dataset context
   - Provides clear, concise answers

6. **Dataset Management**
   - View all uploaded datasets
   - Track upload history
   - Per-user dataset storage
   - Easy dataset selection

### Example Use Cases
```
Upload: customer_data.csv
Ask: "What's the average customer age?"

Upload: inventory.csv
Ask: "Which products are low in stock?"

Upload: transactions.csv
Ask: "What's the total revenue by category?"
```

### Technical Details
- **Processing**: Pandas for data analysis
- **Storage**: In-memory + file system
- **Analysis**: AI-powered with Gemini 3 Flash
- **Visualizations**: Automatic chart generation
- **Q&A**: Context-aware natural language processing

---

## 🔍 Module 3: Data Detective

### Overview
Detect anomalies, outliers, and suspicious patterns in your data using machine learning algorithms.

### What It Does
- **Outlier Detection**: Find unusual data points using Isolation Forest
- **Time-Series Anomalies**: Detect anomalies in time-based data
- **Pattern Analysis**: Identify suspicious activities
- **Automatic Visualization**: See anomalies highlighted in charts
- **Statistical Analysis**: Get detailed anomaly statistics

### Features
1. **Outlier Detection**
   - **Algorithm**: Isolation Forest (scikit-learn)
   - **Contamination**: Configurable (default 10%)
   - **Multi-dimensional**: Analyzes multiple columns
   - **Scoring**: Anomaly scores for each record

2. **Time-Series Anomaly Detection**
   - **Method**: Rolling statistics with threshold
   - **Window**: Configurable (default 7 days)
   - **Threshold**: 2 standard deviations
   - **Trend Analysis**: Detects deviation from normal patterns

3. **Anomaly Statistics**
   - Total records analyzed
   - Number of anomalies found
   - Anomaly percentage
   - Columns analyzed
   - Anomaly scores

4. **Visualization**
   - Anomalies highlighted in charts
   - Upper and lower bounds shown
   - Rolling mean displayed
   - Color-coded anomaly points

5. **Detailed Reports**
   - List of anomalous records
   - Top 10 outliers shown
   - Full data export option
   - Timestamp information

### How It Works
1. **Upload CSV file**
2. **Click "Detect Outliers"**
3. **View Results**:
   - Statistics card
   - Anomaly table
   - Visualization

### Example Use Cases
```
Fraud Detection: Find suspicious transactions
Quality Control: Detect defective products
System Monitoring: Identify unusual system behavior
Sales Analysis: Find unusual sales patterns
```

### Technical Details
- **ML Algorithm**: Isolation Forest
- **Library**: scikit-learn
- **Preprocessing**: StandardScaler for normalization
- **Features**: All numeric columns
- **Output**: Anomaly indices, scores, visualizations

---

## 🧠 Module 4: Decision Intelligence

### Overview
Get AI-powered business recommendations, forecasts, and predictive analytics to make better decisions.

### What It Does
- **Time-Series Forecasting**: Predict future values
- **Business Recommendations**: AI-generated insights
- **What-If Analysis**: Explore different scenarios
- **Trend Analysis**: Understand data trends
- **Correlation Analysis**: Find relationships between variables

### Features
1. **Time-Series Forecasting**
   - **Method**: Linear Regression
   - **Periods**: Configurable (1-90 days)
   - **Confidence Intervals**: Upper and lower bounds
   - **Trend Detection**: Increasing/decreasing trends
   - **Visualization**: Historical + forecast chart

2. **Business Recommendations**
   - **Analysis Types**:
     - Correlation analysis
     - Trend detection
     - Top performers identification
     - Opportunity detection
   - **Priority Levels**: High, Medium, Low
   - **Actionable Insights**: Clear next steps

3. **What-If Analysis**
   - Change a variable by percentage
   - See projected impact on related variables
   - Based on correlation analysis
   - Multiple scenario comparison

4. **Forecasting Metrics**
   - R² score (model accuracy)
   - Trend direction
   - Average change per period
   - Confidence intervals (95%)

5. **Recommendation Categories**
   - **Trend**: Recent performance analysis
   - **Opportunity**: Growth areas identified
   - **Correlation**: Strong relationships found
   - **Risk**: Potential issues highlighted

### Example Outputs

**Forecast:**
```
Next 5 days revenue prediction:
Day 1: $15,000 (±$2,000)
Day 2: $15,500 (±$2,000)
...
Trend: Increasing (+$200/day)
```

**Recommendations:**
```
1. HIGH PRIORITY
   Insight: Sales showing upward trend in Q1 2024
   Action: Increase inventory to meet projected demand

2. MEDIUM PRIORITY
   Insight: Laptop category shows 25% higher margins
   Action: Focus marketing on high-margin products
```

### Technical Details
- **Forecasting**: scikit-learn Linear Regression
- **Analysis**: Pandas statistical functions
- **Correlation**: Pearson correlation coefficient
- **Visualization**: Recharts with forecast overlay
- **AI**: Gemini 3 Flash for recommendations

---

## 🎯 Common Features Across All Modules

### 1. Authentication
- All modules require login
- JWT token-based authentication
- Session persistence
- Protected API routes

### 2. Multi-Language Support
- English (EN)
- Hindi (HI)
- Spanish (ES)
- Instant language switching
- All UI elements translated

### 3. Dark Mode
- Light and dark themes
- Automatic persistence
- Professional color schemes
- Accessible contrast ratios

### 4. Activity Tracking
- All queries saved
- Dataset uploads tracked
- Activity visible in profile
- Query history accessible

### 5. Professional UI
- Modern SaaS design
- Responsive layout
- Loading states
- Error handling
- Toast notifications

---

## 🔧 Technical Stack

### Frontend
- **Framework**: React 19
- **Routing**: React Router
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **i18n**: react-i18next
- **HTTP**: Axios
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (data) + MongoDB (users/history)
- **AI/ML**: 
  - Gemini 3 Flash (LLM)
  - scikit-learn (ML algorithms)
  - Pandas (data analysis)
- **Authentication**: JWT (python-jose)
- **File Upload**: multipart/form-data

### AI Integration
- **Provider**: Google Gemini via Emergent Integrations
- **Model**: Gemini 3 Flash Preview
- **Use Cases**:
  - Natural language to SQL
  - Chart recommendation
  - Insight generation
  - Dataset analysis
  - Business recommendations

---

## 📖 Quick Start Guide

### For Users

1. **Register**: Create professional profile with role and organization
2. **Login**: Access your personalized dashboard
3. **Choose Module**: Select based on your need
4. **Explore**: Use natural language, upload files, or analyze data
5. **View Profile**: Track your activity and queries

### For Each Module

**Data Copilot:**
1. Type natural language question
2. Click "Ask AI"
3. View SQL, chart, and insights

**Dataset Explorer:**
1. Upload CSV file
2. View automatic analysis
3. Ask questions about data

**Data Detective:**
1. Upload dataset
2. Click "Detect Outliers"
3. View anomaly report

**Decision Intelligence:**
1. Select dataset
2. Click "Generate Recommendations"
3. View insights and forecasts

---

## 🎓 Best Practices

### Data Copilot
- Be specific in queries
- Use clear, simple language
- Check generated SQL for understanding
- Save useful queries for later

### Dataset Explorer
- Use clean, well-formatted CSVs
- Include column headers
- Avoid special characters in column names
- Keep files under 50MB

### Data Detective
- Use datasets with numeric values
- Ensure time-based data has date column
- Review anomaly scores
- Investigate flagged records

### Decision Intelligence
- Use historical data for forecasting
- Verify correlations make business sense
- Test multiple what-if scenarios
- Combine with domain knowledge

---

## 🆘 Troubleshooting

**SQL Generation Issues:**
- Simplify your question
- Be more specific about data
- Check if table/column names are correct

**CSV Upload Failures:**
- Verify file is .csv format
- Check file size < 50MB
- Ensure proper encoding (UTF-8)

**Anomaly Detection:**
- Ensure numeric columns exist
- Check for missing values
- Adjust contamination parameter

**Forecasting:**
- Verify time-series data format
- Ensure sufficient historical data
- Check date column format

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review example queries
3. Contact platform support
4. Check settings for API status

---

**Version**: 2.0
**Last Updated**: March 2026
**Platform**: AI Data Intelligence Platform
