const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/send_email');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const register = async (req, res) => {
    try {
        const { email, IBBI, password, firstName, lastName, phone } = req.body;


        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
        }
        
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let user;
        try {
            user = await prisma.user.create({
                data: {
                    email,
                    IBBI: IBBI,
                    firstname: firstName,
                    lastname: lastName,
                    phone: phone,
                    passwordHash: hashedPassword,
                    role: 'VOTER',
                },
            });
        } catch (error) {
            // Check if the error is a Prisma unique constraint violation
            if (error.code === 'P2002') {
                const field = error.meta.target[0];
                return res.status(409).json({ success: false, message: `An account with this ${field} already exists.` });
            }

            throw error;
        }

        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken();

        await storeRefreshToken(user.id, refreshToken);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    IBBI: user.IBBI,
                    firstName: user.firstname,
                    lastName: user.lastname,
                    phone: user.phone,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ success: false, message: 'Account not verified' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();

    await storeRefreshToken(user.id, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.firstname + ' ' + user.lastname,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const tokenData = await verifyRefreshToken(token);
    if (!tokenData) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: tokenData.user.id,
      email: tokenData.user.email
    });


    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();
    
    // Revoke old refresh token and store new one
    await revokeRefreshToken(token);
    await storeRefreshToken(tokenData.user.id, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await revokeRefreshToken(token);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id;
    await revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const currentUser = (req, res) => {
  try {
    const { firstname, lastname, email, IBBI } = req.user;

    res.json({
      firstname,
      lastname,
      email,
      IBBI,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

const getProfile = async (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname
      }
    }
  });

};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstname: firstName,
        lastname: lastName,
        phone: phone
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstname,
          lastName: updatedUser.lastname,
          phone: updatedUser.phone
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPublicStats = async (req, res) => {
    try {
        // --- MODIFIED: Uses the 'verified' field from your User schema ---
        const totalUsers = await prisma.user.count({
            where: { verified: true } // Only count verified users
        });

        // This query correctly uses the 'isPublished' field from your Election schema
        const totalElections = await prisma.election.count({
            where: { isPublished: true } // Only count published elections
        });

        // This is a placeholder for a more advanced "online users" feature
        const simulatedOnlineUsers = Math.floor(Math.random() * (15 - 5 + 1)) + 5;

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalElections,
                onlineUsers: simulatedOnlineUsers,
            },
        });
    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ success: false, message: "Failed to fetch platform statistics." });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Create a short-lived token containing the user's ID
            const payload = { userId: user.id };
            const secret = process.env.PASSWORD_RESET_JWT_SECRET;
            const token = jwt.sign(payload, secret, { expiresIn: '15m' }); // Token is valid for 15 minutes

            await sendPasswordResetEmail(user.email, token);
        }

        res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error("Request Password Reset Error:", error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required.' });
        }

        // 1. Verify the token
        const secret = process.env.PASSWORD_RESET_JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        const { userId } = decoded;

        // 2. Hash the new password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 3. Update the user's password in the database
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new one.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ success: false, message: 'Invalid password reset link.' });
        }
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  currentUser,
  updateProfile,
  getPublicStats,
  requestPasswordReset,
  resetPassword,
};