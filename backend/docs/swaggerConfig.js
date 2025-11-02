import { schemas } from "./schemas.js";

/**
 * Generate Swagger configuration with dynamic port from environment
 * @param {number} port - Server port from environment
 * @returns {Object} Swagger configuration
 */
export function getSwaggerOptions(port = 3000) {
  return {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Personal Dashboard API",
        description:
          "API for managing courses, bookmarks, links, and productivity data",
        version: "1.0.0",
        contact: {
          name: "fcortesbio",
          url: "https://github.com/fcortesbio/personal-dashboard",
        },
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: `Development server (port ${port})`,
        },
      ],
      components: {
        schemas,
      },
    },
    // Paths to files with JSDoc comments
    apis: ["./routes/*.js"],
  };
}

// Default export for backward compatibility
export const swaggerOptions = getSwaggerOptions();
