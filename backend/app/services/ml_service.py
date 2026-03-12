import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any
import json

class MLService:
    
    def detect_outliers(self, df: pd.DataFrame, columns: List[str] = None, contamination: float = 0.1) -> Dict[str, Any]:
        """
        Detect outliers in dataset using Isolation Forest
        """
        try:
            # Select numeric columns
            if columns is None:
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            else:
                numeric_cols = [col for col in columns if col in df.columns and pd.api.types.is_numeric_dtype(df[col])]
            
            if not numeric_cols:
                return {
                    'success': False,
                    'error': 'No numeric columns found for outlier detection'
                }
            
            # Prepare data
            X = df[numeric_cols].fillna(df[numeric_cols].mean())
            
            # Standardize features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train Isolation Forest
            iso_forest = IsolationForest(contamination=contamination, random_state=42)
            predictions = iso_forest.fit_predict(X_scaled)
            
            # -1 for outliers, 1 for normal
            outlier_indices = np.where(predictions == -1)[0].tolist()
            outlier_scores = iso_forest.score_samples(X_scaled)
            
            # Get outlier data
            outliers = df.iloc[outlier_indices].to_dict('records')
            
            # Statistics
            stats = {
                'total_records': len(df),
                'outliers_found': len(outlier_indices),
                'outlier_percentage': round(len(outlier_indices) / len(df) * 100, 2),
                'columns_analyzed': numeric_cols
            }
            
            # Visualization data
            viz_data = []
            for col in numeric_cols[:3]:  # Limit to top 3 columns
                col_data = df[[col]].copy()
                col_data['is_outlier'] = predictions == -1
                
                viz_data.append({
                    'column': col,
                    'values': df[col].tolist(),
                    'outlier_indices': outlier_indices
                })
            
            return {
                'success': True,
                'outliers': outliers[:100],  # Limit to 100 outliers
                'outlier_indices': outlier_indices,
                'statistics': stats,
                'visualization_data': viz_data,
                'anomaly_scores': outlier_scores.tolist()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def detect_time_series_anomalies(self, df: pd.DataFrame, date_column: str, value_column: str, window: int = 7) -> Dict[str, Any]:
        """
        Detect anomalies in time series data using rolling statistics
        """
        try:
            # Ensure date column is datetime
            df[date_column] = pd.to_datetime(df[date_column])
            df = df.sort_values(date_column)
            
            # Calculate rolling statistics
            df['rolling_mean'] = df[value_column].rolling(window=window, center=True).mean()
            df['rolling_std'] = df[value_column].rolling(window=window, center=True).std()
            
            # Define threshold (2 standard deviations)
            threshold = 2
            df['is_anomaly'] = np.abs(df[value_column] - df['rolling_mean']) > (threshold * df['rolling_std'])
            
            # Get anomalies
            anomalies = df[df['is_anomaly']].to_dict('records')
            
            # Statistics
            stats = {
                'total_points': len(df),
                'anomalies_found': int(df['is_anomaly'].sum()),
                'anomaly_percentage': round(df['is_anomaly'].sum() / len(df) * 100, 2),
                'date_range': f"{df[date_column].min()} to {df[date_column].max()}"
            }
            
            # Visualization data
            viz_data = {
                'dates': df[date_column].dt.strftime('%Y-%m-%d').tolist(),
                'values': df[value_column].tolist(),
                'rolling_mean': df['rolling_mean'].fillna(0).tolist(),
                'upper_bound': (df['rolling_mean'] + threshold * df['rolling_std']).fillna(0).tolist(),
                'lower_bound': (df['rolling_mean'] - threshold * df['rolling_std']).fillna(0).tolist(),
                'is_anomaly': df['is_anomaly'].tolist()
            }
            
            return {
                'success': True,
                'anomalies': anomalies,
                'statistics': stats,
                'visualization_data': viz_data
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def forecast_time_series(self, df: pd.DataFrame, date_column: str, value_column: str, periods: int = 30) -> Dict[str, Any]:
        """
        Simple time series forecasting using linear regression
        """
        try:
            from sklearn.linear_model import LinearRegression
            
            # Prepare data
            df[date_column] = pd.to_datetime(df[date_column])
            df = df.sort_values(date_column).reset_index(drop=True)
            
            # Convert dates to numeric (days since start)
            df['days'] = (df[date_column] - df[date_column].min()).dt.days
            
            # Train model
            X = df[['days']].values
            y = df[value_column].values
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Make predictions for historical data
            historical_predictions = model.predict(X)
            
            # Forecast future
            last_day = df['days'].max()
            future_days = np.array([[last_day + i] for i in range(1, periods + 1)])
            future_predictions = model.predict(future_days)
            
            # Generate future dates
            last_date = df[date_column].max()
            future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=periods)
            
            # Calculate confidence intervals (simplified)
            residuals = y - historical_predictions
            std_error = np.std(residuals)
            
            forecast_data = {
                'dates': future_dates.strftime('%Y-%m-%d').tolist(),
                'predictions': future_predictions.tolist(),
                'upper_bound': (future_predictions + 1.96 * std_error).tolist(),
                'lower_bound': (future_predictions - 1.96 * std_error).tolist()
            }
            
            # Historical data for context
            historical_data = {
                'dates': df[date_column].dt.strftime('%Y-%m-%d').tolist(),
                'actual': y.tolist(),
                'fitted': historical_predictions.tolist()
            }
            
            # Statistics
            stats = {
                'forecast_periods': periods,
                'model_r2': float(model.score(X, y)),
                'trend': 'increasing' if model.coef_[0] > 0 else 'decreasing',
                'average_change': float(model.coef_[0])
            }
            
            return {
                'success': True,
                'forecast': forecast_data,
                'historical': historical_data,
                'statistics': stats
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_recommendations(self, df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """
        Generate business recommendations based on data analysis
        """
        try:
            recommendations = []
            
            # Analyze numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            
            for col in numeric_cols:
                if col == target_column:
                    continue
                
                # Calculate correlation
                if target_column in numeric_cols:
                    correlation = df[col].corr(df[target_column])
                    
                    if abs(correlation) > 0.7:
                        recommendations.append({
                            'type': 'correlation',
                            'priority': 'high',
                            'insight': f'{col} has strong correlation ({correlation:.2f}) with {target_column}',
                            'action': f'Focus on optimizing {col} to improve {target_column}'
                        })
            
            # Analyze trends
            if target_column in numeric_cols:
                recent_trend = df[target_column].tail(10).mean()
                overall_avg = df[target_column].mean()
                
                if recent_trend > overall_avg * 1.1:
                    recommendations.append({
                        'type': 'trend',
                        'priority': 'medium',
                        'insight': f'Recent {target_column} is 10% above average',
                        'action': 'Maintain current strategies and monitor for sustainability'
                    })
                elif recent_trend < overall_avg * 0.9:
                    recommendations.append({
                        'type': 'trend',
                        'priority': 'high',
                        'insight': f'Recent {target_column} is 10% below average',
                        'action': 'Investigate causes and implement corrective actions'
                    })
            
            # Top performers
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            if categorical_cols and target_column in numeric_cols:
                for cat_col in categorical_cols[:2]:
                    top_category = df.groupby(cat_col)[target_column].mean().nlargest(1)
                    if not top_category.empty:
                        recommendations.append({
                            'type': 'opportunity',
                            'priority': 'medium',
                            'insight': f'Top performing {cat_col}: {top_category.index[0]} with average {target_column} of {top_category.values[0]:.2f}',
                            'action': f'Replicate success patterns from {top_category.index[0]} in other areas'
                        })
            
            return {
                'success': True,
                'recommendations': recommendations[:5],  # Top 5 recommendations
                'summary': f'Generated {len(recommendations)} recommendations based on data analysis'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }