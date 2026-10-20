export function placeholder(req, res) {
  res.status(200).json({ status: "success", payload: [] });
}