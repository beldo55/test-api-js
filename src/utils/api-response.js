/**
 * Sends a response in the project's standard success envelope:
 * { success: true, message, data, meta? }
 */
function sendSuccess(res, options = {}) {
  const { message = "Success", data = null, meta, statusCode = 200 } = options;

  const body = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
