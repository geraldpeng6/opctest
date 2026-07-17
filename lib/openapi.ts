import { LEVEL_DEFINITIONS } from "@/lib/levels";

export function getOpenApiDocument() {
  const examPaths = Object.fromEntries(
    LEVEL_DEFINITIONS.map((definition) => [
      `/api/exams/${definition.level}`,
      {
        get: {
          summary: `读取已认证考生的${definition.shortTitle}试卷。`,
          description: definition.category,
          responses: {
            "200": {
              description: "不含答案的已认证试卷载荷，附带答题记录元数据。",
            },
          },
        },
      },
    ]),
  );

  return {
    openapi: "3.1.0",
    info: {
      title: "开卷评测场接口",
      version: "1.0.0",
      description:
        "基于令牌的评测接口，用于创建或恢复考生会话、读取已解锁试卷并提交最终答案。",
    },
    paths: {
      "/api/auth/login": {
        post: {
          summary: "提交昵称并接收会话令牌。",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          summary: "查看已认证考生资料。",
        },
      },
      "/api/leaderboards": {
        get: {
          summary: "读取公开总榜和分关排行榜。",
        },
      },
      ...examPaths,
      "/api/submissions": {
        post: {
          summary: "提交答案并判分。",
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
              description: "答卷已成功判分。",
            },
            "400": {
              description: "请求格式错误。",
            },
          },
        },
      },
    },
  };
}
