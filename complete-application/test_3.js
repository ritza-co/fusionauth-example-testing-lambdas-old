const test = require("tape");
const fetchMock = require("fetch-mock");
const { v4: uuidv4 } = require("uuid");

const applicationId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
const fusionUrl = "http://localhost:9011";
const userPassword = "password";

test("test lambda rejects returns permissions based on role", async function (t) {
  t.plan(3);

  const jwt1 = {};
  await populate(jwt1, { registrations: [{ roles: ["admin", "viewer"] }] }, {});
  t.true(
    jwt1.permissions.includes("all"),
    "Check admin and viewer has all permissions"
  );

  const jwt2 = {};
  await populate(jwt2, { registrations: [{ roles: ["editor"] }] }, {});
  t.true(
    jwt2.permissions.includes("write"),
    "Check editor has write permission"
  );
  t.true(jwt2.permissions.includes("read"), "Check editor has read permission");

  t.end();
});

async function populate(jwt, user, registration) {
  jwt.permissions = [];
  if (user.registrations[0].roles.includes("admin"))
    jwt.permissions.push("all");
  else if (user.registrations[0].roles.includes("editor")) {
    jwt.permissions.push("read");
    jwt.permissions.push("write");
  } else if (user.registrations[0].roles.includes("viewer"))
    jwt.permissions.push("read");
}
