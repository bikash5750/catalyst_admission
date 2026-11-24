# User Registration API

A small Express API organized into routes, controllers, middleware, services, models, and repositories.

## Run locally

From the project root, run:

```sh
npm start
```

Alternatively, run `npm start` inside `functions/lessons_function`. The API listens at `http://localhost:3001` by default. Set `PORT` to change it.

## Register a user

In Postman, choose **POST**, set the URL to `http://localhost:3001/api/auth/register`, select **Body → raw → JSON**, and send:

```json
{
  "name": "Alex Smith",
  "email": "alex@example.com",
  "password": "choose-a-password"
}
```

The password must contain at least 8 characters. The API hashes passwords with Node's built-in scrypt function and never includes password data in the response. Postman does not require an authorization header for this endpoint.

`GET /api/health` is available as a health check.

## Storage note

This starter stores accounts in memory, so they are lost when the server restarts and are not shared across instances. Replace `src/repositories/userRepository.js` with a durable database adapter before using real accounts.
