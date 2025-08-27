# 📱 Cross-Device Setup Guide

## Step 1: Start Server on Main Computer

### Option A: Double-click files
1. Double-click `install.bat` (first time only)
2. Double-click `start.bat`

### Option B: Command line
```bash
cd server
npm install
npm start
```

## Step 2: Find Your IP Address

### Windows:
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Type `ipconfig` and press Enter
4. Look for "IPv4 Address" under your WiFi adapter
5. Example: `192.168.1.100`

### Alternative (Windows):
1. Open Settings → Network & Internet → WiFi
2. Click on your connected network
3. Scroll down to see IP address

## Step 3: Access from Other Devices

### On Phone/Tablet/Other Computer:
1. Make sure device is on **same WiFi network**
2. Open web browser
3. Type: `http://YOUR_IP_ADDRESS:3000`
4. Example: `http://192.168.1.100:3000`

## Example Complete Process:

```
Main Computer (Windows):
1. Your IP: 192.168.1.100
2. Start server: npm start
3. Server running on: http://localhost:3000

Other Devices:
- Phone: Open browser → http://192.168.1.100:3000
- Tablet: Open browser → http://192.168.1.100:3000  
- Laptop: Open browser → http://192.168.1.100:3000
```

## ⚠️ Important Notes:
- All devices must be on same WiFi network
- Keep main computer running with server active
- If IP doesn't work, check Windows Firewall settings
- Server shows your IP when it starts

## 🔧 Troubleshooting:
- **Can't access?** → Check firewall, try `http://YOUR_IP:3000`
- **Different network?** → Use cloud deployment instead
- **Port blocked?** → Change PORT in .env file