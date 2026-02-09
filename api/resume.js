const mongoose = require('mongoose');
const Resume = require('../backend/models/Resume');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = db;
  return db;
}

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Handle different HTTP methods
    if (req.method === 'POST') {
      // Create resume
      const resumeData = {
        ...req.body,
        userId: decoded.userId
      };

      const resume = new Resume(resumeData);
      await resume.save();

      return res.status(201).json({
        success: true,
        message: 'Resume saved to MongoDB Atlas!',
        data: { resume }
      });
    } else if (req.method === 'GET') {
      // Get all resumes for user
      const resumes = await Resume.find({ userId: decoded.userId })
        .sort({ updatedAt: -1 });

      return res.json({
        success: true,
        data: { resumes }
      });
    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Resume operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Operation failed: ' + error.message
    });
  }
};
