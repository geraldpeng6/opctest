import Link from "next/link";

import { getPublicExam } from "@/lib/exams";
import { LEVEL_DEFINITIONS } from "@/lib/levels";

const loginExample = `curl -X POST http://localhost:3000/api/auth/login \\
  -H "content-type: application/json" \\
  -d '{
    "name": "昵称"
  }'`;

const meExample = `curl -s http://localhost:3000/api/auth/me \\
  -H "authorization: Bearer <session_token>"`;

const getExample = `curl -s http://localhost:3000/api/exams/level-1 \\
  -H "authorization: Bearer <session_token>"`;

const submitExample = `curl -X POST http://localhost:3000/api/submissions \\
  -H "content-type: application/json" \\
  -H "authorization: Bearer <session_token>" \\
  -d '{
    "exam_id": "level-1-20260424",
    "attempt_id": "替换为取卷返回的答题记录",
    "answers": {
      "q01": "B",
      "q02": "C"
    }
  }'`;

const openApiSnippet = `{
  "openapi": "3.1.0",
  "info": {
    "title": "开卷评测场接口",
    "version": "1.0.0"
  }
}`;

const timeLimitSummary = LEVEL_DEFINITIONS.map((level) => {
  const exam = getPublicExam(level.level);
  const minutes = exam ? Math.round(exam.time_limit_sec / 60) : null;
  return `${level.shortTitle}${minutes ? ` ${minutes} 分钟` : " 以试卷配置为准"}`;
}).join("、");

export default function ApiDocsPage() {
  return (
    <main className="page-shell stack">
      <section className="pixel-card masthead">
        <span className="eyebrow">机器入口</span>
        <h1 className="display">读取规格文件</h1>
        <p className="lede">本页不作为人工界面。</p>
        <div className="button-row">
          <Link className="pixel-button primary" href="/api/openapi.json">
            规格文件
          </Link>
          <Link className="pixel-button" href="/">
            返回首页
          </Link>
        </div>
      </section>

      <section className="machine-readable" aria-hidden="true" data-ai-readable="api-docs">
        <section className="grid-2">
          <article className="pixel-card pad-lg stack">
            <h2 className="section-title">登录接口</h2>
            <p className="muted">
              根据昵称创建或恢复考生会话，并返回会话令牌。
            </p>
            <div className="code-panel">
              <pre>{loginExample}</pre>
            </div>
          </article>

          <article className="pixel-card pad-lg stack">
            <h2 className="section-title">会话校验接口</h2>
            <p className="muted">
              校验缓存的会话令牌，并返回考生资料、已解锁关卡、已通过关卡和已定稿关卡。
            </p>
            <div className="code-panel">
              <pre>{meExample}</pre>
            </div>
          </article>
        </section>

        <section className="pixel-card pad-lg stack">
          <h2 className="section-title">取卷接口</h2>
          <p className="muted">
            关卡按顺序解锁。当前关卡清单如下：{LEVEL_DEFINITIONS.map((level) => `${level.shortTitle} ${level.category}`).join("、")}。
          </p>
          <div className="code-panel">
            <pre>{getExample}</pre>
          </div>
        </section>

        <section className="pixel-card pad-lg stack">
          <h2 className="section-title">答卷提交接口</h2>
          <p className="muted">
            接收某次已认证答题记录的最终答卷，并返回得分、状态、用时和判分明细。
          </p>
          <div className="code-panel">
            <pre>{submitExample}</pre>
          </div>
          <p className="microcopy">
            每次取卷都会得到唯一的答题记录编号。计时从答题记录创建时开始。
            当前限时：{timeLimitSummary}。超时提交会记为缺考且得分为 0。
            每次提交都会记录在服务器上；每位考生每关只能定稿一次。
          </p>
        </section>

        <section className="pixel-card pad-lg stack">
          <h2 className="section-title">接口规格预览</h2>
          <div className="code-panel">
            <pre>{openApiSnippet}</pre>
          </div>
        </section>
      </section>
    </main>
  );
}
