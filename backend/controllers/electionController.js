const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const { sendCandidateNotification, sendVotingReminder } = require('../utils/send_email');

// Enum for VoteStatus remains the same
const VoteStatus = {
  SCHEDULED: "SCHEDULED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const createElection = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in request' });
    }

    const { Matter, title, resolutions, startTime, endTime, candidates } = req.body;

    // Basic validation for resolutions
    if (!resolutions || !Array.isArray(resolutions) || resolutions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one resolution is required.' });
    }

    const election = await prisma.election.create({
      data: {
        Matter,
        title,
        // --- REMOVED: 'description' field is no longer on the Election model ---
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPublished: true,
        createdBy: {
          connect: { id: userId }
        },
        candidates: {
          create: candidates.map(candidate => ({
            name: candidate.name,
            email: candidate.email,
            share: parseFloat(candidate.share)
          }))
        },
        // --- NEW: Nested write to create all resolutions linked to this election ---
        resolutions: {
          create: resolutions.map(res => ({
            title: res.title,
            description: res.description,
            agreeLabel: res.options.agree,
            disagreeLabel: res.options.disagree,
            abstainLabel: res.options.abstain,
          })),
        },
      },
      include: {
        candidates: true,
        resolutions: true // Include the newly created resolutions in the response
      }
    });

    // --- MODIFIED: Removed 'description' from the email payload ---
    const emailPromises = election.candidates.map(candidate => {
      // --- MODIFIED: Pass the full 'candidate' object ---
      if (candidate.email) {
        return sendCandidateNotification(candidate, {
          id: election.id,
          title: election.title,
          startTime: election.startTime,
          endTime: election.endTime
        });
      }
    }).filter(Boolean);

    Promise.all(emailPromises)
      .then(() => console.log('All candidate emails sent successfully'))
      .catch(error => console.error('Error sending emails:', error));

    res.status(201).json({
      success: true,
      election,
      message: `Election created successfully! Notification emails sent to ${emailPromises.length} candidates.`
    });

  } catch (error) {
    console.error('Create Election Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create election'
    });
  }
};

// cancelElection remains the same
const cancelElection = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.election.update({
      where: { id },
      data: {
        isPublished: false,
        status: VoteStatus.CANCELLED
      }
    });
    res.json({ success: true, message: 'Election cancelled', updated });
  } catch (error) {
    console.error('Cancel Election Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel election' });
  }
};

// rescheduleElection remains the same
const rescheduleElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'startTime and endTime are required'
      });
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO format like 2025-06-11T10:00:00Z'
      });
    }

    const updated = await prisma.election.update({
      where: { id },
      data: {
        startTime: parsedStart,
        endTime: parsedEnd
      }
    });

    return res.json({ success: true, message: 'Election rescheduled', updated });

  } catch (error) {
    console.error('Reschedule Election Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule election'
    });
  }
};

const getAllElections = async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { startTime: 'desc' },
      // --- MODIFIED: Include resolutions ---
      include: {
        candidates: true,
        resolutions: true
      },
    });
    res.json({ success: true, elections });
  } catch (error) {
    console.error('Get Elections Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch elections' });
  }
};

const getUserElections = async (req, res) => {
  const userId = req.user.id;
  try {
    const elections = await prisma.election.findMany({
      where: { createdById: userId },
      // --- MODIFIED: Include resolutions ---
      include: {
        candidates: true,
        resolutions: true
      },
      orderBy: { startTime: 'desc' }
    });
    res.json({ success: true, elections });
  } catch (err) {
    console.error('GetUserElections error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user elections' });
  }
};

const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await prisma.election.findUnique({
      where: { id },
    
      include: {
        candidates: true,
        resolutions: true
      },
    });

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    return res.json({ success: true, election });
  } catch (error) {
    console.error('Get Election By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch election' });
  }
};

// getCandidatesByElectionId remains the same
const getCandidatesByElectionId = async (req, res) => {
  const { electionId } = req.params;
  try {
    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      select: {
        id: true,
        name: true,
        email: true,
        share: true,
      }
    });

    return res.status(200).json({ candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ message: 'Failed to fetch candidates.' });
  }
}

const resendCandidateEmail = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { candidateEmail } = req.body;

    if (!candidateEmail) {
      return res.status(400).json({ success: false, message: 'Candidate email is required.' });
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { candidates: true },
    });

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    const candidateExists = election.candidates.some(c => c.email === candidateEmail);
    if (!candidateExists) {
      return res.status(404).json({ success: false, message: 'Candidate email not found for this election.' });
    }

    // --- MODIFIED: Removed 'description' from email payload ---
    await sendCandidateNotification(candidateEmail, {
      Matter: election.Matter,
      id: election.id,
      title: election.title,
      startTime: election.startTime,
      endTime: election.endTime,
    });

    res.status(200).json({ success: true, message: `Notification email successfully resent to ${candidateEmail}.` });

  } catch (error) {
    console.error('Error resending candidate email:', error);
    res.status(500).json({ success: false, message: 'Failed to resend email.', error: error.message });
  }
};


