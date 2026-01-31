#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, '/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import bcrypt

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "hostel_food_db"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Seeding database...")
    
    # Create admin user
    admin_exists = await db.users.find_one({'email': 'admin@hostel.com'})
    if not admin_exists:
        admin = {
            'id': 'admin-001',
            'email': 'admin@hostel.com',
            'password_hash': hash_password('admin123'),
            'name': 'Admin User',
            'role': 'admin',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        print("✓ Admin user created (admin@hostel.com / admin123)")
    
    # Create student user
    student_exists = await db.users.find_one({'email': 'student@hostel.com'})
    if not student_exists:
        student = {
            'id': 'student-001',
            'email': 'student@hostel.com',
            'password_hash': hash_password('student123'),
            'name': 'John Doe',
            'role': 'student',
            'hostel_id': 'H-101',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(student)
        print("✓ Student user created (student@hostel.com / student123)")
    
    # Create menu items
    items = [
        # Breakfast items
        {'id': 'item-b1', 'name': 'Idli Sambar', 'category': 'veg', 'meal_type': 'breakfast', 'description': 'Steamed rice cakes with lentil curry'},
        {'id': 'item-b2', 'name': 'Poha', 'category': 'veg', 'meal_type': 'breakfast', 'description': 'Flattened rice with peanuts and spices'},
        {'id': 'item-b3', 'name': 'Toast & Butter', 'category': 'veg', 'meal_type': 'breakfast', 'description': 'Toasted bread with butter'},
        {'id': 'item-b4', 'name': 'Egg Omelette', 'category': 'non-veg', 'meal_type': 'breakfast', 'description': 'Fluffy egg omelette'},
        
        # Lunch items
        {'id': 'item-l1', 'name': 'Dal Rice', 'category': 'veg', 'meal_type': 'lunch', 'description': 'Lentils with steamed rice'},
        {'id': 'item-l2', 'name': 'Chapati', 'category': 'veg', 'meal_type': 'lunch', 'description': 'Whole wheat flatbread'},
        {'id': 'item-l3', 'name': 'Paneer Curry', 'category': 'veg', 'meal_type': 'lunch', 'description': 'Cottage cheese in rich gravy'},
        {'id': 'item-l4', 'name': 'Chicken Curry', 'category': 'non-veg', 'meal_type': 'lunch', 'description': 'Spicy chicken curry'},
        {'id': 'item-l5', 'name': 'Curd', 'category': 'veg', 'meal_type': 'lunch', 'description': 'Fresh yogurt'},
        
        # Dinner items
        {'id': 'item-d1', 'name': 'Roti', 'category': 'veg', 'meal_type': 'dinner', 'description': 'Indian flatbread'},
        {'id': 'item-d2', 'name': 'Mixed Veg Curry', 'category': 'veg', 'meal_type': 'dinner', 'description': 'Assorted vegetables in curry'},
        {'id': 'item-d3', 'name': 'Rice', 'category': 'veg', 'meal_type': 'dinner', 'description': 'Steamed basmati rice'},
        {'id': 'item-d4', 'name': 'Fish Fry', 'category': 'non-veg', 'meal_type': 'dinner', 'description': 'Crispy fried fish'},
        {'id': 'item-d5', 'name': 'Salad', 'category': 'veg', 'meal_type': 'dinner', 'description': 'Fresh vegetable salad'},
    ]
    
    for item in items:
        exists = await db.menu_items.find_one({'id': item['id']})
        if not exists:
            item['created_at'] = datetime.now(timezone.utc).isoformat()
            await db.menu_items.insert_one(item)
    print(f"✓ {len(items)} menu items created")
    
    # Create sample menus for today and tomorrow
    today = datetime.now(timezone.utc)
    tomorrow = today + timedelta(days=1)
    
    menus = [
        {
            'id': 'menu-today-breakfast',
            'date': today.strftime('%Y-%m-%d'),
            'meal_type': 'breakfast',
            'item_ids': ['item-b1', 'item-b2', 'item-b3', 'item-b4'],
            'status': 'published',
            'selection_start': (today - timedelta(days=1)).replace(hour=20, minute=0).isoformat(),
            'selection_end': (today - timedelta(days=1)).replace(hour=21, minute=30).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'menu-today-lunch',
            'date': today.strftime('%Y-%m-%d'),
            'meal_type': 'lunch',
            'item_ids': ['item-l1', 'item-l2', 'item-l3', 'item-l4', 'item-l5'],
            'status': 'published',
            'selection_start': today.replace(hour=8, minute=0).isoformat(),
            'selection_end': today.replace(hour=9, minute=30).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'menu-today-dinner',
            'date': today.strftime('%Y-%m-%d'),
            'meal_type': 'dinner',
            'item_ids': ['item-d1', 'item-d2', 'item-d3', 'item-d4', 'item-d5'],
            'status': 'published',
            'selection_start': today.replace(hour=11, minute=30).isoformat(),
            'selection_end': today.replace(hour=14, minute=0).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 'menu-tomorrow-breakfast',
            'date': tomorrow.strftime('%Y-%m-%d'),
            'meal_type': 'breakfast',
            'item_ids': ['item-b1', 'item-b2', 'item-b3', 'item-b4'],
            'status': 'published',
            'selection_start': today.replace(hour=20, minute=0).isoformat(),
            'selection_end': today.replace(hour=21, minute=30).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for menu in menus:
        exists = await db.menus.find_one({'id': menu['id']})
        if not exists:
            await db.menus.insert_one(menu)
    print(f"✓ {len(menus)} menus created")
    
    client.close()
    print("\n✅ Database seeded successfully!")

if __name__ == '__main__':
    asyncio.run(seed_database())
