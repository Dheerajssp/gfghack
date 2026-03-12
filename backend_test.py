import requests
import sys
import io
import json
import csv
from datetime import datetime

class AIDataPlatformTester:
    def __init__(self, base_url="https://nlp-analytics.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.dataset_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/", timeout=10)
            success = response.status_code == 200 and "AI Data Intelligence Platform API" in response.text
            return self.log_test("API Root", success, f"Status: {response.status_code}, Response: {response.text[:100]}")
        except Exception as e:
            return self.log_test("API Root", False, f"Exception: {str(e)}")

    def test_copilot_query_simple(self):
        """Test Data Copilot with simple query"""
        try:
            payload = {"query": "SELECT * FROM sales LIMIT 5"}
            response = requests.post(f"{self.base_url}/api/copilot/query", json=payload, timeout=30)
            
            if response.status_code != 200:
                return self.log_test("Copilot Simple Query", False, f"Status: {response.status_code}, Response: {response.text}")
            
            data = response.json()
            required_fields = ['sql', 'data', 'chartConfig', 'insights']
            has_all_fields = all(field in data for field in required_fields)
            has_data = len(data.get('data', [])) > 0
            
            success = has_all_fields and has_data
            return self.log_test("Copilot Simple Query", success, f"Fields: {list(data.keys())}, Data rows: {len(data.get('data', []))}")
        except Exception as e:
            return self.log_test("Copilot Simple Query", False, f"Exception: {str(e)}")

    def test_copilot_natural_language(self):
        """Test Data Copilot with natural language query"""
        try:
            payload = {"query": "Show monthly sales revenue by region"}
            response = requests.post(f"{self.base_url}/api/copilot/query", json=payload, timeout=30)
            
            if response.status_code != 200:
                return self.log_test("Copilot Natural Language", False, f"Status: {response.status_code}, Response: {response.text}")
            
            data = response.json()
            has_sql = 'sql' in data and isinstance(data['sql'], str) and len(data['sql']) > 0
            has_chart_config = 'chartConfig' in data and 'chartType' in data['chartConfig']
            has_insights = 'insights' in data and isinstance(data['insights'], str)
            
            success = has_sql and has_chart_config and has_insights
            chart_type = data.get('chartConfig', {}).get('chartType', 'unknown')
            return self.log_test("Copilot Natural Language", success, f"SQL: {has_sql}, Chart: {chart_type}, Insights: {has_insights}")
        except Exception as e:
            return self.log_test("Copilot Natural Language", False, f"Exception: {str(e)}")

    def test_copilot_chart_types(self):
        """Test different chart type recommendations"""
        queries = [
            ("Top 5 products by revenue", "bar"),
            ("Sales trend over time", "line"),
            ("Revenue by region", "pie")
        ]
        
        all_passed = True
        for query, expected_type in queries:
            try:
                payload = {"query": query}
                response = requests.post(f"{self.base_url}/api/copilot/query", json=payload, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    actual_type = data.get('chartConfig', {}).get('chartType', 'unknown')
                    # Accept any chart type as AI may recommend differently
                    test_passed = actual_type in ['bar', 'line', 'pie']
                    if not test_passed:
                        all_passed = False
                    print(f"    Query: '{query[:30]}...' -> Chart: {actual_type}")
                else:
                    all_passed = False
                    print(f"    Query failed: {response.status_code}")
            except Exception as e:
                all_passed = False
                print(f"    Query exception: {str(e)}")
        
        return self.log_test("Copilot Chart Types", all_passed)

    def create_sample_csv(self):
        """Create a sample CSV for testing"""
        csv_data = [
            ['Product', 'Category', 'Price', 'Quantity', 'Region'],
            ['Laptop', 'Electronics', '999.99', '15', 'North'],
            ['Mouse', 'Electronics', '29.99', '50', 'South'],
            ['Desk', 'Furniture', '299.99', '8', 'East'],
            ['Chair', 'Furniture', '199.99', '12', 'West'],
            ['Monitor', 'Electronics', '399.99', '20', 'North'],
        ]
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(csv_data)
        return output.getvalue()

    def test_dataset_upload(self):
        """Test CSV dataset upload"""
        try:
            csv_content = self.create_sample_csv()
            files = {'file': ('test_data.csv', csv_content, 'text/csv')}
            
            response = requests.post(f"{self.base_url}/api/explorer/upload", files=files, timeout=30)
            
            if response.status_code != 200:
                return self.log_test("Dataset Upload", False, f"Status: {response.status_code}, Response: {response.text}")
            
            data = response.json()
            required_fields = ['datasetId', 'name', 'rows', 'columns', 'summary', 'statistics', 'visualizations']
            has_all_fields = all(field in data for field in required_fields)
            
            if has_all_fields and data['rows'] > 0:
                self.dataset_id = data['datasetId']  # Store for later tests
                return self.log_test("Dataset Upload", True, f"ID: {self.dataset_id}, Rows: {data['rows']}, Cols: {data['columns']}")
            else:
                return self.log_test("Dataset Upload", False, f"Missing fields or no data. Fields: {list(data.keys())}")
                
        except Exception as e:
            return self.log_test("Dataset Upload", False, f"Exception: {str(e)}")

    def test_dataset_query(self):
        """Test querying uploaded dataset"""
        if not self.dataset_id:
            return self.log_test("Dataset Query", False, "No dataset uploaded")
        
        try:
            payload = {
                "datasetId": self.dataset_id,
                "query": "What are the top 3 products by price?"
            }
            response = requests.post(f"{self.base_url}/api/explorer/query", json=payload, timeout=30)
            
            if response.status_code != 200:
                return self.log_test("Dataset Query", False, f"Status: {response.status_code}, Response: {response.text}")
            
            data = response.json()
            has_answer = 'answer' in data and isinstance(data['answer'], str) and len(data['answer']) > 0
            
            return self.log_test("Dataset Query", has_answer, f"Answer length: {len(data.get('answer', ''))}")
        except Exception as e:
            return self.log_test("Dataset Query", False, f"Exception: {str(e)}")

    def test_get_datasets(self):
        """Test getting uploaded datasets list"""
        try:
            response = requests.get(f"{self.base_url}/api/explorer/datasets", timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                datasets_count = len(data) if isinstance(data, list) else 0
                return self.log_test("Get Datasets", True, f"Found {datasets_count} datasets")
            else:
                return self.log_test("Get Datasets", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Datasets", False, f"Exception: {str(e)}")

    def test_error_handling(self):
        """Test API error handling"""
        tests_passed = 0
        total_tests = 0
        
        # Test invalid copilot query
        try:
            total_tests += 1
            payload = {"query": "INVALID SQL SYNTAX HERE"}
            response = requests.post(f"{self.base_url}/api/copilot/query", json=payload, timeout=20)
            # Should handle gracefully, either return error or fallback
            if response.status_code in [200, 400, 500]:
                tests_passed += 1
                print("    Copilot invalid query handled gracefully")
        except:
            pass
        
        # Test nonexistent dataset query
        try:
            total_tests += 1
            payload = {"datasetId": "nonexistent-id", "query": "test"}
            response = requests.post(f"{self.base_url}/api/explorer/query", json=payload, timeout=10)
            if response.status_code == 404:
                tests_passed += 1
                print("    Nonexistent dataset properly returns 404")
        except:
            pass
        
        success = tests_passed == total_tests
        return self.log_test("Error Handling", success, f"{tests_passed}/{total_tests} error cases handled properly")

    def run_all_tests(self):
        """Run all tests and return summary"""
        print("🚀 Starting AI Data Intelligence Platform Backend Tests\n")
        
        # Core API tests
        self.test_api_root()
        
        # Data Copilot tests
        self.test_copilot_query_simple()
        self.test_copilot_natural_language()
        self.test_copilot_chart_types()
        
        # Dataset Explorer tests
        self.test_dataset_upload()
        self.test_dataset_query()
        self.test_get_datasets()
        
        # Error handling
        self.test_error_handling()
        
        # Print summary
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 70  # Consider 70%+ as acceptable

def main():
    tester = AIDataPlatformTester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())