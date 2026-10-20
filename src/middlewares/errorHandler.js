import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", message: "JSON inválido" });
  }

  const status = err.status ?? 500;
  if (status >= 500 && env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(status).json({
    status: "error",
    message: status >= 500 ? "Error interno del servidor" : err.message,
  });
}
