import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename for videos, add timestamp for images
    if (file.mimetype.startsWith('video/')) {
      cb(null, file.originalname);
    } else {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  }
});

// File filter for video uploads
const videoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = [
    'video/mp4',
    'video/avi', 
    'video/mov',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];
  
  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported video format. Allowed: ${allowedVideoTypes.join(', ')}`), false);
  }
};

// Configure multer for video uploads
const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
    files: 1
  }
});

// Upload video endpoint
router.post('/video', (req, res, next) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Video file too large. Maximum size is 200MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }
    
    // Use the backend server's actual port for video URLs
    const backendPort = process.env.PORT || 5010;
    const baseUrl = `http://localhost:${backendPort}`;
    
    const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: videoUrl
      }
    });
  });
});

// Get uploaded videos list
router.get('/videos', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.avi', '.mov', '.webm'].includes(ext);
    });
    
    const videos = videoFiles.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      // Use the backend server's actual port for video URLs
      const backendPort = process.env.PORT || 5010;
      const baseUrl = `http://localhost:${backendPort}`;
      
      return {
        filename: file,
        size: stats.size,
        sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
        url: `${baseUrl}/uploads/${file}`,
        uploadedAt: stats.mtime
      };
    });
    
    res.json({
      success: true,
      videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading video files: ' + error.message
    });
  }
});

// Delete video endpoint
router.delete('/video/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }
    
    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video: ' + error.message
    });
  }
});

export default router;


