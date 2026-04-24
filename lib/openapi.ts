export function getOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "OPC Test API",
      version: "1.0.0",
      description: "Minimal exam API for retrieving a paper and submitting answers.",
    },
    paths: {
      "/api/exams/level-1": {
        get: {
          summary: "Fetch the public Level 1 exam.",
          responses: {
            "200": {
              description: "Public exam payload without answer key.",
            },
          },
        },
      },
      "/api/exams/level-2": {
        get: {
          summary: "Fetch the public Level 2 exam.",
          responses: {
            "200": {
              description: "Public exam payload without answer key.",
            },
          },
        },
      },
      "/api/submissions": {
        post: {
          summary: "Submit answers for grading.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["exam_id", "answers"],
                  properties: {
                    exam_id: {
                      type: "string",
                    },
                    answers: {
                      type: "object",
                      additionalProperties: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Submission graded successfully.",
            },
            "400": {
              description: "Bad request.",
            },
          },
        },
      },
    },
  };
}
