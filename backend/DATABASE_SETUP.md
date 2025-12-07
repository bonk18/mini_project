# Database Setup Guide

## Prerequisites

You need MongoDB installed on your system. Choose one of the following options:

### Option 1: Local MongoDB Installation (Recommended for Development)

1. **Download and Install MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the installer for your operating system
   - Run the installer and follow the installation wizard
   - The default installation path is usually `C:\Program Files\MongoDB\Server\[version]\bin`

2. **Start MongoDB Service:**
   - **Windows**: MongoDB is typically installed as a Windows Service and starts automatically
   - To manually start: Open Command Prompt as Administrator and run:
     ```
     net start MongoDB
     ```
   - To check if MongoDB is running:
     ```
     sc query MongoDB
     ```

3. **Verify MongoDB is running:**
   - Open a terminal and run:
     ```
     mongosh
     ```
   - If connected successfully, you'll see the MongoDB shell

### Option 2: MongoDB Atlas (Cloud Database - Free Tier Available)

1. **Create a MongoDB Atlas Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a Cluster:**
   - Choose the free tier (M0)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

3. **Configure Database Access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Save credentials for later use

4. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String:**
   - Go to "Databases" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Update the connection string in your `.env` file:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer-management
     ```
   - Replace `username` and `password` with your database user credentials

## Running the Application

1. **Install Dependencies (if not already done):**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   - The `.env` file has been created with default settings
   - For local MongoDB, no changes needed (defaults to `mongodb://localhost:27017/volunteer-management`)
   - For MongoDB Atlas, update the `MONGODB_URI` in `.env` with your connection string

3. **Seed the Database (Optional but Recommended):**
   ```bash
   node seedData.js
   ```
   This will populate your database with sample shift data.

4. **Start the Backend Server:**
   ```bash
   node index.js
   ```
   You should see:
   - "MongoDB connected successfully"
   - "Server running on http://localhost:5000"

5. **Start the Frontend (in a separate terminal):**
   ```bash
   cd ..
   npm start
   ```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:** 
- MongoDB is not running. Start the MongoDB service:
  - Windows: `net start MongoDB`
  - Or install MongoDB if not already installed

### Authentication Failed (MongoDB Atlas)

**Error:** `MongoServerError: bad auth Authentication failed`

**Solution:**
- Verify your username and password in the connection string
- Ensure the database user has the correct permissions
- Check that you've enabled network access in MongoDB Atlas

### Database Already Has Data

If you want to reset the database and re-seed:
```bash
node seedData.js
```
This will clear all existing shifts and add fresh sample data.

## Database Collections

Your database will have two collections:

1. **users** - Stores user accounts (username, password, role)
2. **shifts** - Stores volunteer shifts (date, time, location, task, applied users, assigned users)

## Next Steps

After successful setup:
- Register a new user through the frontend
- Login with the created user
- Browse and apply for shifts
- Data will now persist even after server restarts!
