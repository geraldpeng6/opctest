import handler from "vinext/server/app-router-entry";

import { setD1Database, type D1Database } from "@/lib/d1-records";

type Env = Parameters<typeof handler.fetch>[1] & {
  DB: D1Database;
};

type ExecutionContext = Parameters<typeof handler.fetch>[2];

const worker = {
  async fetch(request: Request, env?: Env, ctx?: ExecutionContext) {
    setD1Database(env?.DB ?? null);
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
