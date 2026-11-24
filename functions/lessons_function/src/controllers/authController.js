const userService = require('../services/userService')
const { successResponse, failureResponse } = require('../utils/apiResponse')
const { hashPassword } = require('../utils/password')
const { validateUserDetails } = require('../utils/validation')

function safeUser(user) {
	if (!user || typeof user !== 'object') return user

	const {
		password,
		passwordHash,
		passwordSalt,
		...publicUser
	} = user
	return publicUser
}

async function register(req, res) {
	const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
		? req.body
		: {}
	const errors = validateUserDetails(body)

	if (errors.length > 0) {
		return failureResponse(res, 400, { errors })
	}

	try {
		const user = await userService.register({
			name: body.name.trim(),
			email: body.email.trim().toLowerCase(),
			password: await hashPassword(body.password),
		})
		return successResponse(res, 201, {
			message: 'Account created successfully',
			user: safeUser(user),
		})
	} catch (error) {
		console.error('Unable to register account', error)
		const statusCode = error && Number.isInteger(error.statusCode) &&
			error.statusCode >= 400 && error.statusCode < 500
			? error.statusCode
			: 500
		return failureResponse(res, statusCode, {
			message: statusCode === 409
				? 'An account with this email already exists'
				: 'Unable to create account',
		})
	}
}

module.exports = { register }
