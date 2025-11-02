export const schemas = {
  Course: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        description: "Unique course identifier",
        example: 1,
      },
      name: {
        type: "string",
        description: "Course name",
        example: "Amazon Junior Software Developer with GenAI",
      },
      current_module: {
        type: "string",
        nullable: true,
        description: "Name of the current module being studied",
        example: "Exploring conditional statements",
      },
      link: {
        type: "string",
        nullable: true,
        description: "URL to the course or current module",
        example: "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements",
      },
    },
  },
  Bookmark: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        description: "Unique bookmark identifier",
        example: 1,
      },
      name: {
        type: "string",
        description: "Bookmark name",
        example: "GitHub",
      },
      link: {
        type: "string",
        nullable: true,
        description: "URL to the bookmark",
        example: "https://github.com",
      },
    },
  },
  Error: {
    type: "object",
    properties: {
      error: {
        type: "string",
        example: "Course not found",
      },
    },
  },
};
