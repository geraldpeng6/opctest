import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { GET as badgeMapRoute } from "@/app/api/data/level-3/badge-map/route";
import { GET as inventoryMovementsRoute } from "@/app/api/data/level-3/inventory-movements/route";
import { GET as ordersRoute } from "@/app/api/data/level-3/orders/route";
import { GET as refundsRoute } from "@/app/api/data/level-3/refunds/route";
import { GET as supportCasesRoute } from "@/app/api/data/level-3/support-cases/route";
import { GET as vendorMapRoute } from "@/app/api/data/level-3/vendor-map/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as meRoute } from "@/app/api/auth/me/route";
import { GET as leaderboardRoute } from "@/app/api/leaderboards/route";
import { GET as getLevel1Exam } from "@/app/api/exams/level-1/route";
import { GET as getLevel2Exam } from "@/app/api/exams/level-2/route";
import { GET as getLevel3Exam } from "@/app/api/exams/level-3/route";
import { GET as getLevel4Exam } from "@/app/api/exams/level-4/route";
import { GET as getLevel5Exam } from "@/app/api/exams/level-5/route";
import { GET as getLevel6Exam } from "@/app/api/exams/level-6/route";
import { GET as getLevel7Exam } from "@/app/api/exams/level-7/route";
import { GET as getLevel8Exam } from "@/app/api/exams/level-8/route";
import { GET as getLevel9Exam } from "@/app/api/exams/level-9/route";
import { GET as getLevel10Exam } from "@/app/api/exams/level-10/route";
import { POST as postSubmission } from "@/app/api/submissions/route";
import { getStoredAttempt } from "@/lib/attempts";
import { setRuntimeRootForTests } from "@/lib/runtime-paths";

function withRuntimeDir() {
  const dir = mkdtempSync(join(tmpdir(), "opctest-runtime-"));
  setRuntimeRootForTests(dir);
  return dir;
}

function cleanupRuntimeDir(dir: string) {
  setRuntimeRootForTests(null);
  rmSync(dir, { recursive: true, force: true });
}

async function login(name: string) {
  const response = await loginRoute(
    new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    }),
  );

  return {
    response,
    payload: await response.json(),
  };
}

function authHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  };
}

type ExamGetter = (request: Request) => Response | Promise<Response>;

async function submitAllCorrect(token: string, url: string, examGetter: ExamGetter) {
  const examResponse = await examGetter(
    new Request(url, {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();
  const attempt = await getStoredAttempt(examPayload.attempt_id);
  assert.ok(attempt);

  const response = await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({
        exam_id: examPayload.exam_id,
        attempt_id: examPayload.attempt_id,
        answers: Object.fromEntries(
          Object.entries(attempt!.answer_key).map(([id, expected]) => [id, expected]),
        ),
      }),
    }),
  );

  return {
    examPayload,
    response,
    payload: await response.json(),
  };
}

test("考生可以填写昵称、读取本人信息并读取第一关试卷", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("甲一");
  assert.equal(loginResult.response.status, 200);
  assert.equal(loginResult.payload.candidate.name, "甲一");
  assert.equal(loginResult.payload.candidate.max_level, 10);

  const token = loginResult.payload.session_token as string;
  const meResponse = await meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.equal(meResponse.status, 200);
  assert.deepEqual(mePayload.candidate.unlocked_levels, ["level-1"]);

  const examResponse = await getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();

  assert.equal(examResponse.status, 200);
  assert.equal(examPayload.exam_id, "level-1-20260424");
  assert.equal(typeof examPayload.attempt_id, "string");
  assert.equal(examPayload.candidate_name, "甲一");
  cleanupRuntimeDir(dir);
});

test("通过第一关前第二关保持锁定", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("乙二");
  const token = loginResult.payload.session_token as string;

  const response = await getLevel2Exam(
    new Request("http://localhost:3000/api/exams/level-2", {
      headers: authHeaders(token),
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.error, /尚未解锁/);
  cleanupRuntimeDir(dir);
});

test("通过第二关前第三关保持锁定", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("丙三");
  const token = loginResult.payload.session_token as string;

  const response = await getLevel3Exam(
    new Request("http://localhost:3000/api/exams/level-3", {
      headers: authHeaders(token),
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.error, /尚未解锁/);
  cleanupRuntimeDir(dir);
});

test("提交后记录最终结果，并在通过第一关后解锁第二关", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("丁四");
  const token = loginResult.payload.session_token as string;

  const examResponse = await getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();
  const attempt = await getStoredAttempt(examPayload.attempt_id);
  assert.ok(attempt);

  const answers = Object.fromEntries(
    Object.entries(attempt!.answer_key).map(([id, expected]) => [id, expected]),
  );

  const submitResponse = await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({
        exam_id: examPayload.exam_id,
        attempt_id: examPayload.attempt_id,
        answers,
      }),
    }),
  );
  const submitPayload = await submitResponse.json();

  assert.equal(submitResponse.status, 200);
  assert.equal(submitPayload.score, 10);

  const meResponse = await meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.deepEqual(mePayload.candidate.unlocked_levels, ["level-1", "level-2"]);

  const records = readFileSync(join(dir, "records", "submissions.jsonl"), "utf8")
    .trim()
    .split("\n");
  assert.equal(records.length, 1);
  cleanupRuntimeDir(dir);
});

