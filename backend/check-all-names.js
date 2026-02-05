// Comprehensive Resume Names Checker
import { MongoClient } from 'mongodb';

async function checkAllResumeNames() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    try {
        console.log('🔍 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        const db = client.db('resumebuilder');
        
        // Get database statistics
        const usersCount = await db.collection('users').countDocuments();
        const resumesCount = await db.collection('resumes').countDocuments();
        
        console.log('\n📊 Database Statistics:');
        console.log(`👥 Total Users: ${usersCount}`);
        console.log(`📋 Total Resumes: ${resumesCount}`);
        
        // Get all users
        console.log('\n👥 All Users:');
        const users = await db.collection('users').find({}).toArray();
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${new Date(user.createdAt).toLocaleDateString()}`);
        });
        
        // Get all resumes
        console.log('\n📋 All Resumes:');
        const resumes = await db.collection('resumes').find({}).sort({ createdAt: -1 }).toArray();
        
        if (resumes.length === 0) {
            console.log('❌ No resumes found in database');
            return;
        }
        
        // Show all resumes with their names
        console.log('\n📝 All Resume Names (including defaults):');
        resumes.forEach((resume, index) => {
            const name = resume.header?.name || 'No Name';
            const role = resume.header?.role || 'No Role';
            const createdDate = new Date(resume.createdAt).toLocaleDateString();
            console.log(`${index + 1}. "${name}" - Role: ${role} - Created: ${createdDate}`);
        });
        
        // Filter out default names
        const namedResumes = resumes.filter(resume => 
            resume.header?.name && 
            resume.header.name !== 'Your Name' && 
            resume.header.name.trim() !== '' &&
            resume.header.name !== 'John Doe' // Another common default
        );
        
        console.log('\n🎯 Named Resumes (excluding defaults):');
        if (namedResumes.length === 0) {
            console.log('❌ No named resumes found! All resumes have default names.');
            console.log('💡 Create resumes with actual names like: Purnima, manju, aarav, diya');
        } else {
            namedResumes.forEach((resume, index) => {
                const name = resume.header.name;
                const role = resume.header?.role || 'Not specified';
                const email = resume.header?.email || 'Not specified';
                const createdDate = new Date(resume.createdAt).toLocaleDateString();
                console.log(`${index + 1}. "${name}" - Role: ${role} - Email: ${email} - Created: ${createdDate}`);
            });
        }
        
        // Check for expected names
        const expectedNames = ['Purnima', 'manju', 'aarav', 'diya'];
        const foundNames = namedResumes.map(r => r.header.name);
        
        console.log('\n🔍 Expected Names Check:');
        expectedNames.forEach(name => {
            const found = foundNames.includes(name);
            console.log(`${found ? '✅' : '❌'} ${name}: ${found ? 'FOUND' : 'NOT FOUND'}`);
        });
        
        const missingNames = expectedNames.filter(name => !foundNames.includes(name));
        if (missingNames.length > 0) {
            console.log(`\n⚠️  Missing Names: ${missingNames.join(', ')}`);
            console.log('💡 To create these names:');
            console.log('   1. Go to http://localhost:8000/index.html');
            console.log('   2. Login or register');
            console.log('   3. Create new resumes with these names');
            console.log('   4. Make sure to change "Your Name" to the actual name');
        } else {
            console.log('\n🎉 All expected names found in database!');
        }
        
        // MongoDB Compass instructions
        console.log('\n🧭 To see these names in MongoDB Compass:');
        console.log('1. Open MongoDB Compass');
        console.log('2. Connect to: mongodb://localhost:27017');
        console.log('3. Click on "resumebuilder" database');
        console.log('4. Click on "resumes" collection');
        console.log('5. Look for "header.name" field in each document');
        console.log('6. To filter out defaults, use filter: {"header.name": {"$ne": "Your Name"}}');
        
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await client.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the check
checkAllResumeNames();