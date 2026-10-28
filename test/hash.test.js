import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/utils/hash.js";

describe("utils/hash", () => {
  it("genera un hash distinto de la contraseña original", async () => {
    const hash = await hashPassword("Secreta123");
    assert.notEqual(hash, "Secreta123");
    assert.match(hash, /^\$2[aby]\$/);
  });

  it("verifica una contraseña correcta", async () => {
    const hash = await hashPassword("Secreta123");
    assert.equal(await verifyPassword("Secreta123", hash), true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("Secreta123");
    assert.equal(await verifyPassword("OtraClave", hash), false);
  });

  it("genera hashes distintos para la misma contraseña (sal aleatoria)", async () => {
    const [a, b] = await Promise.all([
      hashPassword("Secreta123"),
      hashPassword("Secreta123"),
    ]);
    assert.notEqual(a, b);
  });
});
