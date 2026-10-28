import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
} from "../src/utils/validation.js";

describe("utils/validation", () => {
  it("normaliza el email con trim y minúsculas", () => {
    assert.equal(normalizeEmail("  Ana@Mail.COM "), "ana@mail.com");
  });

  it("acepta emails con formato válido", () => {
    for (const email of ["ana@mail.com", "a.b+c@sub.dominio.org"]) {
      assert.equal(isValidEmail(email), true, email);
    }
  });

  it("rechaza emails con formato inválido", () => {
    for (const email of ["ana", "ana@", "@mail.com", "ana@mail", "a b@mail.com"]) {
      assert.equal(isValidEmail(email), false, email);
    }
  });

  it("define una longitud mínima de contraseña de 8", () => {
    assert.equal(MIN_PASSWORD_LENGTH, 8);
  });
});
