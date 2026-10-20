import express from "express";
import healthRouter from "./routes/health.router.js";
import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/events", eventsRouter);
app.use("/api/sessions", sessionsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
