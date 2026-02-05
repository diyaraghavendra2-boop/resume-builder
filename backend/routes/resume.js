const express = require('express');
const Resume = require('../models/Resume');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/resume
// @desc    Get all resumes for the authenticated user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resumes = await Resume.find({ userId: req.user._id })
      .select('-__v')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resume.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        resumes,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes'
    });
  }
});

// @route   GET /api/resume/:id
// @desc    Get a specific resume
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-__v');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume'
    });
  }
});

// @route   POST /api/resume
// @desc    Create a new resume
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user._id
    };

    const resume = new Resume(resumeData);
    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: { resume }
    });
  } catch (error) {
    console.error('Create resume error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create resume'
    });
  }
});

// @route   PUT /api/resume/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-__v');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: { resume }
    });
  } catch (error) {
    console.error('Update resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update resume'
    });
  }
});

// @route   DELETE /api/resume/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
});

// @route   POST /api/resume/:id/share
// @desc    Generate a shareable link for a resume
// @access  Private
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Generate share token if it doesn't exist
    if (!resume.shareToken) {
      resume.generateShareToken();
    }
    
    resume.isPublic = true;
    await resume.save();

    const shareUrl = `${req.protocol}://${req.get('host')}/api/resume/shared/${resume.shareToken}`;

    res.json({
      success: true,
      message: 'Share link generated successfully',
      data: {
        shareUrl,
        shareToken: resume.shareToken
      }
    });
  } catch (error) {
    console.error('Share resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share link'
    });
  }
});

// @route   GET /api/resume/shared/:token
// @desc    Get a shared resume by token
// @access  Public
router.get('/shared/:token', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      shareToken: req.params.token,
      isPublic: true
    })
    .populate('userId', 'name')
    .select('-__v');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Shared resume not found or no longer available'
      });
    }

    res.json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('Get shared resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared resume'
    });
  }
});

// @route   POST /api/resume/:id/unshare
// @desc    Remove sharing for a resume
// @access  Private
router.post('/:id/unshare', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        isPublic: false,
        $unset: { shareToken: 1 }
      },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume sharing disabled successfully'
    });
  } catch (error) {
    console.error('Unshare resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable sharing'
    });
  }
});

// @route   POST /api/resume/:id/duplicate
// @desc    Duplicate a resume
// @access  Private
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!originalResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Create a copy without _id, shareToken, and timestamps
    const resumeData = originalResume.toObject();
    delete resumeData._id;
    delete resumeData.shareToken;
    delete resumeData.createdAt;
    delete resumeData.updatedAt;
    delete resumeData.__v;
    
    // Update title
    resumeData.title = `${resumeData.title} (Copy)`;
    resumeData.isPublic = false;

    const duplicatedResume = new Resume(resumeData);
    await duplicatedResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      data: { resume: duplicatedResume }
    });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate resume'
    });
  }
});

// @route   GET /api/resume/all-names
// @desc    Get all resume names in database (for debugging)
// @access  Public (for debugging purposes)
router.get('/all-names', async (req, res) => {
  try {
    // Get all resumes with just the name and basic info
    const resumes = await Resume.find({})
      .select('header.name header.role header.email createdAt userId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out default names and extract useful info
    const resumeNames = resumes
      .filter(resume => resume.header?.name && resume.header.name !== 'Your Name')
      .map(resume => ({
        name: resume.header.name,
        role: resume.header.role || 'Not specified',
        email: resume.header.email || 'Not specified',
        createdAt: resume.createdAt,
        id: resume._id,
        createdBy: resume.userId ? resume.userId.name : 'Unknown'
      }));

    res.json({
      success: true,
      message: `Found ${resumeNames.length} named resumes`,
      data: {
        names: resumeNames,
        total: resumeNames.length,
        expectedNames: ['Purnima', 'manju', 'aarav', 'diya'],
        foundNames: resumeNames.map(r => r.name)
      }
    });
  } catch (error) {
    console.error('Get all names error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume names'
    });
  }
});

module.exports = router;