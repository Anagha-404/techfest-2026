// API tests with Jest + Supertest.
// None of these reach MongoDB: they check routing, security headers,
// validation and authentication, which all run before any database call.
const request = require("supertest");
const app = require("../app");

describe("Basic routes", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("unknown route returns 404", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });
});

describe("Security headers (Helmet)", () => {
  test("sets common security headers", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("Input validation", () => {
  test("register rejects an invalid email and weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);

    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toContain("email");
    expect(fields).toContain("password");
  });

  test("feedback rejects an empty message", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ message: "   " });

    expect(res.status).toBe(400);
  });

  test("malformed JSON returns 400, not a crash", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ bad json");

    expect(res.status).toBe(400);
  });
});

describe("NoSQL injection", () => {
  test("login with { $ne: null } operators is rejected", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $ne: null }, password: { $ne: null } });

    expect(res.status).toBe(400);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("Protected routes", () => {
  test("creating an event without login returns 401", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ name: "Hack", category: "Technical", fee: 0, seats: 10, date: "2026-12-01" });

    expect(res.status).toBe(401);
  });

  test("viewing my registrations without login returns 401", async () => {
    const res = await request(app).get("/api/registrations/mine");

    expect(res.status).toBe(401);
  });

  test("a forged token is rejected", async () => {
    const res = await request(app)
      .get("/api/registrations/mine")
      .set("Cookie", "token=forged.token.value");

    expect(res.status).toBe(401);
  });
});
