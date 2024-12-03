const Joi = require('joi'); 
const Response = require("../../classes/Response");
const JoiMiddleWare = (schema, property) => { 
  return (req, res, next) => { 
    const  error  = schema.validate(req[property]);
    if(error.error)
        return res.status(400).json(Response.sendResponse(false,null, error.error.details[0].message ,400));

    next();
    } 
}

module.exports = JoiMiddleWare; 