const express = require('express');
const router = express.Router();
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.post('/users/:userId/approve', approveUser);
router.post('/users/:userId/reject', rejectUser);
router.post('/users/:userId/suspend', suspendUser);
router.post('/users/:userId/reactivate', reactivateUser);
router.get('/dashboard', (req, res) => {
    res.send('Admin Dashboard');
});

module.exports = router;