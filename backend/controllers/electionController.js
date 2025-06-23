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
    const { title, description, startTime, endTime, candidates } = req.body;
    
    // Create the election
    const election = await prisma.election.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPublished: true,
        candidates: {
          create: candidates.map(candidate => ({
            name: candidate.name,
            email: candidate.email
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

module.exports = {
  createElection,
  cancelElection,
  rescheduleElection,
  getAllElections,
  getElectionById
};