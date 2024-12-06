const axios = require('axios');
const ARENA_POST_CONSTANTS = require("../constants/arenaPostConstant");
const Response = require("../classes/Response");
require('dotenv').config();


const areanPostController = async (req, res) => {
    const thirdPartyUrl = 'https://api.starsarena.com/threads'; // Replace with the actual URL
    const payload = req.body; // Data received in the request body
    const headers = {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json"
    };
    
    try {
        const response = await axios.post(thirdPartyUrl, payload, {headers});
        res.status(200).json(Response.sendResponse(true, response.data, ARENA_POST_CONSTANTS.DATA_SENT_SUCCESSFULLY, 200));
    } catch (error) {
        console.error('Error sending data to third-party URL:', error);
        res.status(500).json(Response.sendResponse(false, null, ARENA_POST_CONSTANTS.FAILED_TO_SEND_DATA, 500));
    }
}

module.exports = {
    areanPostController
};