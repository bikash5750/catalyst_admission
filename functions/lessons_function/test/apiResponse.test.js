'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { successResponse, failureResponse } = require('../src/utils/apiResponse');

function createResponse() {
    return {
        statusCode: null,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('successResponse sends a successful JSON response', () => {
    const res = createResponse();

    successResponse(res, 201, { message: 'Created' });

    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, { message: 'Created', success: true });
});

test('failureResponse sends an unsuccessful JSON response', () => {
    const res = createResponse();

    failureResponse(res, 400, { message: 'Invalid input' });

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Invalid input', success: false });
});
