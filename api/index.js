// Vercel serverless function for health check
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Resume Builder API is running on Vercel!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
