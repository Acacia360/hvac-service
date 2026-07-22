# HVAC Service Service

A comprehensive Node.js/Express REST API service for managing real-time data logging, Milesight gateway support.

## ✨ Features

- ✅ **CRUD Operations** - Create, Read, Update, Delete
- ✅ **Real-time Data Logging** - Automated cron job logs controller data every minute
- ✅ **API Request Logging** - All API requests are automatically logged to database
- ✅ **JWT Authentication** - Secure endpoints with Bearer token authentication
- ✅ **Milesight Gateway Support** - Fetch advanced metrics (temperature, humidity, status)
- ✅ **PostgreSQL Database** - Persistent data storage with Sequelize ORM
- ✅ **Error Handling** - Comprehensive error handling with detailed logging
- ✅ **CORS Support** - Cross-origin resource sharing enabled

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the HVAC  Service Service repository
git clone https://github.com/Acacia360/hvac-service.git

# Navigate to the project directory
cd hvac-service
```

### Step 2: Install Dependencies

```bash
# Install all required npm packages
npm install
```

### Step 3: Create Environment File

Create a `.env` file in the root directory with the following configuration:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=hvac_db

# Server Configuration
PORT=3029

# JWT Secret --currently not functinal
JWT_SECRET=your_super_secret_jwt_key_here 
---

## 🗄️ Database Setup

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE hvac_db;

The tables will be automatically created when the service starts (via Sequelize sync).

---

## ▶️ Running the Service

### Development Mode

```bash
# Start the server in development mode
npm start

```bash
# Test the health endpoint
curl http://localhost:3029/health

# Expected response: OK
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3029/api
```

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Create HVAC  Service
- **Endpoint:** `POST /hvac`
- **Description:** Create a new HVAC  Service
- **Request Body:**
```json
{
  "hvac_name": "Living Room AC",
  "hvac_type": "WALL",
  "hvac_model": "Model-X",
  "hvac_brand": "BrandName",
  "hvac_status": "active"
}
```
- **Response (201):**
```json
{
  "message": "HVAC  Service created successfully",
  "data": {
    "hvac_id": "ACWCWALL1234",
    "hvac_name": "Living Room AC",
    "createdAt": "2025-11-18T10:30:00Z"
  }
}
```

### 2. Get All HVAC  Services
- **Endpoint:** `GET /hvac`
- **Description:** Retrieve all HVAC  Services with related data
- **Response (200):**
```json
{
  "message": "HVAC  Services retrieved successfully",
  "count": 2,
  "data": [
    {
      "hvac_id": "ACWCWALL1234",
      "hvac_name": "Living Room AC",
      "hvac_status": "active",
      "hvacDatas": [
        {
          "data_id": 1,
          "status": true,
          "timestamp": "2025-11-18T10:30:00Z"
        }
      ]
    }
  ]
}
```

### 3. Get HVAC  Service by ID
- **Endpoint:** `GET /hvac/:hvac_id`
- **Example:** `GET /hvac/ACWCWALL1234`
- **Response (200):**
```json
{
  "message": "HVAC  Service retrieved successfully",
  "data": {
    "hvac_id": "ACWCWALL1234",
    "hvac_name": "Living Room AC"
  }
}
```

### 4. Update HVAC  Service
- **Endpoint:** `PUT /hvac/:hvac_id`
- **Example:** `PUT /hvac/ACWCWALL1234`
- **Request Body:**
```json
{
  "hvac_name": "Updated AC Name",
  "hvac_status": "inactive"
}
```
- **Response (200):**
```json
{
  "message": "HVAC  Service updated successfully",
  "data": { /* updated controller data */ }
}
```

### 5. Delete HVAC  Service
- **Endpoint:** `DELETE /hvac/:hvac_id`
- **Example:** `DELETE /hvac/ACWCWALL1234`
- **Response (200):**
```json
{
  "message": "HVAC  Service deleted successfully"
}
```

