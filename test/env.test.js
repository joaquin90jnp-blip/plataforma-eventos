import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parsePort } from "../src/config/env.js";

describe("parsePort", () => {
  it("usa 3000 cuando no hay valor", () => {
    assert.equal(parsePort(undefined), 3000);
  });

  it("convierte un puerto válido", () => {
    assert.equal(parsePort("8080"), 8080);
  });

  it("rechaza un puerto no numérico", () => {
    assert.throws(() => parsePort("abc"), /PORT inválido/);
  });

  it("rechaza un puerto fuera de rango", () => {
    assert.throws(() => parsePort("70000"), /PORT inválido/);
  });
});
