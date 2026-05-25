/**
 * Unit tests for requireRole middleware
 * 
 * These tests verify the role-based access control functionality
 * without requiring a full testing framework setup.
 */

import requireRole from './requireRole.js';

// Mock request, response, and next function
const createMockReq = (user = null) => ({ user });
const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};
const createMockNext = () => {
  let called = false;
  const next = () => { called = true; };
  next.wasCalled = () => called;
  return next;
};

// Test suite
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// Test 1: Should return 401 if user is not authenticated
test('returns 401 when req.user is not set', () => {
  const middleware = requireRole('admin');
  const req = createMockReq(null);
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (res.statusCode !== 401) {
    throw new Error(`Expected status 401, got ${res.statusCode}`);
  }
  if (res.body.success !== false) {
    throw new Error('Expected success: false');
  }
  if (res.body.message !== 'Authentication required') {
    throw new Error(`Expected "Authentication required", got "${res.body.message}"`);
  }
  if (next.wasCalled()) {
    throw new Error('next() should not be called');
  }
});

// Test 2: Should return 403 if user role is not in allowed roles
test('returns 403 when user role is not allowed', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ role: 'customer', id: '123' });
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (res.statusCode !== 403) {
    throw new Error(`Expected status 403, got ${res.statusCode}`);
  }
  if (res.body.success !== false) {
    throw new Error('Expected success: false');
  }
  if (res.body.message !== 'Forbidden') {
    throw new Error(`Expected "Forbidden", got "${res.body.message}"`);
  }
  if (next.wasCalled()) {
    throw new Error('next() should not be called');
  }
});

// Test 3: Should call next() if user role matches single allowed role
test('calls next() when user role matches single allowed role', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ role: 'admin', id: '123' });
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (!next.wasCalled()) {
    throw new Error('next() should be called');
  }
  if (res.statusCode) {
    throw new Error(`Response should not be sent, got status ${res.statusCode}`);
  }
});

// Test 4: Should call next() if user role matches one of multiple allowed roles
test('calls next() when user role matches one of multiple allowed roles', () => {
  const middleware = requireRole('admin', 'customer', 'hotelstaff');
  const req = createMockReq({ role: 'customer', id: '123' });
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (!next.wasCalled()) {
    throw new Error('next() should be called');
  }
  if (res.statusCode) {
    throw new Error(`Response should not be sent, got status ${res.statusCode}`);
  }
});

// Test 5: Should work with hotelstaff role
test('calls next() when user role is hotelstaff and allowed', () => {
  const middleware = requireRole('hotelstaff');
  const req = createMockReq({ role: 'hotelstaff', id: '123' });
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (!next.wasCalled()) {
    throw new Error('next() should be called');
  }
  if (res.statusCode) {
    throw new Error(`Response should not be sent, got status ${res.statusCode}`);
  }
});

// Test 6: Should reject when role is undefined
test('returns 403 when user.role is undefined', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ id: '123' }); // user exists but no role
  const res = createMockRes();
  const next = createMockNext();

  middleware(req, res, next);

  if (res.statusCode !== 403) {
    throw new Error(`Expected status 403, got ${res.statusCode}`);
  }
  if (next.wasCalled()) {
    throw new Error('next() should not be called');
  }
});

// Run all tests
console.log('Running requireRole middleware tests...\n');
let passed = 0;
let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  ${error.message}\n`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
