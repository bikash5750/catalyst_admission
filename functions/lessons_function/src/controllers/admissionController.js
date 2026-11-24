
'use strict';

const catalyst = require('zcatalyst-sdk-node');
const { successResponse, failureResponse } = require('../utils/apiResponse');
const { paginate, getAllRows } = require('../utils/pagination');
const { hashPassword } = require('../utils/password');
const { validateUserDetails } = require('../utils/validation');

const TABLE_NAME = 'Users';

// Initialize Catalyst Data Store
function getTable(req) {
    const catalystApp = catalyst.initialize(req, {
        scope: 'admin'
    });

    return catalystApp.datastore().table(TABLE_NAME);
}

// Remove password from API responses
function safeStudent(student) {
    if (!student) return student;

    const {
        password,
        passwordHash,
        passwordSalt,
        ...studentData
    } = student;
    return studentData;
}

// Common error response
function handleError(res, error, message) {
    console.error(message, error);

    return failureResponse(res, 500, {
        message,
        error: error.message
    });
}

// 1. CREATE ADMISSION
async function create(req, res) {
    try {
        const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
            ? req.body
            : {};
        const { name, email, password } = body;

        const errors = validateUserDetails({
            name,
            email,
            password
        });

        if (errors.length > 0) {
            return failureResponse(res, 400, {
                errors
            });
        }

        const table = getTable(req);

        const student = await table.insertRow({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: await hashPassword(password),
            admissiondone: false
        });

        return successResponse(res, 201, {
            message: 'Admission created successfully',
            student: safeStudent(student)
        });

    } catch (error) {
        return handleError(res, error, 'Unable to create admission');
    }
}

// 2. GET ALL ADMISSIONS WITH PAGINATION
async function list(req, res) {
    try {
        const result = await paginate(getTable(req), req.query);

        if (result.error) {
            return failureResponse(res, 400, {
                message: result.error
            });
        }

        return successResponse(res, 200, {
            totalReturned: result.rows.length,
            students: result.rows.map(safeStudent),
            pagination: {
                limit: result.limit,
                nextToken: result.nextToken,
                hasMore: result.hasMore
            }
        });

    } catch (error) {
        return handleError(res, error, 'Unable to fetch admissions');
    }
}

// 3. GET STUDENT BY EMAIL
async function getByEmail(req, res) {
    try {
        const email = req.params && req.params.email;

        if (
            typeof email !== 'string' ||
            email.trim().length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return failureResponse(res, 400, {
                message: 'Please provide a valid email'
            });
        }

        const table = getTable(req);
        const students = await getAllRows(table);

        const student = students.find(
            item => item.email?.toLowerCase() === email.trim().toLowerCase()
        );

        if (!student) {
            return failureResponse(res, 404, {
                message: 'Student not found'
            });
        }

        return successResponse(res, 200, {
            student: safeStudent(student)
        });

    } catch (error) {
        return handleError(res, error, 'Unable to find student');
    }
}

// 4. GET ADMISSION STATISTICS
async function getStats(req, res) {
    try {
        const table = getTable(req);
        const students = await getAllRows(table);

        const admitted = students.filter(
            item => item.admissiondone === true
        ).length;

        const notAdmitted = students.filter(
            item => item.admissiondone === false
        ).length;

        return successResponse(res, 200, {
            totalStudents: students.length,
            admitted,
            notAdmitted
        });

    } catch (error) {
        return handleError(res, error, 'Unable to fetch statistics');
    }
}

// 5. UPDATE ADMISSION STATUS
async function updateStatus(req, res) {
    try {
        const id = req.params && req.params.id;
        const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
            ? req.body
            : {};
        const { status } = body;

        if (
            typeof id !== 'string' ||
            !/^[1-9]\d*$/.test(id) ||
            !Number.isSafeInteger(Number(id))
        ) {
            return failureResponse(res, 400, {
                message: 'Valid row ID is required'
            });
        }

        const statusMap = {
            'Admitted': true,
            'Not Admitted': false
        };

        if (!Object.prototype.hasOwnProperty.call(statusMap, status)) {
            return failureResponse(res, 400, {
                message: 'Status must be Admitted or Not Admitted'
            });
        }

        const table = getTable(req);

        const student = await table.updateRow({
            ROWID: id,
            admissiondone: statusMap[status]
        });

        return successResponse(res, 200, {
            message: 'Admission status updated successfully',
            student: safeStudent(student)
        });

    } catch (error) {
        return handleError(res, error, 'Unable to update admission');
    }
}

// 6. DELETE ADMISSION
async function remove(req, res) {
    try {
        const id = req.params && req.params.id;

        if (
            typeof id !== 'string' ||
            !/^[1-9]\d*$/.test(id) ||
            !Number.isSafeInteger(Number(id))
        ) {
            return failureResponse(res, 400, {
                message: 'Valid row ID is required'
            });
        }

        const table = getTable(req);

        await table.deleteRow(id);

        return successResponse(res, 200, {
            message: 'Admission deleted successfully'
        });

    } catch (error) {
        return handleError(res, error, 'Unable to delete admission');
    }
}

module.exports = {
    create,
    list,
    getByEmail,
    getStats,
    updateStatus,
    remove
};
