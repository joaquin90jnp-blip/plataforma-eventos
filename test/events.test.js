import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import Event from "../src/models/Event.js";
import {
  clearDatabase,
  startTestDB,
  stopTestDB,
} from "./support/mongo.js";

const validEvent = {
  title: "Conferencia de backend",
  description: "Arquitectura en capas",
  date: new Date("2026-11-15T18:00:00Z"),
  capacity: 100,
  location: "Auditorio",
  status: "published",
};

let mongo;

before(async () => {
  mongo = await startTestDB();
  await Event.init();
});

after(async () => {
  await stopTestDB(mongo);
});

beforeEach(async () => {
  await clearDatabase();
});

describe("Modelo Event", () => {
  it("acepta un evento válido y aplica defaults", () => {
    const event = new Event({
      title: "Charla",
      date: new Date(),
      capacity: 10,
    });

    assert.equal(event.validateSync(), undefined);
    assert.equal(event.status, "draft");
    assert.equal(event.organizer, null);
    assert.equal(event.description, "");
  });

  it("exige título, fecha y capacidad", () => {
    const { errors } = new Event({}).validateSync();
    assert.ok(errors.title);
    assert.ok(errors.date);
    assert.ok(errors.capacity);
  });

  it("rechaza capacidad menor a 1 o no entera", () => {
    for (const capacity of [0, -5, 2.5, "diez"]) {
      const { errors } = new Event({
        title: "Charla",
        date: new Date(),
        capacity,
      }).validateSync();
      assert.ok(errors.capacity, String(capacity));
    }
  });

  it("rechaza un estado fuera del enum", () => {
    const { errors } = new Event({
      title: "Charla",
      date: new Date(),
      capacity: 10,
      status: "archivado",
    }).validateSync();
    assert.ok(errors.status);
  });

  it("rechaza títulos demasiado cortos", () => {
    const { errors } = new Event({
      title: "AB",
      date: new Date(),
      capacity: 10,
    }).validateSync();
    assert.ok(errors.title);
  });
});

describe("GET /api/events", () => {
  it("devuelve los eventos persistidos ordenados por fecha", async () => {
    await Event.create([
      { ...validEvent, title: "Segundo", date: new Date("2026-12-01") },
      { ...validEvent, title: "Primero", date: new Date("2026-11-01") },
    ]);

    const res = await request(app).get("/api/events");

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "success");
    assert.deepEqual(
      res.body.payload.map((event) => event.title),
      ["Primero", "Segundo"],
    );
    const [event] = res.body.payload;
    assert.deepEqual(Object.keys(event).sort(), [
      "capacity",
      "date",
      "description",
      "id",
      "location",
      "organizer",
      "status",
      "title",
    ]);
    assert.equal(event.id.length > 0, true);
    assert.equal(event.organizer, null);
  });

  it("devuelve lista vacía cuando no hay eventos", async () => {
    const res = await request(app).get("/api/events");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "success", payload: [] });
  });
});
