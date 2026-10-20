import { Router } from "express";
import { placeholder } from "../controllers/sessions.controller.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const router = Router();
router.get("/", placeholder);
router.all("/", methodNotAllowed(["GET", "HEAD"]));
export default router;
