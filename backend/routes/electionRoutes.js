const express = require('express');
const router = express.Router();
const {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getElectionById,
  getCandidatesByElectionId,
  resendCandidateEmail,
  getUserElections,
  getVoteDetails,
  submitVote,
  sendAllReminders,
  getElectionResults
} = require('../controllers/electionController');

const { authenticateToken } = require('../middleware/auth');


router.post('/vote/submit', submitVote);

router.get('/vote/details/:token', getVoteDetails);

router.post('/create', authenticateToken, createElection);
router.post('/cancel/:id', authenticateToken, cancelElection);
router.put('/reschedule/:id', authenticateToken, rescheduleElection);

// ✅ Put specific routes BEFORE parameterized routes
router.get('/user-elections', authenticateToken, getUserElections);
router.get('/candidates/:electionId', getCandidatesByElectionId);
router.post('/:electionId/reminders', authenticateToken, sendAllReminders);
router.post('/resend-email/:electionId', authenticateToken, resendCandidateEmail);
router.get('/:electionId/results', authenticateToken, getElectionResults);

// ✅ Put general routes AFTER specific routes
router.get('/', authenticateToken, getAllElections);
router.get('/:id', getElectionById);  // This should be LAST




module.exports = router;