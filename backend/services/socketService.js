const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinUserRoom', (userId) => {
            console.log(`User ${socket.id} is joining room for userId: ${userId}`);
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = { initializeSocket };
