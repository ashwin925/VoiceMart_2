const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Testing MongoDB Connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ SUCCESS: Connected to MongoDB!');
    
    // List databases to verify connection
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    console.log('📊 Available databases:');
    result.databases.forEach(db => {
      console.log(`   - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED:');
    console.error('   Error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your username/password in MONGODB_URI');
      console.log('   2. Make sure your IP is whitelisted in MongoDB Atlas');
      console.log('   3. Check if the cluster is running');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  }
}

testConnection();