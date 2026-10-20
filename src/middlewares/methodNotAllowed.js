export function methodNotAllowed(allowedMethods) {
  const allow = allowedMethods.join(", ");

  return (req, res) => {
    res.set("Allow", allow);

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    res.status(405).json({
      status: "error",
      message: `Método ${req.method} no permitido en ${req.baseUrl || req.path}`,
    });
  };
}
