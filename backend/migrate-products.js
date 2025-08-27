import { pool } from './src/data/db.js';
import { productsStore } from './src/data/productsStore.js';

async function migrateProducts() {
  try {
    console.log('Starting product migration...');
    
    // Clear existing products and images
    await pool.execute('DELETE FROM product_images');
    await pool.execute('DELETE FROM products');
    
    console.log('Cleared existing products and images');
    
    // Insert products from the store
    for (const product of productsStore.items) {
      console.log(`Migrating product: ${product.name}`);
      
      // Insert the product
      await pool.execute(
        `INSERT INTO products (_id, name, description, category, price, stockQuantity, featured, videoUrl, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product._id,
          product.name,
          product.description,
          product.category,
          product.price,
          product.stockQuantity,
          product.featured ? 1 : 0,
          product.videoUrl,
          new Date(product.createdAt).toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      
      // Insert images for this product
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const image = product.images[i];
          await pool.execute(
            `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              product._id,
              image.url,
              image.alt_text || `${product.name} - Image ${i + 1}`,
              i === 0 ? 1 : 0, // First image is primary
              i
            ]
          );
        }
        console.log(`  - Added ${product.images.length} images`);
      } else {
        console.log(`  - No images for this product`);
      }
    }
    
    console.log('Product migration completed successfully!');
    
    // Verify the migration
    const [products] = await pool.execute('SELECT COUNT(*) as count FROM products');
    const [images] = await pool.execute('SELECT COUNT(*) as count FROM product_images');
    
    console.log(`Migration results:`);
    console.log(`- Products: ${products[0].count}`);
    console.log(`- Images: ${images[0].count}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateProducts();
