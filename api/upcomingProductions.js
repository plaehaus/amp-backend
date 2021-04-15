const Redis = require("ioredis");

module.exports = async (req, res) => {
    const redis = new Redis(process.env.REDIS_URL);
    await redis.get("upcomingProductions").then(function (result) {
        const upcomingProductions = JSON.parse(result);
        res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
        res.json(upcomingProductions);
    });
};