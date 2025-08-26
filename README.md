# All Snax - Simplified Version

## Overview
All Snax is now a simplified file processing application that works without authentication or database requirements.

## What Changed
- ✅ **Removed login system** - No more user registration or authentication
- ✅ **Removed database** - No MySQL or user data storage required
- ✅ **Simplified admin dashboard** - Shows basic file statistics
- ✅ **All file processing features still work** - PDF, Word, Image tools available

## How to Run

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Application
- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin

## Features Available
- PDF to Word conversion
- Word to PDF conversion  
- PDF to Text extraction
- PDF to JPG conversion
- PDF compression
- PDF protection
- Image resizing
- PDF merging/splitting
- Watermarking
- And all other file processing tools

## No Setup Required
- No database configuration needed
- No user accounts to create
- No authentication tokens
- Just install dependencies and run!

## File Processing
All processed files are stored in the `server/output/` directory and can be downloaded directly.

## Admin Dashboard
The admin dashboard shows:
- Number of processed files
- Number of uploaded files  
- Server status
- System information

## Environment Variables (Optional)
You can still use a `.env` file for:
```
PORT=3000
```

That's it! Your All Snax application is now much simpler and easier to use.