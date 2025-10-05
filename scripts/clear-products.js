const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function clearProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}));
    
    // Delete ALL products
    const result = await Product.deleteMany({});
    
    console.log(`🗑️  Deleted ${result.deletedCount} products`);
    console.log('🎉 Database is now clean! Only products you create will appear.');

  } catch (error) {
    console.error('❌ Error clearing products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

clearProducts();