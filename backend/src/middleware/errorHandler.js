export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.type === "validation") {
    return res.status(400).json({
      error: "validation failed",
      fields: err.fields,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "internal server error",
  });
};