import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { connectDB } from "../src/config/db.js";

describe("connectDB", () => {
  it("rechaza una MONGO_URL vacía con un mensaje claro", async () => {
    await assert.rejects(() => connectDB(""), /MONGO_URL no está configurada/);
  });
});
