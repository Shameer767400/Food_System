#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class HostelFoodAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.admin_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = []
        self.created_menus = []
        self.created_tickets = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@hostel.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin user: {response.get('user', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_student_login(self):
        """Test student login"""
        success, response = self.run_test(
            "Student Login",
            "POST",
            "auth/login",
            200,
            data={"email": "student@hostel.com", "password": "student123"}
        )
        if success and 'token' in response:
            self.student_token = response['token']
            print(f"   Student user: {response.get('user', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_student_registration(self):
        """Test student registration"""
        test_email = f"test_student_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "testpass123",
                "name": "Test Student",
                "hostel_id": "H-123"
            }
        )
        return success

    def test_auth_me(self):
        """Test get current user info"""
        success, response = self.run_test(
            "Get Current User (Admin)",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        return success

    def test_create_menu_item(self):
        """Test creating menu items"""
        items_to_create = [
            {
                "name": "Idli Sambar",
                "category": "veg",
                "meal_type": "breakfast",
                "description": "Steamed rice cakes with lentil curry"
            },
            {
                "name": "Chicken Curry",
                "category": "non-veg", 
                "meal_type": "lunch",
                "description": "Spicy chicken curry with rice"
            },
            {
                "name": "Dal Rice",
                "category": "veg",
                "meal_type": "dinner",
                "description": "Lentil curry with steamed rice"
            }
        ]
        
        all_success = True
        for item_data in items_to_create:
            success, response = self.run_test(
                f"Create Menu Item - {item_data['name']}",
                "POST",
                "admin/menu-items",
                200,
                data=item_data,
                token=self.admin_token
            )
            if success and 'id' in response:
                self.created_items.append(response['id'])
            all_success = all_success and success
        
        return all_success

    def test_get_menu_items(self):
        """Test getting all menu items"""
        success, response = self.run_test(
            "Get Menu Items",
            "GET",
            "admin/menu-items",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} menu items")
        return success

    def test_create_menu(self):
        """Test creating/publishing menus"""
        if not self.created_items:
            print("❌ No menu items available to create menu")
            return False
            
        # Create menu for tomorrow
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        menus_to_create = [
            {
                "date": tomorrow,
                "meal_type": "breakfast",
                "item_ids": [self.created_items[0]] if len(self.created_items) > 0 else []
            },
            {
                "date": tomorrow,
                "meal_type": "lunch", 
                "item_ids": [self.created_items[1]] if len(self.created_items) > 1 else []
            }
        ]
        
        all_success = True
        for menu_data in menus_to_create:
            if menu_data["item_ids"]:  # Only create if we have items
                success, response = self.run_test(
                    f"Create Menu - {menu_data['meal_type']}",
                    "POST",
                    "admin/menus",
                    200,
                    data=menu_data,
                    token=self.admin_token
                )
                if success and 'id' in response:
                    self.created_menus.append(response['id'])
                all_success = all_success and success
        
        return all_success

    def test_get_menus(self):
        """Test getting all menus"""
        success, response = self.run_test(
            "Get All Menus (Admin)",
            "GET",
            "admin/menus",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} menus")
        return success

    def test_student_get_menus(self):
        """Test student getting available menus"""
        success, response = self.run_test(
            "Get Student Menus",
            "GET",
            "student/menus",
            200,
            token=self.student_token
        )
        if success:
            print(f"   Found {len(response)} available menus for student")
        return success

    def test_meal_selection(self):
        """Test student meal selection"""
        if not self.created_menus:
            print("❌ No menus available for selection")
            return False
            
        success, response = self.run_test(
            "Create Meal Selection",
            "POST",
            "student/selections",
            200,
            data={
                "menu_id": self.created_menus[0],
                "selected_item_ids": [self.created_items[0]] if self.created_items else []
            },
            token=self.student_token
        )
        return success

    def test_booking_history(self):
        """Test getting booking history"""
        success, response = self.run_test(
            "Get Booking History",
            "GET",
            "student/booking-history",
            200,
            token=self.student_token
        )
        if success:
            print(f"   Found {len(response)} bookings in history")
        return success

    def test_create_ticket(self):
        """Test creating support tickets"""
        success, response = self.run_test(
            "Create Ticket",
            "POST",
            "tickets",
            200,
            data={
                "category": "Food Quality",
                "sub_category": "Taste Issue",
                "urgency": "medium",
                "description": "The food was too salty today",
                "photos": []
            },
            token=self.student_token
        )
        if success and 'id' in response:
            self.created_tickets.append(response['id'])
        return success

    def test_get_tickets(self):
        """Test getting tickets"""
        # Test student getting their tickets
        success1, response1 = self.run_test(
            "Get Student Tickets",
            "GET",
            "tickets",
            200,
            token=self.student_token
        )
        
        # Test admin getting all tickets
        success2, response2 = self.run_test(
            "Get All Tickets (Admin)",
            "GET",
            "tickets",
            200,
            token=self.admin_token
        )
        
        if success1:
            print(f"   Student sees {len(response1)} tickets")
        if success2:
            print(f"   Admin sees {len(response2)} tickets")
            
        return success1 and success2

    def test_update_ticket_status(self):
        """Test admin updating ticket status"""
        if not self.created_tickets:
            print("❌ No tickets available to update")
            return False
            
        success, response = self.run_test(
            "Update Ticket Status",
            "PATCH",
            f"admin/tickets/{self.created_tickets[0]}?status=in_progress",
            200,
            token=self.admin_token
        )
        return success

    def test_menu_analytics(self):
        """Test getting menu analytics"""
        if not self.created_menus:
            print("❌ No menus available for analytics")
            return False
            
        success, response = self.run_test(
            "Get Menu Analytics",
            "GET",
            f"admin/analytics/{self.created_menus[0]}",
            200,
            token=self.admin_token
        )
        if success:
            total_users = response.get('total_users', 0)
            total_selections = response.get('total_selections', 0)
            print(f"   Analytics: {total_users} users, {total_selections} selections")
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access to admin endpoints"""
        success, response = self.run_test(
            "Unauthorized Admin Access",
            "GET",
            "admin/menu-items",
            403,  # Should fail with 403 (Forbidden) if token is valid but role is wrong
            token=self.student_token  # Using student token for admin endpoint
        )
        return success

    def cleanup(self):
        """Clean up created test data"""
        print(f"\n🧹 Cleaning up test data...")
        
        # Delete created menu items
        for item_id in self.created_items:
            try:
                requests.delete(
                    f"{self.base_url}/api/admin/menu-items/{item_id}",
                    headers={'Authorization': f'Bearer {self.admin_token}'}
                )
                print(f"   Deleted menu item: {item_id}")
            except:
                pass

def main():
    print("🚀 Starting Hostel Food Management API Tests")
    print("=" * 60)
    
    tester = HostelFoodAPITester()
    
    try:
        # Authentication Tests
        print("\n📋 AUTHENTICATION TESTS")
        print("-" * 30)
        
        if not tester.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return 1
            
        if not tester.test_student_login():
            print("❌ Student login failed - stopping tests")
            return 1
            
        tester.test_student_registration()
        tester.test_auth_me()
        
        # Admin Functionality Tests
        print("\n📋 ADMIN FUNCTIONALITY TESTS")
        print("-" * 30)
        
        tester.test_create_menu_item()
        tester.test_get_menu_items()
        tester.test_create_menu()
        tester.test_get_menus()
        tester.test_menu_analytics()
        
        # Student Functionality Tests
        print("\n📋 STUDENT FUNCTIONALITY TESTS")
        print("-" * 30)
        
        tester.test_student_get_menus()
        tester.test_meal_selection()
        tester.test_booking_history()
        
        # Ticket System Tests
        print("\n📋 TICKET SYSTEM TESTS")
        print("-" * 30)
        
        tester.test_create_ticket()
        tester.test_get_tickets()
        tester.test_update_ticket_status()
        
        # Security Tests
        print("\n📋 SECURITY TESTS")
        print("-" * 30)
        
        tester.test_unauthorized_access()
        
        # Cleanup
        tester.cleanup()
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1
    finally:
        # Print final results
        print(f"\n📊 TEST RESULTS")
        print("=" * 60)
        print(f"Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
        print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%" if tester.tests_run > 0 else "0%")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️ Some tests failed")
            return 1

if __name__ == "__main__":
    sys.exit(main())