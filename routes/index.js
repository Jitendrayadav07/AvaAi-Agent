// index.js
const express = require("express");
const router = express.Router(); 

const arena_post = require("./arena_post");
const enclave_markets = require("./enclave_markets");


router.use("/v1/", arena_post);
router.use("/v2", enclave_markets);


module.exports = router;