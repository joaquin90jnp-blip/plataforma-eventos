import { env } from "./config/env.js";
import app from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(`Servidor activo en http://localhost:${env.PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${env.PORT} ya está en uso.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

function shutdown(signal) {
  console.log(`${signal} recibido, cerrando servidor...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
