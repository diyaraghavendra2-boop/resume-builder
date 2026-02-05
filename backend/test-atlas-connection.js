const mongoose = require('mongoose');

// Test MongoDB Atlas connection with correct password
const MONGODB_URI = 'mongodb+srv://diyaraghavendra2_db_user:QxBrH1CIzufn0qkc@resume-builder.vtmhvlf.mongodb.net/resumebuilder?appName=resume-builder';

console.log('🧪 Testing MongoDB Atlas connection...');
console.log('Connection string:', MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Hide password

async function testConnection() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('📡 Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test creating a simple document
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Atlas connection successful!' 
    });
    console.log('✅ Test document created with ID:', testDoc.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: testDoc.insertedId });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 8000) {
      console.log('\n🔐 Authentication failed - check password and user permissions');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 DNS resolution failed - check cluster URL');
    }
  }
}

testConnection();