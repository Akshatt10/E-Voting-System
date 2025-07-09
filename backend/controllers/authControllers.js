const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../utils/jwt');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email,IBBI, password, firstName, lastName, phone } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
    data: {
      email,
      IBBI:  IBBI,
      firstname: firstName,
      lastname: lastName,
      phone: phone,
      passwordHash: hashedPassword,
      role: 'VOTER',
  },
});


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

// Update profile controller
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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  currentUser,
  updateProfile
};