import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import { verifyPassword } from "../src/utils/hash.js";

const validBody = {
  first_name: "Ana",
  last_name: "Pérez",
  email: "Ana@Mail.com ",
  password: "Secreta123",
};

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "eventos-test" });
  await User.init();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/sessions/register", () => {
  it("registra un usuario y normaliza el email", async () => {
    const res = await request(app).post("/api/sessions/register").send(validBody);

    assert.equal(res.status, 201);
    assert.equal(res.body.status, "success");
    assert.deepEqual(
      {
        first_name: res.body.payload.first_name,
        last_name: res.body.payload.last_name,
        email: res.body.payload.email,
        role: res.body.payload.role,
      },
      {
        first_name: "Ana",
        last_name: "Pérez",
        email: "ana@mail.com",
        role: "user",
      },
    );
    assert.ok(res.body.payload.id);
  });

  it("no devuelve la contraseña en la respuesta", async () => {
    const res = await request(app).post("/api/sessions/register").send(validBody);

    assert.equal(res.status, 201);
    assert.equal("password" in res.body.payload, false);
    assert.equal(JSON.stringify(res.body).includes("Secreta123"), false);
    assert.equal(JSON.stringify(res.body).includes("$2"), false);
  });

  it("guarda la contraseña hasheada y no en texto plano", async () => {
    await request(app).post("/api/sessions/register").send(validBody);

    const stored = await User.collection.findOne({ email: "ana@mail.com" });
    assert.ok(stored);
    assert.notEqual(stored.password, "Secreta123");
    assert.match(stored.password, /^\$2[aby]\$/);
    assert.equal(await verifyPassword("Secreta123", stored.password), true);
  });

  it("ignora el rol enviado en el body y asigna user", async () => {
    const res = await request(app)
      .post("/api/sessions/register")
      .send({ ...validBody, role: "admin" });

    assert.equal(res.status, 201);
    assert.equal(res.body.payload.role, "user");

    const stored = await User.collection.findOne({ email: "ana@mail.com" });
    assert.equal(stored.role, "user");
  });

  it("responde 400 si faltan campos obligatorios", async () => {
    const res = await request(app)
      .post("/api/sessions/register")
      .send({ first_name: "Ana", last_name: "Pérez", email: "ana@mail.com" });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      status: "error",
      message: "Faltan campos obligatorios",
    });
  });

  it("responde 400 con email inválido", async () => {
    const res = await request(app)
      .post("/api/sessions/register")
      .send({ ...validBody, email: "ana@mail" });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      status: "error",
      message: "Email inválido",
    });
  });

  it("responde 400 con contraseña demasiado corta", async () => {
    const res = await request(app)
      .post("/api/sessions/register")
      .send({ ...validBody, password: "corta" });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      status: "error",
      message: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("responde 409 si el email ya está registrado", async () => {
    await request(app).post("/api/sessions/register").send(validBody);

    const res = await request(app)
      .post("/api/sessions/register")
      .send({ ...validBody, email: "  ANA@mail.com " });

    assert.equal(res.status, 409);
    assert.deepEqual(res.body, {
      status: "error",
      message: "El email ya está registrado",
    });
  });

  it("responde 405 con Allow en métodos no permitidos", async () => {
    const res = await request(app).get("/api/sessions/register");

    assert.equal(res.status, 405);
    assert.equal(res.headers.allow, "POST, HEAD");
  });
});
