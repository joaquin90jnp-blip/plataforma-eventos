import Event from "../models/Event.js";

export async function findAll() {
  return Event.find().sort({ date: 1 }).lean();
}
