const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      IBBI: true,
      firstname: true,
      lastname: true,
      phone: true,
      role: true,
      verified: true,
      createdAt: true,
      updatedAt: true
    }
  });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = { authenticateToken };
