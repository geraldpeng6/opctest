export function getOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "OPC Test API",
      version: "1.0.0",
      description:
        "Token-based exam API for activating a candidate code, retrieving unlocked papers, and submitting final answers.",
    },
    paths: {
      "/api/auth/login": {
        post: {
          summary: "Activate a code and receive a session token.",
        },
      },
      "/api/auth/me": {
        get: {
          summary: "Inspect the authenticated candidate profile.",
        },
      },
      "/api/leaderboards": {
        get: {
          summary: "Read the public overall and per-level leaderboards.",
        },
      },
      "/api/exams/level-1": {
        get: {
          summary: "Fetch the authenticated candidate's Level 1 exam.",
          responses: {
            "200": {
              description: "Authenticated exam payload without answer key, with attempt metadata.",
            },
          },
        },
      },
      "/api/exams/level-2": {
        get: {
          summary: "Fetch the authenticated candidate's Level 2 exam.",
          responses: {
            "200": {
              description: "Authenticated exam payload without answer key, with attempt metadata.",
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
                  required: ["exam_id", "attempt_id", "answers"],
                  properties: {
                    exam_id: {
                      type: "string",
                    },
                    attempt_id: {
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
