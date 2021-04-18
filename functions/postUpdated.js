const axios = require('axios');
const Redis = require("ioredis");

const validateCredentials = (authorization) => {
    const credentials = `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`;
    const expected = Buffer.from(credentials, "utf8").toString("base64");
    const isValid = authorization === `Basic ${expected}`;
    return isValid;
};

const fetchUpcomingProductions = async () => {
    const data = {
        query: `{
            productions(first: 20, where: {categoryNotIn: 21}) {
                edges {
                    node {
                        title
                        dates: productionDates {
                            dateTimes: ampEventDatesTimes {
                                dateTime: ampEventDateTime
                            }
                        }
                        tickets: productionTickets {
                            external: ampEventExternalTicketing
                            url: ampEventGetTicketsUrl
                            prices: ampEventTicketPrices {
                                level: ampEventAdmissionLevel
                                price: ampEventPrice
                            }
                        }
                        image: featuredImage {
                            node {
                                url: sourceUrl(size: MEDIUM_LARGE)
                            }
                        }
                        link
                    }
                }
            }
        }`
    };
    const response = await axios.post(process.env.AMP_STATIC_API_GRAPHQL_URI, data);
    if (response.status !== 200) {
        return null;
    } else {
        return response.data;
    }
};

const saveUpcomingProductions = async (upcomingProductions) => {
    const redis = new Redis(process.env.REDIS_URL);
    await redis.set("upcomingProductions", JSON.stringify(upcomingProductions));
};

exports.handler = async function (event, context) {
    if (!validateCredentials(event.headers['authorization'])) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: "Unauthorized" })
        };
    } else {
        const upcomingProductions = await fetchUpcomingProductions();
        if (upcomingProductions === null) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Could not fetch upcoming productions" })
            };
        } else {
            await saveUpcomingProductions(upcomingProductions);
            return {
                statusCode: 200,
                body: JSON.stringify({ postId: event.body.postId })
            };
        }
    }
};
