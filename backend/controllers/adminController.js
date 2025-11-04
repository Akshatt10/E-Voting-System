const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all pending user registrations
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        accountStatus: 'PENDING'
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        IBBI: true,
        createdAt: true,
        accountStatus: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      users: pendingUsers
    });

  } catch (error) {
    console.error('Get Pending Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending users'
    });
  }
};

// Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;
    
    const where = {};
    if (status) where.accountStatus = status;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        IBBI: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        approvedAt: true,
        approvedBy: true,
        rejectedAt: true,
        rejectionReason: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Approve user registration
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve user with status: ${user.accountStatus}`
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date()
      }
    });

    // Here you could send an email notification to the user
    console.log(`User ${user.email} approved by admin ${adminId}`);

    res.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus
      }
    });

  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user'
    });
  }
};

// Reject user registration
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject user with status: ${user.accountStatus}`
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      }
    });

    console.log(`User ${user.email} rejected`);

    res.json({
      success: true,
      message: 'User rejected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus
      }
    });

  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user'
    });
  }
};

// Suspend an approved user
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'SUSPENDED'
      }
    });

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus
      }
    });

  } catch (error) {
    console.error('Suspend User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user'
    });
  }
};

// Reactivate suspended user
const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountStatus !== 'SUSPENDED') {
      return res.status(400).json({
        success: false,
        message: 'User is not suspended'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: 'APPROVED'
      }
    });

    res.json({
      success: true,
      message: 'User reactivated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        accountStatus: updatedUser.accountStatus
      }
    });

  } catch (error) {
    console.error('Reactivate User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user'
    });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser
};