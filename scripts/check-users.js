const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    }));

    const users = await User.find({});
    console.log('\n📊 USERS IN DATABASE:');
    users.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check if our admin user exists
    const adminUser = await User.findOne({ email: 'admin@voicemart.com' });
    if (adminUser) {
      console.log('\n✅ Admin user found in database');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log('\n❌ Admin user NOT found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

checkUsers();