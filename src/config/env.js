import "dotenv/config";

export function parsePort(value) {
  if (value === undefined || value === "") return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `PORT inválido: "${value}". Debe ser un entero entre 1 y 65535.`,
    );
  }
  return port;
}

export const env = {
  PORT: parsePort(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  MONGO_URL: process.env.MONGO_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
};
