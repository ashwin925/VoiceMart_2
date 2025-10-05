const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables manually
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  console.log('💡 Make sure your .env.local file has:');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voicemart');
  process.exit(1);
}

console.log('🔗 MongoDB URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

// Define simple schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
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
  isActive: { type: Boolean, default: true },
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
    console.log('✅ Database cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@voicemart.com',
      password: hashedAdminPassword,
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create test user
    const hashedUserPassword = await bcrypt.hash('user123', 12);
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@voicemart.com',
      password: hashedUserPassword,
      role: 'user'
    });
    console.log('✅ Test user created');

    // Create categories
    console.log('📁 Creating categories...');
    const categories = await Category.create([
      { name: 'Electronics', description: 'Latest gadgets and electronics' },
      { name: 'Fashion', description: 'Trendy clothing and accessories' },
      { name: 'Home & Garden', description: 'Everything for your home and garden' },
      { name: 'Sports', description: 'Sports equipment and accessories' }
    ]);
    console.log('✅ Categories created:', categories.length);

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
        name: 'Laptop Stand',
        category: categories[0]._id,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
        shortDescription: 'Adjustable aluminum laptop stand for better ergonomics',
        price: 49.99
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
      },
      {
        name: 'Designer Jeans',
        category: categories[1]._id,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
        shortDescription: 'Premium quality jeans with perfect fit',
        price: 79.99
      }
    ]);
    console.log('✅ Products created:', products.length);

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('================================');
    console.log('🔐 ADMIN LOGIN:');
    console.log('   Email: admin@voicemart.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 USER LOGIN:');
    console.log('   Email: user@voicemart.com');
    console.log('   Password: user123');
    console.log('================================');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${await User.countDocuments()}`);
    console.log(`   📁 Categories: ${await Category.countDocuments()}`);
    console.log(`   📦 Products: ${await Product.countDocuments()}`);
    console.log('================================');

  } catch (error) {
    console.error('\n❌ ERROR SEEDING DATABASE:');
    console.error('   Message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 MONGODB CONNECTION ISSUES:');
      console.log('   1. Check your MONGODB_URI in .env.local');
      console.log('   2. Make sure your IP is whitelisted in MongoDB Atlas');
      console.log('   3. Verify username/password in connection string');
      console.log('   4. Check if MongoDB Atlas cluster is running');
    } else if (error.code === 8000) {
      console.log('\n💡 AUTHENTICATION ISSUE:');
      console.log('   Check your username and password in MONGODB_URI');
    } else if (error.code === 13) {
      console.log('\n💡 PERMISSION ISSUE:');
      console.log('   Make sure database user has read/write permissions');
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔒 Database connection closed');
    }
  }
}

// Run the seed function
seedDatabase();