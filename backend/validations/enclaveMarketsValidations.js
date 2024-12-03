const Joi = require('joi') 

const EnclaveMarketsSchema = { 

    placeOrderValidation : Joi.object({
        order_type: Joi.string().required(),
        size: Joi.number().required(),
    }),

    getOrderByIdValidation : Joi.object({
        orderId: Joi.string().required(),
    }),

}; 

module.exports = EnclaveMarketsSchema;