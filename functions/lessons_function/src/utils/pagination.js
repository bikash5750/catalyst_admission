'use strict';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;
const MAX_TOKEN_LENGTH = 4096;

function validatePagination(query) {
    const params = query && typeof query === 'object' ? query : {};
    const limit = Number(params.limit || DEFAULT_LIMIT);
    const nextToken = params.nextToken;

    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        return { error: `Limit must be between 1 and ${MAX_LIMIT}` };
    }

    if (nextToken !== undefined &&
        (typeof nextToken !== 'string' || nextToken.length > MAX_TOKEN_LENGTH)) {
        return { error: 'nextToken must be a valid token' };
    }

    return { limit, nextToken };
}

async function paginate(table, query) {
    const pagination = validatePagination(query);

    if (pagination.error) {
        return pagination;
    }

    const options = { maxRows: pagination.limit };
    if (pagination.nextToken) {
        options.nextToken = pagination.nextToken;
    }

    const result = await table.getPagedRows(options);

    return {
        rows: result.data || [],
        limit: pagination.limit,
        nextToken: result.next_token || null,
        hasMore: Boolean(result.more_records)
    };
}

async function getAllRows(table) {
    let rows = [];
    let nextToken;

    while (true) {
        const options = { maxRows: MAX_LIMIT };
        if (nextToken) {
            options.nextToken = nextToken;
        }

        const result = await table.getPagedRows(options);
        rows = rows.concat(result.data || []);

        if (!result.more_records) {
            return rows;
        }

        if (!result.next_token || result.next_token === nextToken) {
            throw new Error('Pagination did not return a new nextToken');
        }

        nextToken = result.next_token;
    }
}

module.exports = {
    paginate,
    getAllRows
};
