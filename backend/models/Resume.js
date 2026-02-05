const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    default: 'My Resume',
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  header: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot exceed 200 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot exceed 200 characters']
    },
    profilePicture: {
      type: String, // Base64 encoded image
      default: ''
    }
  },
  professionalSummary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Professional summary cannot exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  experience: [{
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      trim: true
    },
    endDate: {
      type: String,
      trim: true,
      default: 'Present'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Job description cannot exceed 1000 characters']
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [100, 'Certification name cannot exceed 100 characters']
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true
    }
  }],
  education: [{
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    school: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [100, 'School name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true
    }
  }],
  hobbies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each hobby cannot exceed 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true // Only create index for non-null values
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for better query performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ shareToken: 1 });

// Generate share token method
resumeSchema.methods.generateShareToken = function() {
  this.shareToken = require('crypto').randomBytes(32).toString('hex');
  return this.shareToken;
};

module.exports = mongoose.model('Resume', resumeSchema);