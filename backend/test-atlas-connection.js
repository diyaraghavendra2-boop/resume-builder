const mongoose = require('mongoose');

// Test MongoDB Atlas connection and verify data
const MONGODB_URI = 'mongodb+srv://diyaraghavendra2_db_user:QxBrH1CIzufn0qkc@resume-builder.vtmhvlf.mongodb.net/resumebuilder?appName=resume-builder';

console.log('🔍 Checking MongoDB Atlas for saved data...');

async function checkAtlasData() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB Atlas!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Check users collection
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Total users in Atlas: ${userCount}`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}, { projection: { name: 1, email: 1, createdAt: 1 } }).toArray();
      console.log('👤 Users in Atlas:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`);
      });
    }
    
    // Check resumes collection
    const resumesCollection = mongoose.connection.db.collection('resumes');
    const resumeCount = await resumesCollection.countDocuments();
    console.log(`📄 Total resumes in Atlas: ${resumeCount}`);
    
    if (resumeCount > 0) {
      const resumes = await resumesCollection.find({}, { projection: { title: 1, 'header.name': 1, createdAt: 1 } }).toArray();
      console.log('📋 Resumes in Atlas:');
      resumes.forEach((resume, index) => {
        console.log(`   ${index + 1}. "${resume.title}" by ${resume.header.name} - Created: ${resume.createdAt}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
    if (userCount > 0 && resumeCount > 0) {
      console.log('\n🎉 SUCCESS: Your data IS being saved to MongoDB Atlas!');
    } else {
      console.log('\n⚠️  No data found in Atlas - check connection');
    }
    
  } catch (error) {
    console.error('❌ Failed to check Atlas data:');
    console.error('Error:', error.message);
  }
}

checkAtlasData();