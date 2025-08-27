const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const FileProcessor = require('./fileProcessor');
const Database = require('./database');

const app = express();
const fileProcessor = new FileProcessor();
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'All Snax server is running' });
});

// File Processing Routes (no authentication required)
app.post('/api/process/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        // Log operation to database
        await db.logFileOperation('pdf-to-word', req.file.originalname, req.file.size, req.ip);
        
        const result = await fileProcessor.pdfToWord(req.file.path, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/pdf-to-text', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const result = await fileProcessor.pdfToText(req.file.path, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const result = await fileProcessor.wordToPdf(req.file.path, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/protect', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { password } = req.body;
        const result = await fileProcessor.protectPdf(req.file.path, password, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/pdf-to-jpg', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const result = await fileProcessor.pdfToJpg(req.file.path, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/pdf-compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { compressionLevel } = req.body;
        const result = await fileProcessor.compressPdf(req.file.path, compressionLevel, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/pdf-merge', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const filePaths = req.files.map(file => file.path);
        const result = await fileProcessor.mergePdf(filePaths, 'guest', 'merged_files');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/pdf-split', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const result = await fileProcessor.splitPdf(req.file.path, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/image-resize', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { width, height } = req.body;
        const result = await fileProcessor.resizeImage(req.file.path, width, height, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/image-to-pdf', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const filePaths = req.files.map(file => file.path);
        const result = await fileProcessor.imageToPdf(filePaths, 'guest', 'images_to_pdf');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/watermark', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { watermarkText } = req.body;
        const result = await fileProcessor.addWatermark(req.file.path, watermarkText, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

app.post('/api/process/rotate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { rotationAngle } = req.body;
        const result = await fileProcessor.rotatePdf(req.file.path, rotationAngle, 'guest', req.file.originalname);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Processing failed', error: error.message });
    }
});

// Download processed file (no authentication required)
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'output', filename);
        
        // Check if file exists
        await fs.access(filePath);
        
        res.download(filePath, (err) => {
            if (err) {
                res.status(404).json({ message: 'File not found' });
            }
        });
    } catch (error) {
        res.status(404).json({ message: 'File not found' });
    }
});

// Reviews endpoints
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, rating, reviewText } = req.body;
        
        if (!name || !rating || !reviewText) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        const result = await db.addReview(name, parseInt(rating), reviewText);
        res.json({ success: true, reviewId: result.id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save review' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await db.getReviews(20);
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// Subscription endpoint
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        const result = await db.addSubscription(email);
        if (result.changes > 0) {
            res.json({ success: true, message: 'Successfully subscribed!' });
        } else {
            res.json({ success: true, message: 'Already subscribed!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
});

// Stats endpoint with database
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json({
            totalProcessedFiles: stats.total_operations,
            totalSubscriptions: stats.total_subscriptions,
            totalReviews: stats.total_reviews,
            serverStatus: 'Running'
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
});

// Serve admin dashboard (simplified)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Start server (no database initialization needed)
const PORT = process.env.PORT || 3000;

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n🚀 All Snax Server Started!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Local Access:     http://localhost:${PORT}`);
    console.log(`🌐 Network Access:   http://${localIP}:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Access from other devices:');
    console.log(`   Open browser and go to: http://${localIP}:${PORT}`);
    console.log('   (Make sure devices are on same WiFi network)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ No authentication required - all features available\n');
});