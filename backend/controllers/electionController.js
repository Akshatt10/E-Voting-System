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

    if (!resolutions || !Array.isArray(resolutions) || resolutions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one resolution is required.' });
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    const election = await prisma.election.create({
      data: {
        Matter,
        title,
        startTime: parsedStart.toISOString(), // store in UTC
        endTime: parsedEnd.toISOString(),
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

const cancelElection = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedElection = await prisma.election.update({
      where: { id },
      data: {
        // isPublished: false, // You may or may not want this
        status: 'CANCELLED' // Using the enum value directly
      }
    });

    // --- THIS IS THE KEY FIX ---
    // Get the Socket.IO instance and emit an update to the creator's room
    const io = req.app.get('socketio'); // Assumes you've attached io to the app instance
    if (io && updatedElection.createdById) {
        io.to(updatedElection.createdById).emit('electionUpdate', updatedElection);
        console.log(`Sent 'CANCELLED' status update for election ${id} to user ${updatedElection.createdById}`);
    }
    // --- END OF FIX ---

    res.json({ success: true, message: 'Election cancelled successfully', updated: updatedElection });
  } catch (error) {
    console.error('Cancel Election Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel election' });
  }
};


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
        const now = new Date();

        if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format.'
            });
        }

        if (parsedEnd <= parsedStart) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time.'
            });
        }
        let newStatus;
        if (now < parsedStart) {
            newStatus = 'SCHEDULED';
        } else {
            newStatus = 'ONGOING';
        }

        const updatedElection = await prisma.election.update({
            where: { id },
            data: {
                startTime: parsedStart,
                endTime: parsedEnd,
                status: newStatus,
            }
        });
        return res.json({ success: true, message: 'Election rescheduled successfully', updated: updatedElection });

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
      include: { candidates: true }, // We need the full candidate list
    });

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    // --- THIS IS THE KEY FIX ---
    // Find the full candidate object that matches the email
    const candidate = election.candidates.find(c => c.email === candidateEmail);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate email not found for this election.' });
    }

    // Now, call the email function with the FULL candidate object
    // Using sendVotingReminder is more appropriate here
    await sendVotingReminder(candidate, {
      id: election.id,
      title: election.title,
      endTime: election.endTime,
    });
    // --- END OF FIX ---

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

const getElectionResults = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user.id; // From the authenticateToken middleware

        // Step 1: Fetch the election and verify ownership and completion status
        const election = await prisma.election.findUnique({
            where: { id: electionId },
            include: {
                resolutions: true,
                candidates: true,
            },
        });

        // Security Check 1: Ensure the election exists
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found.' });
        }

        // Security Check 2: Ensure the user requesting the results is the one who created the election
        if (election.createdById !== userId) {
            return res.status(403).json({ success: false, message: 'You are not authorized to view these results.' });
        }
        
        // Security Check 3: Ensure the election is actually completed
        if (new Date() < new Date(election.endTime)) {
            return res.status(403).json({ success: false, message: 'Cannot view results for an election that has not yet ended.' });
        }

        // Step 2: Fetch all votes for all resolutions in this election
        const allVotes = await prisma.vote.findMany({
            where: {
                resolution: {
                    electionId: electionId,
                },
            },
            include: {
                candidate: true, // Include the candidate details with each vote
            },
        });

        // Step 3: Process the data into a structured report
        const results = election.resolutions.map(resolution => {
            // Find all votes specifically for this resolution
            const resolutionVotes = allVotes.filter(vote => vote.resolutionId === resolution.id);
            
            const voterIds = new Set(resolutionVotes.map(v => v.candidateId));
            
            // Find candidates who did NOT vote on this resolution
            const nonVoters = election.candidates.filter(c => !voterIds.has(c.id));

            // Calculate the total share for each choice
            const totals = resolutionVotes.reduce((acc, vote) => {
                const share = vote.candidate.share;
                if (vote.choice === 'ACCEPT') acc.accept += share;
                if (vote.choice === 'REJECT') acc.reject += share;
                if (vote.choice === 'ABSTAIN') acc.abstain += share;
                return acc;
            }, { accept: 0, reject: 0, abstain: 0 });

            // Calculate the total share of non-voters
            totals.notVoted = nonVoters.reduce((sum, c) => sum + c.share, 0);

            return {
                resolutionId: resolution.id,
                title: resolution.title,
                description: resolution.description,
                // Map votes to a clean format for the frontend table
                votes: resolutionVotes.map(v => ({
                    candidateName: v.candidate.name,
                    share: v.candidate.share,
                    choice: v.choice,
                    votedAt: v.createdAt,
                })),
                nonVoters: nonVoters.map(c => ({
                    candidateName: c.name,
                    share: c.share,
                })),
                totals: {
                    accept: parseFloat(totals.accept.toFixed(2)),
                    reject: parseFloat(totals.reject.toFixed(2)),
                    abstain: parseFloat(totals.abstain.toFixed(2)),
                    notVoted: parseFloat(totals.notVoted.toFixed(2)),
                },
            };
        });

        // Step 4: Send the final, processed report
        res.status(200).json({
            success: true,
            results: {
                electionTitle: election.title,
                electionMatter: election.Matter,
                resolutions: results,
            },
        });

    } catch (error) {
        console.error("Get Election Results Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch election results." });
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
  sendAllReminders,
  getElectionResults
};