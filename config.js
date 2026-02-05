// Production Configuration
const CONFIG = {
    development: {
        API_BASE: 'http://localhost:5001/api'
    },
    production: {
        API_BASE: 'https://resume-indol-sigma.vercel.app/api' // Updated with actual Vercel URL
    }
};

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' &&
                    !window.location.hostname.includes('localhost');

const API_BASE = isProduction ? CONFIG.production.API_BASE : CONFIG.development.API_BASE;

console.log('🌐 Environment:', isProduction ? 'Production' : 'Development');
console.log('🔗 API Base:', API_BASE);

// Export for use in other files
window.RESUME_BUILDER_CONFIG = {
    API_BASE,
    isProduction
};