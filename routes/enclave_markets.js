const express = require("express");
const router = express.Router();
const enclaveMarkertController = require("../controllers/enclaveMarketsController");
const { placeOrderValidation, getOrderByIdValidation } = require('../validations/enclaveMarketsValidations');

router.post("/place-order",
    placeOrderValidation,
    enclaveMarkertController.placeOrder);

router.get("/get-all-orders", 
    enclaveMarkertController.getAllOrders);

router.get("/get-stats", 
    enclaveMarkertController.getStats);

router.get("/get-orders/:orderId", 
    getOrderByIdValidation,
    enclaveMarkertController.getOrderById);

module.exports = router;