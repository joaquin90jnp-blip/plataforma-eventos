import { Router } from "express";
import { placeholder } from "../controllers/sessions.controller.js";

const router = Router();
router.get("/", placeholder);
export default router;