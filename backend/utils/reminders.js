const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendVotingReminder, delay } = require('../utils/send_email');

const sendDailyReminders = async () => {
  console.log('Starting daily reminder job...');
  const now = new Date();
  
  try {
    const ongoingElections = await prisma.election.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
        NOT: {
          status: 'CANCELLED'
        }
      },
      include: { candidates: true },
    });
    
    if (ongoingElections.length === 0) {
      console.log('No ongoing elections found. Reminder job finished.');
      return;
    }
    
    console.log(`Found ${ongoingElections.length} ongoing election(s).`);
    
    for (const election of ongoingElections) {
      const votes = await prisma.vote.findMany({
        where: { resolution: { electionId: election.id } },
        select: { candidateId: true },
      });
      
      const voters = new Set(votes.map(v => v.candidateId));
      const nonVoters = election.candidates.filter(c => !voters.has(c.id));
      
      if (nonVoters.length > 0) {
        console.log(`Sending ${nonVoters.length} reminders for election: "${election.title}"`);
        
        for (const candidate of nonVoters) {
          if (candidate.email) {
            try {
              await sendVotingReminder(candidate, {
                id: election.id,
                title: election.title,
                endTime: election.endTime,
              });
              await delay(2500); // Wait 2.5 seconds between emails
            } catch (error) {
              console.error(`Failed to send reminder to ${candidate.email}:`, error);
            }
          }
        }
      } else {
        console.log(`All candidates have voted in "${election.title}". No reminders needed.`);
      }
    }
    
    console.log('Daily reminder job completed successfully.');
  } catch (error) {
    console.error('Error during daily reminder job:', error);
  }
};

module.exports = { sendDailyReminders };