const express = require('express');
const router = express.Router();
const {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getElectionById,
  getCandidatesByElectionId,
  resendCandidateEmail
} = require('../controllers/electionController');

const { authenticateToken } = require('../middleware/auth');

router.post('/create', authenticateToken, createElection);
router.post('/cancel/:id', authenticateToken, cancelElection);
router.put('/reschedule/:id', authenticateToken, rescheduleElection);
router.get('/', authenticateToken, getAllElections);
router.get('/:id', getElectionById);

router.get('/candidates/:electionId', getCandidatesByElectionId);

router.post('/resend-email/:electionId', authenticateToken, resendCandidateEmail);




module.exports = router;