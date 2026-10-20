import * as eventsDao from "../dao/events.dao.js";

export async function findAll() {
  return eventsDao.findAll();
}
