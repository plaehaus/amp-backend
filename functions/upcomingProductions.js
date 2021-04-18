const Redis = require("ioredis");

exports.handler = async function (event, context) {
    const redis = new Redis(process.env.REDIS_URL);
    const result = await redis.get("upcomingProductions");
    return {
        statusCode: 200,
        body: result
    };
};
