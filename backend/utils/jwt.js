const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();


const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn:'30m',
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const storeRefreshToken = async (userId, refreshToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); 

  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt
      }
    });
  } catch (error) {
    throw new Error('Failed to store refresh token');
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!tokenRecord || !tokenRecord.user || !tokenRecord.user.verified) {
      await revokeRefreshToken(refreshToken); // optional cleanup
      return null;
    }

    return tokenRecord; // return the record with user info
  } catch (error) {
    console.error('verifyRefreshToken failed:', error.message);
    throw new Error('Failed to verify refresh token');
  }
};


const revokeRefreshToken = async (refreshToken) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true }
    });
  } catch (error) {
    throw new Error('Failed to revoke refresh token');
  }
};

const revokeAllUserTokens = async (userId) => {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false
      },
      data: {
        isRevoked: true
      }
    });
  } catch (error) {
    throw new Error('Failed to revoke user tokens');
  }
};

const cleanupExpiredTokens = async () => {
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true }
        ]
      }
    });
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens
};
