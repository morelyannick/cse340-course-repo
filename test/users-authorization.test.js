import assert from 'node:assert/strict';
import test from 'node:test';
import { validationResult } from 'express-validator';
import {
  requireRole,
  userRegistrationValidation
} from '../src/controllers/users.js';

const createResponse = () => ({
  redirectedTo: null,
  redirect(path) {
    this.redirectedTo = path;
    return this;
  }
});

const createRequest = (user = null) => ({
  session: user ? { user } : {},
  flashedMessages: [],
  flash(type, message) {
    this.flashedMessages.push({ type, message });
  }
});

test('requireRole allows an admin user to continue', () => {
  const req = createRequest({ role_name: 'admin' });
  const res = createResponse();
  let nextCalled = false;

  requireRole('admin')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.redirectedTo, null);
  assert.deepEqual(req.flashedMessages, []);
});

test('requireRole redirects a regular user to the dashboard', () => {
  const req = createRequest({ role_name: 'user' });
  const res = createResponse();
  let nextCalled = false;

  requireRole('admin')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.redirectedTo, '/dashboard');
  assert.equal(req.flashedMessages[0].type, 'error');
});

test('requireRole redirects a logged-out visitor to login', () => {
  const req = createRequest();
  const res = createResponse();
  let nextCalled = false;

  requireRole('admin')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.redirectedTo, '/login');
  assert.equal(req.flashedMessages[0].type, 'error');
});

test('registration accepts the required admin test credentials', async () => {
  const req = {
    body: {
      name: 'admin',
      email: 'admin@example.com',
      password: 'cse340!'
    }
  };

  await Promise.all(
    userRegistrationValidation.map((validator) => validator.run(req))
  );

  assert.deepEqual(validationResult(req).array(), []);
});
