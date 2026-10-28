import { registerUser } from "../services/sessions.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function placeholder(req, res) {
  res.status(200).json({ status: "success", payload: [] });
}

export const register = asyncHandler(async (req, res) => {
  const payload = await registerUser(req.body);
  res.status(201).json({ status: "success", payload });
});
