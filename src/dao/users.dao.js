import User from "../models/User.js";

export async function findByEmail(email) {
  return User.findOne({ email }).lean();
}

export async function create(userData) {
  const user = await User.create(userData);
  return user.toObject();
}
