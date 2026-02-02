from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, time, timedelta
import bcrypt
import jwt
import time as time_module

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Models ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # 'admin' or 'student'
    hostel_id: Optional[str] = None
    room_number: Optional[str] = None
    profile_picture: Optional[str] = None  # Base64 encoded image
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    hostel_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # 'veg' or 'non-veg'
    meal_type: str  # 'breakfast', 'lunch', 'dinner'
    description: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    name: str
    category: str
    meal_type: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class Menu(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD
    meal_type: str  # 'breakfast', 'lunch', 'dinner'
    item_ids: List[str]
    status: str  # 'draft' or 'published'
    selection_start: Optional[datetime] = None
    selection_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuCreate(BaseModel):
    date: str
    meal_type: str
    item_ids: List[str]

class UserSelection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    menu_id: str
    selected_item_ids: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SelectionCreate(BaseModel):
    menu_id: str
    selected_item_ids: List[str]

class Ticket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    sub_category: Optional[str] = None
    urgency: str  # 'basic', 'medium', 'critical'
    description: str
    photos: List[str] = []
    status: str = 'open'  # 'open', 'in_progress', 'closed'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TicketCreate(BaseModel):
    category: str
    sub_category: Optional[str] = None
    urgency: str
    description: str
    photos: List[str] = []

# ============ Utilities ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload['user_id']
        user = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_admin(user: User = Depends(get_current_user)):
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def check_selection_window(meal_type: str, target_date: str) -> dict:
    """
    Check if current time is within selection window for given meal type and date.
    Returns: {'allowed': bool, 'message': str, 'start': datetime, 'end': datetime}
    """
    # TEMPORARILY DISABLED FOR TESTING - Allow selection at any time
    # TODO: Re-enable timing restrictions when testing is complete
    
    # Original timing logic (commented out for testing):
    # now = datetime.now(timezone.utc)
    # target_dt = datetime.strptime(target_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    # 
    # if meal_type == 'breakfast':
    #     # Select between 8:00 PM - 9:30 PM previous day
    #     prev_day = target_dt - timedelta(days=1)
    #     start = prev_day.replace(hour=20, minute=0, second=0, microsecond=0)
    #     end = prev_day.replace(hour=21, minute=30, second=0, microsecond=0)
    # elif meal_type == 'lunch':
    #     # Select between 8:00 AM - 9:30 AM same day
    #     start = target_dt.replace(hour=8, minute=0, second=0, microsecond=0)
    #     end = target_dt.replace(hour=9, minute=30, second=0, microsecond=0)
    # elif meal_type == 'dinner':
    #     # Select between 11:30 AM - 2:00 PM same day
    #     start = target_dt.replace(hour=11, minute=30, second=0, microsecond=0)
    #     end = target_dt.replace(hour=14, minute=0, second=0, microsecond=0)
    # else:
    #     return {'allowed': False, 'message': 'Invalid meal type', 'start': None, 'end': None}
    # 
    # allowed = start <= now <= end
    # message = 'Selection window is open' if allowed else 'Selection window is closed'
    # 
    # return {'allowed': allowed, 'message': message, 'start': start.isoformat(), 'end': end.isoformat()}
    
    # Testing mode - always allow selection
    now = datetime.now(timezone.utc)
    return {
        'allowed': True, 
        'message': 'Selection window is open (testing mode)', 
        'start': now.isoformat(), 
        'end': (now + timedelta(hours=24)).isoformat()
    }

# ============ Auth Routes ============

@api_router.post("/auth/register")
async def register(data: UserRegister):
    start_time = time_module.time()
    logger.info(f"Register attempt for: {data.email}")
    
    try:
        # Check if user exists
        existing = await db.users.find_one({'email': data.email}, {'_id': 0}).with_options(timeout=5000)
        logger.info(f"DB check took: {time_module.time() - start_time:.2f}s")
        
        if existing:
            logger.warning(f"Registration failed: Email {data.email} already exists")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user = User(
            email=data.email,
            name=data.name,
            role='student',
            hostel_id=data.hostel_id
        )
        
        user_dict = user.model_dump()
        hash_start = time_module.time()
        logger.info(f"Hashing password for {data.email}...")
        user_dict['password_hash'] = await run_in_threadpool(hash_password, data.password)
        logger.info(f"Hashing took: {time_module.time() - hash_start:.2f}s")
        
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        
        db_start = time_module.time()
        logger.info(f"Inserting user {data.email} into DB...")
        await db.users.insert_one(user_dict).with_options(timeout=5000)
        logger.info(f"Insertion took: {time_module.time() - db_start:.2f}s")
        
        token = create_token(user.id, user.role)
        logger.info(f"Registration successful for {data.email} (Total: {time_module.time() - start_time:.2f}s)")
        return {'token': token, 'user': user}
    except Exception as e:
        logger.error(f"Registration error for {data.email}: {str(e)}")
        raise e

@api_router.post("/auth/login")
async def login(data: UserLogin):
    start_time = time_module.time()
    logger.info(f"Login attempt for: {data.email}")
    
    try:
        user_doc = await db.users.find_one({'email': data.email}, {'_id': 0}).with_options(timeout=5000)
        logger.info(f"DB lookup took: {time_module.time() - start_time:.2f}s")
        
        if not user_doc:
            logger.warning(f"Login failed: User {data.email} not found")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        verify_start = time_module.time()
        logger.info(f"Verifying password for {data.email}...")
        is_valid = await run_in_threadpool(verify_password, data.password, user_doc['password_hash'])
        logger.info(f"Verification took: {time_module.time() - verify_start:.2f}s")
        
        if not is_valid:
            logger.warning(f"Login failed: Invalid password for {data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        user_doc.pop('password_hash', None)
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        user = User(**user_doc)
        token = create_token(user.id, user.role)
        logger.info(f"Login successful for {data.email} (Total: {time_module.time() - start_time:.2f}s)")
        return {'token': token, 'user': user}
    except Exception as e:
        logger.error(f"Login error for {data.email}: {str(e)}")
        raise e

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

# ============ Admin Menu Management ============

@api_router.post("/admin/menu-items", dependencies=[Depends(require_admin)])
async def create_menu_item(data: MenuItemCreate, admin: User = Depends(require_admin)):
    item = MenuItem(**data.model_dump())
    item_dict = item.model_dump()
    item_dict['created_at'] = item_dict['created_at'].isoformat()
    await db.menu_items.insert_one(item_dict)
    return item

@api_router.get("/admin/menu-items", dependencies=[Depends(require_admin)])
async def get_menu_items():
    items = await db.menu_items.find({}, {'_id': 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.delete("/admin/menu-items/{item_id}", dependencies=[Depends(require_admin)])
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({'id': item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {'message': 'Item deleted'}

@api_router.post("/admin/menus", dependencies=[Depends(require_admin)])
async def create_menu(data: MenuCreate):
    # Calculate selection windows
    target_date = data.date
    window = check_selection_window(data.meal_type, target_date)
    
    menu = Menu(
        date=data.date,
        meal_type=data.meal_type,
        item_ids=data.item_ids,
        status='published',
        selection_start=window['start'],
        selection_end=window['end']
    )
    
    menu_dict = menu.model_dump()
    menu_dict['created_at'] = menu_dict['created_at'].isoformat()
    
    await db.menus.insert_one(menu_dict)
    return menu

@api_router.get("/admin/menus", dependencies=[Depends(require_admin)])
async def get_all_menus():
    menus = await db.menus.find({}, {'_id': 0}).sort('date', -1).to_list(1000)
    for menu in menus:
        if isinstance(menu.get('created_at'), str):
            menu['created_at'] = datetime.fromisoformat(menu['created_at'])
    return menus

@api_router.get("/admin/analytics/{menu_id}", dependencies=[Depends(require_admin)])
async def get_menu_analytics(menu_id: str):
    # Get menu
    menu = await db.menus.find_one({'id': menu_id}, {'_id': 0})
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Get all selections for this menu
    selections = await db.user_selections.find({'menu_id': menu_id}, {'_id': 0}).to_list(10000)
    
    # Get menu items
    item_ids = menu['item_ids']
    items = await db.menu_items.find({'id': {'$in': item_ids}}, {'_id': 0}).to_list(1000)
    item_map = {item['id']: item for item in items}
    
    # Aggregate data
    total_users = len(selections)
    item_counts = {}
    
    for selection in selections:
        for item_id in selection.get('selected_item_ids', []):
            item_counts[item_id] = item_counts.get(item_id, 0) + 1
    
    # Build analytics
    analytics = []
    for item_id in item_ids:
        item = item_map.get(item_id, {})
        count = item_counts.get(item_id, 0)
        percentage = (count / total_users * 100) if total_users > 0 else 0
        
        analytics.append({
            'item_id': item_id,
            'item_name': item.get('name', 'Unknown'),
            'category': item.get('category', 'Unknown'),
            'count': count,
            'percentage': round(percentage, 2)
        })
    
    return {
        'menu': menu,
        'total_users': total_users,
        'total_selections': len(selections),
        'items': analytics
    }

# ============ Student Routes ============

@api_router.get("/student/menus")
async def get_student_menus(user: User = Depends(get_current_user)):
    # Get today and tomorrow menus
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
    
    menus = await db.menus.find({
        'status': 'published',
        'date': {'$in': [today, tomorrow]}
    }, {'_id': 0}).to_list(100)
    
    # Enrich with items and selection window status
    result = []
    for menu in menus:
        item_ids = menu['item_ids']
        items = await db.menu_items.find({'id': {'$in': item_ids}}, {'_id': 0}).to_list(1000)
        
        window = check_selection_window(menu['meal_type'], menu['date'])
        
        # Check if user already selected
        existing_selection = await db.user_selections.find_one({
            'user_id': user.id,
            'menu_id': menu['id']
        }, {'_id': 0})
        
        result.append({
            **menu,
            'items': items,
            'selection_window': window,
            'user_selected': existing_selection is not None,
            'selected_item_ids': existing_selection.get('selected_item_ids', []) if existing_selection else []
        })
    
    return result

@api_router.post("/student/selections")
async def create_selection(data: SelectionCreate, user: User = Depends(get_current_user)):
    # Get menu
    menu = await db.menus.find_one({'id': data.menu_id}, {'_id': 0})
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    # Check selection window
    window = check_selection_window(menu['meal_type'], menu['date'])
    if not window['allowed']:
        raise HTTPException(status_code=400, detail=window['message'])
    
    # Check if already selected
    existing = await db.user_selections.find_one({
        'user_id': user.id,
        'menu_id': data.menu_id
    })
    
    if existing:
        # Update existing selection
        await db.user_selections.update_one(
            {'user_id': user.id, 'menu_id': data.menu_id},
            {'$set': {'selected_item_ids': data.selected_item_ids}}
        )
        return {'message': 'Selection updated'}
    else:
        # Create new selection
        selection = UserSelection(
            user_id=user.id,
            menu_id=data.menu_id,
            selected_item_ids=data.selected_item_ids
        )
        
        selection_dict = selection.model_dump()
        selection_dict['created_at'] = selection_dict['created_at'].isoformat()
        
        await db.user_selections.insert_one(selection_dict)
        return {'message': 'Selection created', 'selection': selection}

@api_router.get("/student/booking-history")
async def get_booking_history(user: User = Depends(get_current_user)):
    selections = await db.user_selections.find({'user_id': user.id}, {'_id': 0}).sort('created_at', -1).to_list(100)
    
    result = []
    for selection in selections:
        menu = await db.menus.find_one({'id': selection['menu_id']}, {'_id': 0})
        if menu:
            item_ids = selection['selected_item_ids']
            items = await db.menu_items.find({'id': {'$in': item_ids}}, {'_id': 0}).to_list(1000)
            result.append({
                **selection,
                'menu': menu,
                'items': items
            })
    
    return result

# ============ Ticket Routes ============

@api_router.post("/tickets")
async def create_ticket(data: TicketCreate, user: User = Depends(get_current_user)):
    ticket = Ticket(
        user_id=user.id,
        **data.model_dump()
    )
    
    ticket_dict = ticket.model_dump()
    ticket_dict['created_at'] = ticket_dict['created_at'].isoformat()
    
    await db.tickets.insert_one(ticket_dict)
    return ticket

@api_router.get("/tickets")
async def get_tickets(user: User = Depends(get_current_user)):
    if user.role == 'admin':
        tickets = await db.tickets.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
        
        # Fetch user details for each ticket
        for ticket in tickets:
            user_data = await db.users.find_one({'id': ticket['user_id']}, {'_id': 0, 'name': 1, 'room_number': 1})
            if user_data:
                ticket['student_name'] = user_data.get('name', 'Unknown')
                ticket['room_number'] = user_data.get('room_number', 'N/A')
            else:
                ticket['student_name'] = 'Unknown'
                ticket['room_number'] = 'N/A'
    else:
        tickets = await db.tickets.find({'user_id': user.id}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    
    for ticket in tickets:
        if isinstance(ticket.get('created_at'), str):
            ticket['created_at'] = datetime.fromisoformat(ticket['created_at'])
    
    return tickets

@api_router.patch("/admin/tickets/{ticket_id}", dependencies=[Depends(require_admin)])
async def update_ticket_status(ticket_id: str, status: str):
    result = await db.tickets.update_one(
        {'id': ticket_id},
        {'$set': {'status': status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {'message': 'Ticket updated'}

# ============ Profile Routes ============

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    room_number: Optional[str] = None
    profile_picture: Optional[str] = None

@api_router.patch("/profile")
async def update_profile(data: ProfileUpdate, user: User = Depends(get_current_user)):
    update_data = {}
    if data.name:
        update_data['name'] = data.name
    if data.room_number:
        update_data['room_number'] = data.room_number
    if data.profile_picture:
        update_data['profile_picture'] = data.profile_picture
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.users.update_one(
        {'id': user.id},
        {'$set': update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return updated user data
    updated_user = await db.users.find_one({'id': user.id}, {'_id': 0, 'password_hash': 0})
    return updated_user

# Root endpoint
@app.get("/")
async def root():
    db_status = "Disconnected"
    try:
        # Ping the database
        await client.admin.command('ping')
        db_status = "Connected"
    except Exception as e:
        db_status = f"Error: {str(e)}"
        
    return {
        "message": "Hostel Food Management System API",
        "database": db_status,
        "version": "1.0.0",
        "api_prefix": "/api"
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
