const express = require('express');
const router = express.Router();
const {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getElectionById
} = require('../controllers/electionController');

const { authenticateToken } = require('../middleware/auth');

router.post('/create', authenticateToken, createElection);
router.post('/cancel/:id', authenticateToken, cancelElection);
router.put('/reschedule/:id', authenticateToken, rescheduleElection);
router.get('/', authenticateToken, getAllElections);
router.get('/:id', getElectionById);
router.get('/candidates/:electionId', authenticateToken, async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { electionId: req.params.electionId },
      select: { id: true, name: true, email: true, share: true },
    });
    res.json({ success: true, candidates });
  } catch (error) {
    console.error("Fetch candidates error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch candidates" });
  }
});



module.exports = router;