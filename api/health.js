// Health check endpoint
module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Resume Builder API is running!',
    timestamp: new Date().toISOString()
  });
};
