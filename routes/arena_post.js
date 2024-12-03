const express = require("express");
const router = express.Router();
const areanController = require("../controllers/areanController");


router.post("/send-data",
    areanController.areanPostController);

module.exports = router;