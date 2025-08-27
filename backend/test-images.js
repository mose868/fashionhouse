import http from 'http';
import https from 'https';

const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${url} - Status: ${res.statusCode}`);
        resolve(true);
      } else {
        console.log(`❌ ${url} - Status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

const testUrls = [
  'http://localhost:5010/uploads/1756214408463-988801659.png',
  'http://localhost:5010/uploads/1756208338727-734079063.png',
  'http://localhost:5010/uploads/1756208337304-109224064.png',
  'http://localhost:5010/uploads/1756208141015-129652253.png',
  'http://localhost:5010/uploads/1756207900955-876558893.png'
];

console.log('🧪 Testing Image URLs');
console.log('========================');

Promise.all(testUrls.map(testImageUrl)).then((results) => {
  const successCount = results.filter(Boolean).length;
  console.log(`\n📊 Results: ${successCount}/${testUrls.length} images accessible`);
  
  if (successCount === testUrls.length) {
    console.log('✅ All images are accessible!');
  } else {
    console.log('❌ Some images are not accessible. Check server status.');
  }
});
