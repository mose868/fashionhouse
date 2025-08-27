import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Check if MVI_0416.MOV exists in the current directory
const videoFile = path.join(__dirname, 'MVI_0416.MOV');
if (fs.existsSync(videoFile)) {
  const targetPath = path.join(uploadsDir, 'MVI_0416.MOV');
  
  // Copy the video file to uploads directory
  fs.copyFileSync(videoFile, targetPath);
  console.log('✅ Successfully copied MVI_0416.MOV to uploads directory');
  console.log('📁 File location:', targetPath);
  console.log('🌐 Access URL: http://localhost:5010/uploads/MVI_0416.MOV');
} else {
  console.log('❌ MVI_0416.MOV not found in backend directory');
  console.log('📁 Please place MVI_0416.MOV in the backend directory and run this script again');
  console.log('📁 Current directory:', __dirname);
}

// List all files in uploads directory
console.log('\n📋 Files in uploads directory:');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file} (${sizeInMB} MB)`);
  });
}
