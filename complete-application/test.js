const client = require('@fusionauth/typescript-client');
const jwt = require('jsonwebtoken');
const test = require('tape');
const fetchMock = require('fetch-mock');
const { v4: uuidv4 } = require('uuid');

const applicationId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const fusionUrl = 'http://localhost:9011';
const userPassword = 'password';

// createRandomUser(uuidv4());

test('test login returns JWT with "Goodbye World"', async function (t) {
  t.plan(1);
  const userId = uuidv4();
  const email = await createRandomUser(userId);
  try {
    const result = await login(email);
    t.ok(result.toLowerCase().includes('goodbye world'));
    t.end();
  }
  finally {
    await deleteUser(userId);
  }
});

test('test lambda rejects sanctioned emails and accepts others', async function (t) {
  t.plan(2);

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.kp', { isBanned: true });
  const jwt1 = {};
  await populate(jwt1, {email: 'kim@company.kp'}, {});
  t.true(jwt1.isBanned, 'Check North Korea email banned');

  fetchMock.get('https://issanctioned.example.com/api/banned?email=kim%40company.ca', { isBanned: false });
  const jwt2 = {};
  await populate(jwt2, {email: 'kim@company.ca'}, {});
  t.false(jwt2.isBanned, 'Check Canada email allowed');

  fetchMock.restore();
  t.end();
});

test('test lambda rejects returns permissions based on role', async function (t) {
  t.plan(3);

  const jwt1 = {};
  await populate2(jwt1, {registrations: [{roles: ['admin', 'viewer']}]}, {});
  t.true(jwt1.permissions.includes('all'), 'Check admin and viewer has all permissions');

  const jwt2 = {};
  await populate2(jwt2, {registrations: [{roles: ['editor']}]}, {});
  t.true(jwt2.permissions.includes('write'), 'Check editor has write permission');
  t.true(jwt2.permissions.includes('read'), 'Check editor has read permission');

  t.end();
});

async function populate(jwt, user, registration) {
  const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jwt.isBanned = jsonResponse.isBanned;
  }
  else
    jwt.isBanned = false;
}

async function populate2(jwt, user, registration) {
  jwt.permissions = [];
  if (user.registrations[0].roles.includes('admin'))
    jwt.permissions.push('all');
  else if (user.registrations[0].roles.includes('editor')) {
    jwt.permissions.push('read');
    jwt.permissions.push('write');
  }
  else if (user.registrations[0].roles.includes('viewer'))
    jwt.permissions.push('read');
}

async function populate(jwt, user, registration) {
  const response = await fetch("https://issanctioned.example.com/api/banned?email=" + encodeURIComponent(user.email), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (response.status === 200) {
    const jsonResponse = await response.json();
    jwt.isBanned = jsonResponse.isBanned;
  }
  else
    jwt.isBanned = false;
}

async function login(userEmail) {
  try {
    const request  = {
      applicationId: applicationId,
      loginId: userEmail,
      password: userPassword,
    };
    const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
    const clientResponse = await fusion.login(request);
    if (!clientResponse.wasSuccessful)
      throw Error(clientResponse);
    const jwtToken = clientResponse.response.token;
    const decodedToken = jwt.decode(jwtToken);
    const message = decodedToken.message;
    return message;
  }
  catch (e) {
    console.error('Error: ');
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

async function createRandomUser(userUUID) {
  try {
    const randomEmail = new Date().getTime() + "@example.com";
    const username = 'lambdatestuser' + new Date().getTime();
    const request = {
      registration: {
        applicationId: applicationId,
        username: username,
      },
      sendSetPasswordEmail: false,
      skipRegistrationVerification: true,
      skipVerification: true,
      user: {
        active: true,
        email: randomEmail,
        password: userPassword,
        username: username,
        registrations: [{
          applicationId: applicationId
        }]
      }
    };
    const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
    const clientResponse = await fusion.register(userUUID, request);
    if (!clientResponse.wasSuccessful)
      throw Error(clientResponse);
    console.info('User created successfully');
    return randomEmail;
  }
  catch (e) {
    console.error('Error creating user: ');
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

async function deleteUser(userUUID) {
  try {
    const fusion = new client.FusionAuthClient('lambda_testing_key', fusionUrl);
    const clientResponse = await fusion.deleteUser(userUUID);
    if (!clientResponse.wasSuccessful)
      throw Error(clientResponse);
    console.info(`User ${userUUID} deleted successfully`);
  }
  catch (e) {
    console.error(`Error deleting user ${userUUID}: `);
    console.dir(e, { depth: null });
    process.exit(1);
  }
}
