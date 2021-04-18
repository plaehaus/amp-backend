const Redis = require("ioredis");

exports.handler = async function (event, context) {
    const redis = new Redis(process.env.REDIS_URL);
    await redis.get("upcomingProductions").then(function (result) {
        const upcomingProductions = JSON.parse(result);
        // res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
        return {
            statusCode: 200,
            body: JSON.stringify(upcomingProductions)
        };
    });
};
