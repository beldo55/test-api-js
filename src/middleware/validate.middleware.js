const { ZodError } = require("zod");
const { HttpError } = require("../utils/http-error");

/**
 * Validates req.body / req.query / req.params against a Zod schema shaped as:
 *   z.object({ body: z.object({...}), query: z.object({...}), params: z.object({...}) })
 * Only the keys present in the schema are validated/replaced, so a route can
 * validate just the body, just the query, or a combination.
 */
function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(HttpError.unprocessable("Validation failed", "VALIDATION_ERROR", err.flatten()));
      }
      return next(err);
    }
  };
}

module.exports = { validate };
