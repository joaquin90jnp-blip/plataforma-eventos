import * as eventsRepository from "../repositories/events.repository.js";
import { toPublicEvent } from "../models/Event.js";

export async function getEvents() {
  const events = await eventsRepository.findAll();
  return events.map(toPublicEvent);
}
