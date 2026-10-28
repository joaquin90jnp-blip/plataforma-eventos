import { Router } from "express";
import {
  placeholder,
  register,
} from "../controllers/sessions.controller.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const router = Router();
router.get("/", placeholder);
router.all("/", methodNotAllowed(["GET", "HEAD"]));
router.post("/register", register);
router.all("/register", methodNotAllowed(["POST", "HEAD"]));
export default router;
