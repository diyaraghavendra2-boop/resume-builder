# Resume Builder Backend API

A complete Node.js/Express backend with MongoDB for the Resume Builder application.

## 🚀 Features

- **User Authentication** - Register, login, JWT tokens
- **Resume Management** - CRUD operations for resumes
- **File Handling** - Profile picture uploads (base64)
- **Resume Sharing** - Generate shareable links
- **Security** - Rate limiting, CORS, input validation
- **Database** - MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
Create a `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/resumebuilder
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

4. **Run the server:**
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/change-password` | Change password | Yes |

### Resume Routes (`/api/resume`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user resumes | Yes |
| GET | `/:id` | Get specific resume | Yes |
| POST | `/` | Create new resume | Yes |
| PUT | `/:id` | Update resume | Yes |
| DELETE | `/:id` | Delete resume | Yes |
| POST | `/:id/share` | Generate share link | Yes |
| POST | `/:id/unshare` | Remove sharing | Yes |
| POST | `/:id/duplicate` | Duplicate resume | Yes |
| GET | `/shared/:token` | Get shared resume | No |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 📊 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Resume
```bash
POST /api/resume
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Resume",
  "header": {
    "name": "John Doe",
    "role": "Software Developer",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "location": "City, State"
  },
  "professionalSummary": "Experienced developer...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": [{
    "title": "Senior Developer",
    "company": "Tech Corp",
    "startDate": "2021",
    "endDate": "Present",
    "description": "Led development team..."
  }]
}
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to get a token
2. Include token in requests: `Authorization: Bearer <token>`
3. Tokens expire in 7 days

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  header: {
    name, role, email, phone, location, 
    linkedin, website, profilePicture
  },
  professionalSummary: String,
  skills: [String],
  experience: [Object],
  certifications: [Object],
  education: [Object],
  hobbies: [String],
  isPublic: Boolean,
  shareToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🛡️ Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - 100 requests per 15 minutes
- **CORS Protection** - Configured for frontend domain
- **Input Validation** - Mongoose schema validation
- **Helmet** - Security headers
- **Environment Variables** - Sensitive data protection

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas
4. Deploy to Heroku/AWS/DigitalOcean

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumebuilder
PORT=5000
JWT_SECRET=super-strong-secret-key-here
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 🧪 Testing

Test the API using:
- **Postman** - Import collection
- **curl** - Command line testing
- **Frontend** - Connect your React/HTML app

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 📝 Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running
- Verify connection string
- Check network connectivity

### Authentication Issues
- Verify JWT secret is set
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

### CORS Issues
- Check `FRONTEND_URL` in .env
- Verify frontend domain matches

## 📚 Next Steps

1. Connect your frontend to these APIs
2. Add more features (templates, themes)
3. Implement file uploads for documents
4. Add email notifications
5. Create admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**Your Resume Builder backend is ready! 🎉**

Start the server and begin integrating with your frontend application.