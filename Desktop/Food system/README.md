# Hostel Food Management System

## Prerequisites
- **Python** (3.8+)
- **Node.js** (14+)
- **MongoDB** (Must be installed and running locally on port 27017)

## Setup & Run Instructions

### 1. Database
Ensure your MongoDB service is running. The application expects a local MongoDB instance.
```bash
# MacOS
brew services start mongodb-community
# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### 2. Backend
Navigate to the backend directory and start the server.

```bash
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn server:app --reload
```
The backend will start at `http://localhost:8000`.
API Documentation is available at `http://localhost:8000/docs`.

### 3. Frontend
Navigate to the frontend directory and start the React application.

```bash
cd frontend

# Install dependencies
npm install
# OR if you use yarn
yarn install

# Start the application
npm start
# OR
yarn start
```
The frontend will start at `http://localhost:3000`.

## Configuration
- **Backend**: Configure database URL and secrets in `backend/.env`
- **Frontend**: Configure API URL in `frontend/.env`
