const {createClient} = require('redis');

const redisClient = createClient();

redisClient.connect().catch((err) => {
    console.error('Redis connection error:', err);
});

module.exports = redisClient;
