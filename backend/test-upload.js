import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Upload Functionality');
console.log('==============================');

// Check uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log(`✅ Uploads directory exists with ${files.length} files`);
  
  // Categorize files
  const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  const videos = files.filter(f => /\.(mp4|avi|mov|webm)$/i.test(f));
  const others = files.filter(f => !/\.(jpg|jpeg|png|gif|webp|mp4|avi|mov|webm)$/i.test(f));
  
  console.log(`📸 Images: ${images.length}`);
  console.log(`🎥 Videos: ${videos.length}`);
  console.log(`📄 Other files: ${others.length}`);
  
  if (images.length > 0) {
    console.log('\n📸 Image files:');
    images.forEach(img => {
      const filePath = path.join(uploadsDir, img);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${img} (${sizeInMB} MB)`);
    });
  }
  
  if (videos.length > 0) {
    console.log('\n🎥 Video files:');
    videos.forEach(video => {
      const filePath = path.join(uploadsDir, video);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${video} (${sizeInMB} MB)`);
    });
  }
} else {
  console.log('❌ Uploads directory does not exist');
}

// Test URL generation
console.log('\n🌐 Test URLs:');
console.log('http://localhost:5010/uploads/');
console.log('http://localhost:5010/api/upload/videos');

console.log('\n✅ Upload functionality test completed!');
console.log('\n📝 Next steps:');
console.log('1. Start the backend server: npm start');
console.log('2. Start the frontend: cd ../frontend && npm start');
console.log('3. Go to admin panel and test image upload');
console.log('4. Check that images display properly in product listings');
