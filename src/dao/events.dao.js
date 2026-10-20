const events = [];

export function findAll() {
  return events.map((event) => ({ ...event }));
}
