'use strict';

const { validatePassword } = require('./password');

function validateUserDetails({ name, email, password } = {}) {
    const errors = [];

    if (typeof name !== 'string' || !name.trim()) {
        errors.push('Name is required');
    } else if (name.trim().length > 100) {
        errors.push('Name must be 100 characters or fewer');
    }

    if (typeof email !== 'string' ||
        email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('A valid email is required');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        errors.push(passwordError);
    }

    return errors;
}

module.exports = {
    validateUserDetails
};
