const assert = require('node:assert/strict')
const { once } = require('node:events')
const test = require('node:test')
const app = require('../src/app')
const UserRepository = require('../src/repositories/userRepository')
const { createUserService } = require('../src/services/userService')

test('registers a user and returns only public account fields', async () => {
	const repository = new UserRepository()
	const service = createUserService(repository)
	const user = await service.register({
		name: 'Alex Smith',
		email: 'Alex@Example.com',
		password: 'a-secure-password',
	})

	assert.equal(user.name, 'Alex Smith')
	assert.equal(user.email, 'alex@example.com')
	assert.ok(user.id)
	assert.ok(user.createdAt)
	assert.equal('password' in user, false)
	assert.equal('passwordHash' in user, false)
	const storedUser = await repository.findByEmail(user.email)
	assert.notEqual(storedUser.passwordHash, 'a-secure-password')
	assert.equal(storedUser.passwordSalt.length, 32)
})

test('rejects duplicate email addresses regardless of case', async () => {
	const service = createUserService(new UserRepository())
	await service.register({
		name: 'Alex Smith',
		email: 'alex@example.com',
		password: 'a-secure-password',
	})

	await assert.rejects(
		service.register({
			name: 'Another Alex',
			email: 'ALEX@example.com',
			password: 'another-secure-password',
		}),
		{ statusCode: 409 },
	)
})

test('register endpoint validates fields and responds without password data', async (t) => {
	const server = app.listen(0)
	await once(server, 'listening')
	t.after(() => new Promise((resolve) => server.close(resolve)))
	const address = server.address()
	const url = `http://127.0.0.1:${address.port}/api/auth/register`

	const invalidResponse = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ name: '', email: 'bad-email', password: 'short' }),
	})
	assert.equal(invalidResponse.status, 400)

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			name: 'Taylor User',
			email: `taylor-${Date.now()}@example.com`,
			password: 'a-secure-password',
		}),
	})
	const result = await response.json()
	assert.equal(response.status, 201)
	assert.equal(result.user.name, 'Taylor User')
	assert.equal('password' in result.user, false)
})
