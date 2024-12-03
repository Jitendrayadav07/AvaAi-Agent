class Response {
    static sendResponse(isSuccess, result, message, statusCode) {
        return {
            isSuccess,
            result,
            message,
            statusCode
        }
    }
}

module.exports = Response;