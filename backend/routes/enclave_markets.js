const express = require("express");
const router = express.Router();
const enclaveMarkertController = require("../controllers/enclaveMarketsController");
const EnclaveMarketsSchema = require("../validations/enclaveMarketsValidations");
const JoiMiddleWare = require('../middlewares/joi/joiMiddleware'); 

router.post("/place-order",
    JoiMiddleWare(EnclaveMarketsSchema.placeOrderValidation,"body"),
    enclaveMarkertController.placeOrder);

router.get("/get-all-orders", 
    enclaveMarkertController.getAllOrders);

router.get("/get-orders/:orderId", 
    JoiMiddleWare(EnclaveMarketsSchema.getOrderByIdValidation,"params"),
    enclaveMarkertController.getOrderById);

module.exports = router;