import { schemas } from "./schemas.js";

export const swaggerOptions = {
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
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas,
    },
  },
  // Paths to files with JSDoc comments
  apis: ["./routes/*.js"],
};
