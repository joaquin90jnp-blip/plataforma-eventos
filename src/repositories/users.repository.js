import * as usersDao from "../dao/users.dao.js";

export async function findByEmail(email) {
  return usersDao.findByEmail(email);
}

export async function createUser(userData) {
  return usersDao.create(userData);
}
