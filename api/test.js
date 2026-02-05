// Simple test API endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}