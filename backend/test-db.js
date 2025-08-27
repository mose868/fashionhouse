import { pool } from './src/data/db.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [result] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
    // Test products table
    const [products] = await pool.execute('SELECT COUNT(*) as count FROM products');
    console.log('✅ Products table accessible:', products[0].count, 'products found');
    
    // Test categories table
    const [categories] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    console.log('✅ Categories table accessible:', categories[0].count, 'categories found');
    
    // Test product_images table
    const [images] = await pool.execute('SELECT COUNT(*) as count FROM product_images');
    console.log('✅ Product images table accessible:', images[0].count, 'images found');
    
    // Test a simple product query
    const [sampleProducts] = await pool.execute('SELECT _id, name, category FROM products LIMIT 3');
    console.log('✅ Sample products:', sampleProducts);
    
    // Test category filtering
    const [filteredProducts] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE LOWER(category) = LOWER(?)',
      ['Accessories']
    );
    console.log('✅ Category filtering works:', filteredProducts[0].count, 'products in Accessories');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
