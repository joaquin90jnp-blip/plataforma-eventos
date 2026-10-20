import * as eventsRepository from "../repositories/events.repository.js";

export async function getEvents() {
  return eventsRepository.findAll();
}
