// API Configuration
// Backend deployed on Render
window.RESUME_BUILDER_CONFIG = {
    // For local development
    API_BASE: window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api'
        // For production - Render backend
        : 'https://resume-builder-mum7onrender.com/api'
};