### 6. Get API Logs
- **Endpoint:** `GET /logs`
- **Description:** Retrieve all API request logs
- **Response (200):**
```json
[
  {
    "id": 1,
    "method": "GET",
    "endpoint": "/api/hvac",
    "status_code": 200,
    "status_type": "SUCCESS",
    "triggered_by_email": "admin@acacia360.com",
    "timestamp": "2025-11-18T10:30:00Z"
  }
]

### 7. Get all device_data api
- **Endpoint:** `GET /hvacdata/by-timestamp`
- **Description:** Retrieve all API request logs
- **Response (200):**

```
### 7. Get Device Data by timestamp
- **Endpoint:** `GET /realtime`
- **Description:** Retrieve all device data request
- **Response (200):**
```json
{
  "message": "Data fetched successfully",
  "count": 1,
  "data": [
    {
      "data_id": "1",
      "db_unit_id": "ACWCSMA2815",
      "timestamp": "2025-11-20T11:24:00.110+05:30",
      "status": true
    }
  ]
}
```
## 🧪 Testing with Postman

### Step 1: Import Postman Collection

1. Open **Postman**
2. Click **Import** (top-left menu)
3. Select **File** tab
4. Choose the file: `hvac_postman_collection.json`
5. Click **Import**

### Step 2: Set Up Environment Variables

1. In Postman, click the **eye icon** (top-right)
2. Click **Edit** next to "Globals" or create a new environment
3. Add the following variables:

```
Variable Name: base_url
Initial Value: http://localhost:3029/api
Current Value: http://localhost:3029/api

Variable Name: token
Initial Value: (leave empty initially)
Current Value: (will be set after login)
```

### Step 3: Generate JWT Token

To get a valid JWT token:

```bash
# Option 1: Use Node.js to generate token
node -e "const jwt = require('jsonwebtoken'); const token = jwt.sign({user_id: 1, user_email: 'admin@acacia360.com', user_role: 'admin'}, 'your_jwt_secret'); console.log(token);"

# Option 2: Copy token from server logs when you test an endpoint
```

### Step 4: Set Authorization Header

For each request in Postman:

1. Go to **Authorization** tab
2. Select **Bearer Token** from Type dropdown
3. Paste your JWT token in the Token field
4. Or use: `{{token}}` if you set it as an environment variable

### Step 5: Run API Tests

In the collection, you'll find these pre-configured requests:

1. **Endpoint 1 - GET /api/logs** - Fetch all logs
2. **Endpoint 2 - POST /api/hvac** - Create controller
3. **Endpoint 3 - GET /api/hvac** - Get all controllers
4. **Endpoint 4 - GET /api/hvac/:hvac_id** - Get by ID
5. **Endpoint 5 - PUT /api/hvac/:hvac_id** - Update controller
6. **Endpoint 6 - DELETE /api/hvac/:hvac_id** - Delete controller
7. **Endpoint 7 - GET /api/hvacData/:hvac_id/realtime** - get all device data controller

### Example Postman Request

**GET /api/hvac**

