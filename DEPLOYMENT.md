# All Snax Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended - Free)
```bash
npm install -g vercel
vercel --prod
```

### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### 3. Railway
```bash
npm install -g @railway/cli
railway login
railway deploy
```

### 4. Render
- Connect your GitHub repo to Render
- Set build command: `npm install`
- Set start command: `npm start`

## Local Network Access

### Find Your IP Address:
**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (usually 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### Access from other devices:
1. Start server: `npm start`
2. Open browser on any device: `http://YOUR_IP_ADDRESS:3000`
3. Make sure devices are on same WiFi network

## Environment Variables
Create `.env` file in server folder:
```
PORT=3000
```

## Troubleshooting
- Ensure port 3000 is not blocked by firewall
- Check if devices are on same network
- Try different port if 3000 is occupied