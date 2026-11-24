'use strict';

const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

function validatePassword(password) {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
        return `Password must be ${MAX_PASSWORD_BYTES} bytes or fewer`;
    }

    return null;
}

function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

module.exports = {
    validatePassword,
    hashPassword
};
