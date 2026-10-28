/**
 * Error con status HTTP y mensaje apto para el cliente.
 * El errorHandler solo expone `message` cuando `expose` es true.
 */
export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  error.isOperational = true;
  return error;
}
