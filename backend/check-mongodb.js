// Simple MongoDB Connection Test
import { MongoClient } from 'mongodb';

async function checkMongoDB() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        const db = client.db('resumebuilder');
        
        // Check users collection
        const usersCount = await db.collection('users').countDocuments();
        console.log(`👥 Users in database: ${usersCount}`);
        
        // Check resumes collection
        const resumesCount = await db.collection('resumes').countDocuments();
        console.log(`📋 Resumes in database: ${resumesCount}`);
        
        // Show sample user
        const sampleUser = await db.collection('users').findOne({});
        console.log('📄 Sample user:', {
            name: sampleUser?.name,
            email: sampleUser?.email,
            createdAt: sampleUser?.createdAt
        });
        
        // Show sample resume
        const sampleResume = await db.collection('resumes').findOne({});
        console.log('📄 Sample resume:', {
            title: sampleResume?.title,
            name: sampleResume?.header?.name,
            skills: sampleResume?.skills?.slice(0, 3)
        });
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    } finally {
        await client.close();
    }
}

checkMongoDB();