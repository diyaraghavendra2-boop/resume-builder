// API Configuration
// This file will be updated with the Render backend URL after deployment
window.RESUME_BUILDER_CONFIG = {
    // For local development
    API_BASE: window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api'
        // For production - UPDATE THIS after deploying to Render
        : 'https://YOUR-RENDER-APP-NAME.onrender.com/api'
};
