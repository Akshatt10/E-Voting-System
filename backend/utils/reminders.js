const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendVotingReminder } = require('../utils/send_email'); // Correct the path if needed

const sendDailyReminders = async () => {
    console.log('Starting daily reminder job...');
    const now = new Date();

    try {
        // Find all elections that are currently active based on time
        const ongoingElections = await prisma.election.findMany({
            where: {
                startTime: { lte: now }, // lte = Less Than or Equal To
                endTime: { gte: now },   // gte = Greater Than or Equal To
                // --- REMOVED: The strict status check is no longer needed here ---
                // status: 'ONGOING' 
                // We also don't want to send reminders for cancelled elections
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

        // Process each election
        for (const election of ongoingElections) {
            const votes = await prisma.vote.findMany({
                where: { resolution: { electionId: election.id } },
                select: { candidateId: true },
            });

            const voters = new Set(votes.map(v => v.candidateId));
            const nonVoters = election.candidates.filter(c => !voters.has(c.id));

            if (nonVoters.length > 0) {
                console.log(`Sending ${nonVoters.length} reminders for election: "${election.title}"`);
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