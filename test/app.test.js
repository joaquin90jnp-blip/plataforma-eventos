import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("API", () => {
  it("GET /api/health responde 200", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok", message: "Servidor activo" });
  });

  it("GET /api/events responde lista vacía", async () => {
    const res = await request(app).get("/api/events");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "success", payload: [] });
  });

  it("una ruta inexistente responde 404 en JSON", async () => {
    const res = await request(app).get("/api/no-existe");
    assert.equal(res.status, 404);
    assert.equal(res.body.status, "error");
    assert.ok(res.body.message);
  });

  it("un JSON inválido responde 400 en JSON", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Content-Type", "application/json")
      .send('{"roto"');
    assert.equal(res.status, 400);
    assert.equal(res.body.status, "error");
  });
});
