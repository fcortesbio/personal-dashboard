import Joi from "joi";

/**
 * Middleware to validate request body against a Joi schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first
      stripUnknown: true, // Remove unknown properties
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Validation schemas for different routes
 */
export const schemas = {
  // Course validation schemas
  createCourse: Joi.object({
    name: Joi.string().required().min(1).max(255).messages({
      "string.empty": "Course name is required",
      "string.max": "Course name must not exceed 255 characters",
    }),
    current_module: Joi.string().allow("", null).max(255).optional(),
    link: Joi.string().uri().allow("", null).optional().messages({
      "string.uri": "Link must be a valid URL",
    }),
  }),

  updateCourse: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    current_module: Joi.string().allow("", null).max(255).optional(),
    link: Joi.string().uri().allow("", null).optional(),
  }).min(1), // At least one field must be provided

  // Bookmark validation schemas
  createBookmark: Joi.object({
    name: Joi.string().required().min(1).max(255).messages({
      "string.empty": "Bookmark name is required",
      "string.max": "Bookmark name must not exceed 255 characters",
    }),
    link: Joi.string().uri().allow("", null).optional().messages({
      "string.uri": "Link must be a valid URL",
    }),
  }),

  updateBookmark: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    link: Joi.string().uri().allow("", null).optional(),
  }).min(1), // At least one field must be provided
};
