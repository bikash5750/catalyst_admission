'use strict';

function normalizeKeys(req, res, next) {
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        const normalizedBody = {};

        for (const key of Object.keys(req.body)) {
            normalizedBody[key.toLowerCase()] = req.body[key];
        }

        req.body = normalizedBody;
    }

    next();
}

module.exports = normalizeKeys;
