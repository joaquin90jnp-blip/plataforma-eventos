import { Router } from "express";
import { listEvents } from "../controllers/events.controller.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const router = Router();
router.get("/", listEvents);
router.all("/", methodNotAllowed(["GET", "HEAD"]));
export default router;