test("同一考生不能重复提交同一关", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("戊五");
  const token = loginResult.payload.session_token as string;

  const examResponse = await getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();

  const payload = {
    exam_id: examPayload.exam_id,
    attempt_id: examPayload.attempt_id,
    answers: {},
  };

  const first = await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    }),
  );

  const second = await getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const secondPayload = await second.json();

  assert.equal(first.status, 200);
  assert.equal(second.status, 409);
  assert.match(secondPayload.error, /已经定稿/);
  cleanupRuntimeDir(dir);
});

test("重复昵称会恢复同一位考生", async () => {
  const dir = withRuntimeDir();

  const firstLogin = await login("己六");
  assert.equal(firstLogin.response.status, 200);

  const secondLogin = await login("己六");
  assert.equal(secondLogin.response.status, 200);
  assert.equal(secondLogin.payload.candidate.candidate_id, firstLogin.payload.candidate.candidate_id);
  cleanupRuntimeDir(dir);
});

test("排行榜公开昵称但不泄露会话令牌", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("庚七");
  const token = loginResult.payload.session_token as string;
  const examResponse = await getLevel1Exam(
    new Request("http://localhost:3000/api/exams/level-1", {
      headers: authHeaders(token),
    }),
  );
  const examPayload = await examResponse.json();
  const attempt = await getStoredAttempt(examPayload.attempt_id);

  await postSubmission(
    new Request("http://localhost:3000/api/submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({
        exam_id: examPayload.exam_id,
        attempt_id: examPayload.attempt_id,
        answers: Object.fromEntries(
          Object.entries(attempt!.answer_key).map(([id, expected]) => [id, expected]),
        ),
      }),
    }),
  );

  const leaderboardResponse = await leaderboardRoute();
  const leaderboardPayload = await leaderboardResponse.json();

  assert.equal(leaderboardResponse.status, 200);
  assert.equal(leaderboardPayload.overall_top3[0].name, "庚七");
  assert.equal(JSON.stringify(leaderboardPayload).includes(token), false);
  cleanupRuntimeDir(dir);
});

test("基础关卡按顺序解锁，并保持第三关限时配置", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("辛八");
  const token = loginResult.payload.session_token as string;

  const level1 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-1", getLevel1Exam);
  assert.equal(level1.response.status, 200);

  const level2 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-2", getLevel2Exam);
  assert.equal(level2.response.status, 200);

  const meResponse = await meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.deepEqual(mePayload.candidate.unlocked_levels, ["level-1", "level-2", "level-3"]);

  const level3Response = await getLevel3Exam(
    new Request("http://localhost:3000/api/exams/level-3", {
      headers: authHeaders(token),
    }),
  );
  const level3Payload = await level3Response.json();

  assert.equal(level3Response.status, 200);
  assert.equal(level3Payload.exam_id, "level-3-20260425");
  assert.equal(level3Payload.questions.length, 10);
  assert.equal(level3Payload.time_limit_sec, 2700);
  cleanupRuntimeDir(dir);
});

test("新增专业关卡按顺序解锁，并能创建对应试卷", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("癸十");
  const token = loginResult.payload.session_token as string;

  const lockedLevel4 = await getLevel4Exam(
    new Request("http://localhost:3000/api/exams/level-4", {
      headers: authHeaders(token),
    }),
  );
  const lockedLevel4Payload = await lockedLevel4.json();
  assert.equal(lockedLevel4.status, 401);
  assert.match(lockedLevel4Payload.error, /尚未解锁/);

  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-1", getLevel1Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-2", getLevel2Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-3", getLevel3Exam);

  const level4 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-4", getLevel4Exam);
  assert.equal(level4.response.status, 200);
  assert.equal(level4.examPayload.exam_id, "level-4-20260707");
  assert.equal(level4.examPayload.questions.length, 10);
  assert.equal(level4.examPayload.time_limit_sec, 3600);

  const level5 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-5", getLevel5Exam);
  assert.equal(level5.response.status, 200);
  assert.equal(level5.examPayload.exam_id, "level-5-20260707");
  assert.equal(level5.examPayload.questions.length, 10);
  assert.equal(level5.examPayload.time_limit_sec, 3600);

  const level6Response = await getLevel6Exam(
    new Request("http://localhost:3000/api/exams/level-6", {
      headers: authHeaders(token),
    }),
  );
  const level6Payload = await level6Response.json();
  assert.equal(level6Response.status, 200);
  assert.equal(level6Payload.exam_id, "level-6-20260707");
  assert.equal(level6Payload.questions.length, 10);
  assert.equal(level6Payload.time_limit_sec, 4500);

  const meResponse = await meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.deepEqual(mePayload.candidate.unlocked_levels, [
    "level-1",
    "level-2",
    "level-3",
    "level-4",
    "level-5",
    "level-6",
  ]);

  cleanupRuntimeDir(dir);
});

