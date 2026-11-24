'use strict';

function successResponse(res, statusCode, data = {}) {
    return res.status(statusCode).json({
        ...data,
        success: true
    });
}

function failureResponse(res, statusCode, data = {}) {
    return res.status(statusCode).json({
        ...data,
        success: false
    });
}

module.exports = {
    successResponse,
    failureResponse
};
