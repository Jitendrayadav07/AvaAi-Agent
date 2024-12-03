const { body,param } = require('express-validator');

const placeOrderValidation = [
    body('order_type')
        .trim()
        .notEmpty()
        .withMessage('Order type is required')
        .isIn(['buy', 'sell'])
        .withMessage('Order type must be "buy" or "sell"')
        .toLowerCase(),
    
    body('size')
        .notEmpty()
        .withMessage('Size is required')
        .isNumeric()
        .withMessage('Size must be a number')
        .custom(value => {
            if (value <= 0) {
                throw new Error('Size must be greater than 0');
            }
            return true;
        })
];

const getOrderByIdValidation = [
    param('orderId')
        .notEmpty()
        .withMessage('Order ID is required')
        .isString()
        .withMessage('Order ID must be a string'),
];


module.exports = {
    placeOrderValidation,
    getOrderByIdValidation
};