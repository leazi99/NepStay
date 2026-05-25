/**
 * Integration test for requireRole middleware with userAuth
 * 
 * This test demonstrates that requireRole works correctly when used
 * after userAuth middleware in a route chain.
 */

import requireRole from './requireRole.js';

// Simulate userAuth middleware setting req.user
const mockUserAuth = (role) => (req, res, next) => {
  req.user = {
    id: '507f1f77bcf86cd799439011',
    _id: '507f1f77bcf86cd799439011',
    role: role,
    email: 'test@example.com'
  };
  next();
};

// Mock request, response, and next function
const createMockReq = () => ({ headers: {}, cookies: {} });
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

// Simulate Express middleware chain
const runMiddlewareChain = (middlewares, req, res) => {
  let index = 0;
  const next = () => {
    if (index < middlewares.length) {
      const middleware = middlewares[index++];
      middleware(req, res, next);
    }
  };
  next();
  return { statusCode: res.statusCode, body: res.body };
};

// Test suite
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// Test 1: Admin accessing admin-only route
test('allows admin to access admin-only route', () => {
  const req = createMockReq();
  const res = createMockRes();
  
  const result = runMiddlewareChain([
    mockUserAuth('admin'),
    requireRole('admin')
  ], req, res);

  if (result.statusCode) {
    throw new Error(`Expected no response, got status ${result.statusCode}`);
  }
});

// Test 2: Customer blocked from admin-only route
test('blocks customer from admin-only route with 403', () => {
  const req = createMockReq();
  const res = createMockRes();
  
  const result = runMiddlewareChain([
    mockUserAuth('customer'),
    requireRole('admin')
  ], req, res);

  if (result.statusCode !== 403) {
    throw new Error(`Expected status 403, got ${result.statusCode}`);
  }
  if (result.body.message !== 'Forbidden') {
    throw new Error(`Expected "Forbidden", got "${result.body.message}"`);
  }
});

// Test 3: Customer accessing customer-only route
test('allows customer to access customer-only route', () => {
  const req = createMockReq();
  const res = createMockRes();
  
  const result = runMiddlewareChain([
    mockUserAuth('customer'),
    requireRole('customer')
  ], req, res);

  if (result.statusCode) {
    throw new Error(`Expected no response, got status ${result.statusCode}`);
  }
});

// Test 4: Multiple roles allowed
test('allows any of multiple roles to access route', () => {
  const req = createMockReq();
  const res = createMockRes();
  
  const result = runMiddlewareChain([
    mockUserAuth('hotelstaff'),
    requireRole('admin', 'hotelstaff', 'customer')
  ], req, res);

  if (result.statusCode) {
    throw new Error(`Expected no response, got status ${result.statusCode}`);
  }
});

// Test 5: Hotelstaff blocked from admin-only route
test('blocks hotelstaff from admin-only route', () => {
  const req = createMockReq();
  const res = createMockRes();
  
  const result = runMiddlewareChain([
    mockUserAuth('hotelstaff'),
    requireRole('admin')
  ], req, res);

  if (result.statusCode !== 403) {
    throw new Error(`Expected status 403, got ${result.statusCode}`);
  }
});

// Run all tests
console.log('Running requireRole integration tests...\n');
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
