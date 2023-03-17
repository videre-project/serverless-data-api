export default (req, res) => {
  return res
    .status(404)
    .json({
      status: "error",
      message: 'No valid endpoint was found at this location.',
      data: null,
    });
};