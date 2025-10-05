const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Clear any existing users to start fresh
    await User.deleteMany({});
    console.log('🧹 Cleared all existing users');

    // Create your admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      name: 'Ashwin Admin',
      email: 'ashwin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('================================');
    console.log('👤 User Details:');
    console.log('   Name: Ashwin Admin');
    console.log('   Email: ashwin@gmail.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   ID:', adminUser._id);
    console.log('================================');

    // Verify the user was created
    const users = await User.find({});
    console.log('\n📊 USERS IN DATABASE:');
    users.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.log('💡 Email already exists. Try using a different email.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

createAdmin();