const getVoteDetails = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Voting token is missing.' });
    }

    try {
        // Step 1: Verify the JWT token using the dedicated secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { candidateId, electionId } = decoded;

        // Step 2: Check if the candidate has already voted in this election
        const existingVote = await prisma.vote.findFirst({
            where: {
                candidateId: candidateId,
                resolution: {
                    electionId: electionId,
                },
            },
        });

        if (existingVote) {
            return res.status(409).json({ success: false, message: 'You have already cast your vote for this election.' });
        }

        // Step 3: Fetch the election details to ensure it's valid and active
        const election = await prisma.election.findUnique({
            where: { id: electionId },
            include: {
                resolutions: true, // Include resolutions for the voting page
            },
        });

        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found.' });
        }

        // Step 4: Check if the election is currently ongoing
        const now = new Date();
        if (now < new Date(election.startTime) || now > new Date(election.endTime)) {
            return res.status(403).json({ success: false, message: 'This election is not currently active for voting.' });
        }

        // Step 5: If all checks pass, return the election data
        res.status(200).json({ success: true, election });

    } catch (error) {
        // Handle specific JWT errors for clear feedback
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(403).json({ success: false, message: 'This voting link has expired.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ success: false, message: 'This voting link is invalid or has been tampered with.' });
        }
        
        console.error('Get Vote Details Error:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};


const submitVote = async (req, res) => {
    const { token, votes } = req.body;

    if (!token || !votes || typeof votes !== 'object' || Object.keys(votes).length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid submission data. Token and votes are required.' });
    }

    try {
        // Step 1: Re-verify the token to ensure authenticity and get payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { candidateId, electionId } = decoded;

        // Step 2: Re-check if the candidate has already voted (critical security check)
        const existingVote = await prisma.vote.findFirst({
            where: { candidateId: candidateId, resolution: { electionId: electionId } },
        });

        if (existingVote) {
            return res.status(409).json({ success: false, message: 'You have already voted in this election.' });
        }

        // Step 3: Prepare the vote data for insertion
        const votesToCreate = Object.entries(votes).map(([resolutionId, choice]) => {
            // Validate the choice to ensure it's one of the allowed values
            if (!['ACCEPT', 'REJECT', 'ABSTAIN'].includes(choice)) {
                throw new Error(`Invalid vote choice "${choice}" provided.`);
            }
            return {
                choice: choice,
                resolutionId: resolutionId,
                candidateId: candidateId,
            };
        });
        
        // Step 4: Use a transaction to save all votes at once
        await prisma.$transaction(
            votesToCreate.map(voteData => prisma.vote.create({ data: voteData }))
        );

        // Step 5: If successful, send back a success response
        res.status(201).json({ success: true, message: 'Your vote has been successfully recorded.' });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ success: false, message: 'Your voting session is invalid or has expired.' });
        }
        console.error('Submit Vote Error:', error);
        res.status(500).json({ success: false, message: 'An error occurred while submitting your vote. Please try again.' });
    }
};


const sendAllReminders = async (req, res) => {
    try {
        const { electionId } = req.params;

        // 1. Fetch the election with all its candidates
        const election = await prisma.election.findUnique({
            where: { id: electionId },
            include: { candidates: true },
        });

        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found.' });
        }

        // 2. Find all votes that have been cast for this election's resolutions
        const votes = await prisma.vote.findMany({
            where: { resolution: { electionId: electionId } },
            select: { candidateId: true }, // We only need to know who voted
        });

        // 3. Create a set of IDs for candidates who have already voted
        const voters = new Set(votes.map(v => v.candidateId));

        // 4. Filter the full candidate list to get only the non-voters
        const nonVoters = election.candidates.filter(candidate => !voters.has(candidate.id));

        if (nonVoters.length === 0) {
            return res.status(200).json({ success: true, message: 'All candidates have already voted. No reminders sent.' });
        }

        // 5. Send a reminder email to each non-voter
        const emailPromises = nonVoters.map(candidate => {
            if (candidate.email) {
                return sendVotingReminder(candidate, { 
                    id: election.id,
                    title: election.title,
                    endTime: election.endTime,
                });
            }
        }).filter(Boolean);

        await Promise.all(emailPromises);

        res.status(200).json({ success: true, message: `Reminders sent successfully to ${nonVoters.length} candidates.` });

    } catch (error) {
        console.error('Error sending reminders:', error);
        res.status(500).json({ success: false, message: 'Failed to send reminders.' });
    }
};



module.exports = {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getUserElections,
  getElectionById,
  getCandidatesByElectionId,
  resendCandidateEmail,
  getVoteDetails,
  submitVote,
  sendAllReminders
};