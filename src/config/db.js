import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    throw new Error(
      "MONGO_URL no está configurada. Copiá .env.example a .env y definí la cadena de conexión.",
    );
  }
  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
