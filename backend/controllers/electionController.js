const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { sendCandidateNotification } = require('../utils/send_email');

const VoteStatus = {
  SCHEDULED: "SCHEDULED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const createElection = async (req, res) => {
  try {
    const { Matter, title, description, startTime, endTime, candidates } = req.body;
    
    // Create the election
    const election = await prisma.election.create({
      data: {
        Matter,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPublished: true,
        candidates: {
          create: candidates.map(candidate => ({
            name: candidate.name,
            email: candidate.email,
            share: parseFloat(candidate.share)
          }))
        }
      },
      include: {
        candidates: true 
      }
    });

    const emailPromises = candidates.map(candidate => {
      if (candidate.email) {
        return sendCandidateNotification(candidate.email, {
          Matter: election.Matter,
          id: election.id,
          title: election.title,
          description: election.description,
          startTime: election.startTime,
          endTime: election.endTime
        });
      }
    }).filter(Boolean); // Remove undefined promises

    // Send emails asynchronously (don't wait for them)
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
      include: { candidates: true },
    });
    res.json({ success: true, elections });
  } catch (error) {
    console.error('Get Elections Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch elections' });
  }
};

const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await prisma.election.findUnique({
      where: { id },
      include: { candidates: true },
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
        description: true
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
    const { electionId } = req.params; // Get election ID from URL parameters
    const { candidateEmail } = req.body; // Get candidate's email from the request body

    if (!candidateEmail) {
      return res.status(400).json({ success: false, message: 'Candidate email is required.' });
    }

    // 1. Fetch the election details from the database using Prisma
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { candidates: true }, // Include candidates to potentially verify the email belongs to this election
    });

    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found.' });
    }

    // Optional: Verify if the candidateEmail actually belongs to this election
    const candidateExists = election.candidates.some(c => c.email === candidateEmail);
    if (!candidateExists) {
        // If the email is not found among this election's candidates,
        // you might still want to send a success response to avoid exposing valid emails,
        // or return an error if strict validation is desired.
        // For now, we'll return an error if the email isn't linked to the election.
        return res.status(404).json({ success: false, message: 'Candidate email not found for this election.' });
    }

    // 2. Call your existing sendCandidateNotification function
    // Pass the candidate's email and the necessary election data
    await sendCandidateNotification(candidateEmail, {
      Matter: election.Matter,
      id: election.id,
      title: election.title,
      description: election.description,
      startTime: election.startTime,
      endTime: election.endTime,
    });

    res.status(200).json({ success: true, message: `Notification email successfully resent to ${candidateEmail}.` });

  } catch (error) {
    console.error('Error resending candidate email:', error);
    res.status(500).json({ success: false, message: 'Failed to resend email.', error: error.message });
  }
};

module.exports = {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getElectionById,
  getCandidatesByElectionId,
  resendCandidateEmail
};