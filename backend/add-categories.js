import { pool } from './src/data/db.js';

async function addCategories() {
  try {
    console.log('Adding missing categories...');
    
    // Categories that match our products
    const categories = [
      { name: 'Casual African Fashion', description: 'Casual African fashion items' },
      { name: 'Ankara Dress', description: 'Beautiful Ankara print dresses' },
      { name: 'Traditional Wear', description: 'Traditional African clothing' },
      { name: 'Women', description: 'Women\'s fashion collection' },
      { name: 'Accessories', description: 'Fashion accessories' },
      { name: 'Shoes', description: 'Footwear collection' },
      { name: 'Men', description: 'Men\'s fashion collection' },
      { name: 'Kids', description: 'Children\'s fashion collection' }
    ];
    
    for (const category of categories) {
      try {
        await pool.execute(
          'INSERT IGNORE INTO categories (_id, name, description) VALUES (?, ?, ?)',
          [`cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, category.name, category.description]
        );
        console.log(`Added category: ${category.name}`);
      } catch (error) {
        console.log(`Category ${category.name} already exists or error:`, error.message);
      }
    }
    
    console.log('Categories setup completed!');
    
    // Show all categories
    const [allCategories] = await pool.execute('SELECT * FROM categories WHERE isActive = TRUE');
    console.log('All categories:', allCategories.map(c => c.name));
    
  } catch (error) {
    console.error('Error adding categories:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addCategories();