test("新增题型关卡按顺序解锁，并覆盖多选、排序、JSON 和补丁题", async () => {
  const dir = withRuntimeDir();

  const loginResult = await login("子一");
  const token = loginResult.payload.session_token as string;

  const lockedLevel7 = await getLevel7Exam(
    new Request("http://localhost:3000/api/exams/level-7", {
      headers: authHeaders(token),
    }),
  );
  const lockedLevel7Payload = await lockedLevel7.json();
  assert.equal(lockedLevel7.status, 401);
  assert.match(lockedLevel7Payload.error, /尚未解锁/);

  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-1", getLevel1Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-2", getLevel2Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-3", getLevel3Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-4", getLevel4Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-5", getLevel5Exam);
  await submitAllCorrect(token, "http://localhost:3000/api/exams/level-6", getLevel6Exam);

  const level7 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-7", getLevel7Exam);
  assert.equal(level7.response.status, 200);
  assert.equal(level7.examPayload.exam_id, "level-7-20260707");
  assert.equal(level7.examPayload.questions.length, 10);
  assert.equal(level7.examPayload.questions.some((question: { type: string }) => question.type === "multiple_choice"), true);
  assert.equal(level7.examPayload.questions.some((question: { type: string }) => question.type === "json_object"), true);

  const level8 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-8", getLevel8Exam);
  assert.equal(level8.response.status, 200);
  assert.equal(level8.examPayload.exam_id, "level-8-20260707");
  assert.equal(level8.examPayload.questions.some((question: { type: string }) => question.type === "ordered_list"), true);

  const level9 = await submitAllCorrect(token, "http://localhost:3000/api/exams/level-9", getLevel9Exam);
  assert.equal(level9.response.status, 200);
  assert.equal(level9.examPayload.exam_id, "level-9-20260707");
  assert.equal(level9.examPayload.questions.some((question: { type: string }) => question.type === "code_patch"), true);

  const level10Response = await getLevel10Exam(
    new Request("http://localhost:3000/api/exams/level-10", {
      headers: authHeaders(token),
    }),
  );
  const level10Payload = await level10Response.json();
  assert.equal(level10Response.status, 200);
  assert.equal(level10Payload.exam_id, "level-10-20260707");
  assert.equal(level10Payload.time_limit_sec, 9000);

  const meResponse = await meRoute(
    new Request("http://localhost:3000/api/auth/me", {
      headers: authHeaders(token),
    }),
  );
  const mePayload = await meResponse.json();
  assert.deepEqual(mePayload.candidate.unlocked_levels, [
    "level-1",
    "level-2",
    "level-3",
    "level-4",
    "level-5",
    "level-6",
    "level-7",
    "level-8",
    "level-9",
    "level-10",
  ]);

  cleanupRuntimeDir(dir);
});

test("第三关资源和数据路由可用", async () => {
  const ordersResponse = await ordersRoute(
    new Request("http://localhost:3000/api/data/level-3/orders?page=1"),
  );
  const ordersPayload = await ordersResponse.json();
  assert.equal(ordersResponse.status, 200);
  assert.equal(ordersPayload.next_page, 2);

  const refundsResponse = await refundsRoute(
    new Request("http://localhost:3000/api/data/level-3/refunds?page=1"),
  );
  const refundsPayload = await refundsResponse.json();
  assert.equal(refundsResponse.status, 200);
  assert.equal(refundsPayload.items.length > 0, true);

  const vendorMapResponse = vendorMapRoute();
  const vendorMapPayload = await vendorMapResponse.json();
  assert.equal(vendorMapResponse.status, 200);
  assert.equal(vendorMapPayload.vendors.some((row: { vendor_code: string }) => row.vendor_code === "VN-204"), true);

  const supportCasesResponse = supportCasesRoute();
  const supportCasesPayload = await supportCasesResponse.json();
  assert.equal(supportCasesResponse.status, 200);
  assert.equal(supportCasesPayload.cases.some((row: { case_id: string }) => row.case_id === "CASE-118"), true);

  const badgeMapResponse = badgeMapRoute();
  const badgeMapPayload = await badgeMapResponse.json();
  assert.equal(badgeMapResponse.status, 200);
  assert.equal(badgeMapPayload.badges.some((row: { badge_id: string }) => row.badge_id === "M-104"), true);

  const movementsResponse = await inventoryMovementsRoute(
    new Request("http://localhost:3000/api/data/level-3/inventory-movements?cursor=start"),
  );
  const movementsPayload = await movementsResponse.json();
  assert.equal(movementsResponse.status, 200);
  assert.equal(movementsPayload.next_cursor, "c1");

  assert.equal(existsSync(join(process.cwd(), "public", "files", "level-3", "warehouse-audit.pdf")), true);
  assert.equal(existsSync(join(process.cwd(), "public", "files", "level-3", "purchase-ledger.zip")), true);
  assert.equal(existsSync(join(process.cwd(), "public", "files", "level-3", "catalog.xml")), true);
  assert.equal(existsSync(join(process.cwd(), "public", "files", "level-3", "dispatch-window.ics")), true);
});
