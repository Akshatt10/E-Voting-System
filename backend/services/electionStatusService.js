const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const startStatusUpdater = (io) => {
    // Run a check every 10 seconds
    setInterval(async () => {
        const now = new Date();
        
        try {
            // 1. Find elections that just became 'ONGOING'
            const electionsToStart = await prisma.election.findMany({
                where: {
                    status: 'SCHEDULED',
                    startTime: { lte: now },
                },
            });

            if (electionsToStart.length > 0) {
                const idsToUpdate = electionsToStart.map(e => e.id);
                await prisma.election.updateMany({
                    where: { id: { in: idsToUpdate } },
                    data: { status: 'ONGOING' },
                });
                // For each updated election, notify its creator
                electionsToStart.forEach(election => {
                    console.log(`Election ${election.title} is now ONGOING. Notifying user ${election.createdById}`);
                    io.to(election.createdById).emit('electionUpdate', { ...election, status: 'ONGOING' });
                });
            }

            // 2. Find elections that just became 'COMPLETED'
            const electionsToEnd = await prisma.election.findMany({
                where: {
                    status: 'ONGOING',
                    endTime: { lte: now },
                },
            });

            if (electionsToEnd.length > 0) {
                const idsToUpdate = electionsToEnd.map(e => e.id);
                await prisma.election.updateMany({
                    where: { id: { in: idsToUpdate } },
                    data: { status: 'COMPLETED' },
                });
                // For each updated election, notify its creator
                electionsToEnd.forEach(election => {
                    console.log(`Election ${election.title} is now COMPLETED. Notifying user ${election.createdById}`);
                    io.to(election.createdById).emit('electionUpdate', { ...election, status: 'COMPLETED' });
                });
            }

        } catch (error) {
            console.error('Error in status updater:', error);
        }
    }, 10000); // Check every 10 seconds
};

module.exports = { startStatusUpdater };