```
GET http://localhost:3029/api/hvac
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

**Expected Response:**
```json
{
  "message": "HVAC  Services retrieved successfully",
  "count": 0,
  "data": []
}
```

---

## 📁 Project Structure

```
hvac-service/
├── src/
│   ├── app.js                          # Express app setup
│   ├── config/
│   │   └── database.js                 # Database configuration
│   ├── controllers/
|   |   |__ hvacControllerData.js
│   │   ├── hvacController.js         # HVAC  Service logic
│   │   └── logController.js            # API Logs logic
│   ├── cron/
│   │   └── hvacDataLogger.cron.js    # Cron job for data logging
│   ├── middlewares/
│   │   ├── apiLogger.js                # API request logging
│   │   ├── authenticate.js             # JWT authentication
│   │   └── authorize.js                # Role-based authorization
│   ├── models/
│   │   ├── index.js                    # Model exports & relationships
│   │   ├── hvac.js          # HVAC  Service model
│   │   ├── hvacData.js      # Controller data model
│   │   └── apiLog.js                   # API Log model
│   ├── routes/
|   |   |__ hvacDataRoutes.js 
│   │   ├── hvac.js         # HVAC  Service routes
│   │   └── logRoutes.js                # Log routes
│   ├── utils/
│   │   ├── jwt.js                      # JWT utilities
│   │   ├── readMilesightLights.js      # Milesight integration
│   │   ├── tokenStore.js               # Token management
│   │   └── calculations/
│   │       └── mathVal.js              # Math calculations
├── HVAC/
│   ├── hvac-configmap.yaml          # Kubernetes ConfigMap
│   ├── hvac-deployment.yaml         # Kubernetes Deployment
│   └── hvac-service.yaml            # Kubernetes Service
├── database/
│   └── (database migration files)
├── Dockerfile                          # Docker configuration
├── docker-compose.yml                  # Docker Compose setup
├── package.json                        # Project dependencies
├── .env                                # Environment variables
└── README.md                           # This file
```

---

## 🗄️ Database Schema

### Tables Created Automatically

#### 1. HVACs
```sql
CREATE TABLE HVACs (
  hvac_id VARCHAR PRIMARY KEY,
  hvac_name VARCHAR NOT NULL,
  hvac_type VARCHAR,
  hvac_model VARCHAR,
  hvac_brand VARCHAR,
  hvac_status VARCHAR,
  hvac_serial_number VARCHAR,
  hvac_installation_date TIMESTAMP,
  hvac_last_maintenance_date TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### 2. hvac_Data
```sql
CREATE TABLE hvac_Data (
  data_id INTEGER PRIMARY KEY AUTO_INCREMENT,
  hvac_id VARCHAR NOT NULL,
  status BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hvac_id) REFERENCES HVACs(hvac_id)
);
```

#### 3. API_Logs
```sql
CREATE TABLE API_Logs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  method VARCHAR(10),
  endpoint TEXT,
  status_code INTEGER,
  status_type ENUM('SUCCESS', 'ERROR'),
  triggered_by_email VARCHAR,
  triggered_by_role VARCHAR,
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Troubleshooting

### Issue: Database Connection Error

**Error:** `SequelizeConnectionRefusedError`

**Solution:**
```bash
# 1. Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# 2. Check database exists
psql -U postgres -l

# 3. Verify .env file has correct credentials
cat .env | grep DB_

# 4. Restart PostgreSQL service
# Windows:
net start PostgreSQL-x64-15

# Linux:
sudo systemctl restart postgresql
```

### Issue: Port 3029 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3029`

**Solution:**
```bash
# Find process using port 3029
# Windows:
netstat -ano | findstr :3029

# Linux/Mac:
lsof -i :3029

# Kill the process
# Windows:
taskkill /PID <PID> /F

# Linux/Mac:
kill -9 <PID>

# Or use a different port
PORT=3032 npm start
```

### Issue: JWT Token Invalid

**Error:** `Invalid or expired token`

**Solution:**
```bash
# Generate new token
node -e "const jwt = require('jsonwebtoken'); const token = jwt.sign({user_id: 1, user_email: 'admin@acacia360.com', user_role: 'admin'}, 'your_jwt_secret'); console.log(token);"

# Verify token in Postman Authorization header
Authorization: Bearer <new_token>
```

### Issue: npm install Fails

**Error:** `ERR! code EACCES` or permission denied

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with sudo (not recommended)
# Or fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install -g npm
```

### Issue: Cron Job Not Running

**Error:** Data not logging automatically

**Solution:**
```bash
# 1. Check console logs for cron messages
# Look for: "⏰ HVAC  Service data logging cron started"

# 2. Verify database has records
psql -U postgres -d hvac_db
SELECT * FROM "hvac_Data";

# 3. Check if controllers exist
SELECT * FROM "HVACs" LIMIT 1;

# 4. Restart service
npm start
```