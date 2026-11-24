'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { paginate, getAllRows } = require('../src/utils/pagination');
const { hashPassword, validatePassword } = require('../src/utils/password');
const { validateUserDetails } = require('../src/utils/validation');

test('paginate validates inputs and returns one page', async () => {
    let receivedOptions;
    const table = {
        async getPagedRows(options) {
            receivedOptions = options;
            return {
                data: [{ id: '1' }],
                next_token: 'next-page',
                more_records: true
            };
        }
    };

    const result = await paginate(table, { limit: '5' });

    assert.deepEqual(receivedOptions, { maxRows: 5 });
    assert.deepEqual(result, {
        rows: [{ id: '1' }],
        limit: 5,
        nextToken: 'next-page',
        hasMore: true
    });
    assert.equal((await paginate(table, { limit: '201' })).error,
        'Limit must be between 1 and 200');
});

test('getAllRows follows next tokens until no pages remain', async () => {
    const requestedTokens = [];
    const table = {
        async getPagedRows(options) {
            requestedTokens.push(options.nextToken);
            if (!options.nextToken) {
                return { data: [{ id: '1' }], next_token: 'next', more_records: true };
            }
            return { data: [{ id: '2' }], more_records: false };
        }
    };

    assert.deepEqual(await getAllRows(table), [{ id: '1' }, { id: '2' }]);
    assert.deepEqual(requestedTokens, [undefined, 'next']);
});

test('password validation rejects too-short and bcrypt-incompatible values', () => {
    assert.equal(validatePassword('short'), 'Password must be at least 8 characters');
    assert.equal(validatePassword('a'.repeat(73)), 'Password must be 72 bytes or fewer');
    assert.equal(validatePassword('a-secure-password'), null);
});

test('hashPassword creates a bcrypt hash that verifies the original password', async () => {
    const bcrypt = require('bcrypt');
    const password = 'a-secure-password';
    const hash = await hashPassword(password);

    assert.notEqual(hash, password);
    assert.equal(await bcrypt.compare(password, hash), true);
});

test('validateUserDetails checks the shared registration fields', () => {
    assert.deepEqual(validateUserDetails({
        name: 'Taylor User',
        email: 'taylor@example.com',
        password: 'a-secure-password'
    }), []);
    assert.deepEqual(validateUserDetails({
        name: ' ',
        email: 'bad-email',
        password: 'short'
    }), [
        'Name is required',
        'A valid email is required',
        'Password must be at least 8 characters'
    ]);
});
