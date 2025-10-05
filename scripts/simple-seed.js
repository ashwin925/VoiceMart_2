require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas directly in the script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  imageUrl: String,
  shortDescription: String,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@voicemart.com',
      password: hashedAdminPassword,
      role: 'admin'
    });

    // Create test user
    const hashedUserPassword = await bcrypt.hash('user123', 12);
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@voicemart.com',
      password: hashedUserPassword,
      role: 'user'
    });

    // Create categories
    console.log('📁 Creating categories...');
    const categories = await Category.create([
      { name: 'Electronics', description: 'Latest gadgets and electronics' },
      { name: 'Fashion', description: 'Trendy clothing and accessories' },
      { name: 'Home & Garden', description: 'Everything for your home and garden' },
      { name: 'Sports', description: 'Sports equipment and accessories' }
    ]);

    // Create products
    console.log('📦 Creating products...');
    const products = await Product.create([
      {
        name: 'Wireless Bluetooth Headphones',
        category: categories[0]._id,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        shortDescription: 'High-quality wireless headphones with noise cancellation',
        price: 99.99
      },
      {
        name: 'Smart Watch',
        category: categories[0]._id,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        shortDescription: 'Feature-rich smartwatch with health monitoring',
        price: 199.99
      },
      {
        name: 'Casual T-Shirt',
        category: categories[1]._id,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        shortDescription: 'Comfortable cotton t-shirt for everyday wear',
        price: 24.99
      },
      {
        name: 'Running Shoes',
        category: categories[1]._id,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        shortDescription: 'Lightweight running shoes with great cushioning',
        price: 89.99
      }
    ]);

    console.log('\n🎉 Database seeded successfully!');
    console.log('================================');
    console.log('📧 Admin Login: admin@voicemart.com');
    console.log('🔑 Admin Password: admin123');
    console.log('📧 User Login: user@voicemart.com'); 
    console.log('🔑 User Password: user123');
    console.log('================================');
    console.log(`📊 Created: ${await User.countDocuments()} users`);
    console.log(`📁 Created: ${await Category.countDocuments()} categories`);
    console.log(`📦 Created: ${await Product.countDocuments()} products`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('💡 MongoDB Connection Issues:');
      console.log('   - Check your MONGODB_URI in .env.local');
      console.log('   - Make sure your IP is whitelisted in MongoDB Atlas');
      console.log('   - Verify your username/password in the connection string');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

seedDatabase();