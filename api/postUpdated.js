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
        // query: `{
        //     productions(first: 20, where: {categoryNotIn: 21}) {
        //         edges {
        //             node {
        //                 id
        //                 title
        //                 details: productionDetails {
        //                     summary: ampEventOneParagraphSummary
        //                 }
        //                 gallery: productionGallery {
        //                     photoCredit: ampEventPhotoCredit
        //                     photos: ampEventPhotos {
        //                         title
        //                         uri
        //                     }
        //                 }
        //                 dates: productionDates {
        //                     start: ampEventStartDate
        //                     dateTimes: ampEventDatesTimes {
        //                         dateTime: ampEventDateTime
        //                     }
        //                 }
        //                 tickets: productionTickets {
        //                     external: ampEventExternalTicketing
        //                     url: ampEventGetTicketsUrl
        //                     prices: ampEventTicketPrices {
        //                         level: ampEventAdmissionLevel
        //                         price: ampEventPrice
        //                     }
        //                 }
        //                 people: productionPeople {
        //                     featuring: ampEventFeaturing
        //                     band: ampEventFullBand
        //                     cast: ampEventFullCast
        //                     starring: ampEventStarring
        //                     team: ampProductionTeam
        //                     personnel: ampEventPersonnel {
        //                         name: ampEventPersonnelName
        //                         role: ampEventPersonnelRole
        //                     }
        //                     crew: ampEventCrew {
        //                         name: ampEventCrewName
        //                         role: ampEventCrewRole
        //                     }
        //                 }
        //                 image: featuredImage {
        //                     node {
        //                         url: sourceUrl(size: MEDIUM_LARGE)
        //                     }
        //                 }
        //                 link
        //             }
        //         }
        //     }
        // }`
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

module.exports = async (req, res) => {
    if (!validateCredentials(req.headers['authorization'])) {
        res.status(401).json("Unauthorized");
    } else {
        const upcomingProductions = await fetchUpcomingProductions();
        if (upcomingProductions === null) {
            res.status(500).json("Could not fetch upcoming productions");
        } else {
            await saveUpcomingProductions(upcomingProductions);
            res.json(`postId:${req.body.postId}`);
        }
    }
};