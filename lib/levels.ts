import type { ExamLevel } from "@/lib/types";

export interface LevelDefinition {
  level: ExamLevel;
  number: number;
  shortTitle: string;
  category: string;
  focus: string;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: "level-1",
    number: 1,
    shortTitle: "第一关",
    category: "通用基础",
    focus: "算术、常识、站内查找",
  },
  {
    level: "level-2",
    number: 2,
    shortTitle: "第二关",
    category: "公开信息",
    focus: "网页检索、比较、数字提取",
  },
  {
    level: "level-3",
    number: 3,
    shortTitle: "第三关",
    category: "数据运营",
    focus: "结构化文件、分页接口、规则执行",
  },
  {
    level: "level-4",
    number: 4,
    shortTitle: "第四关",
    category: "工程诊断",
    focus: "日志、配置、接口契约、发布风险",
  },
  {
    level: "level-5",
    number: 5,
    shortTitle: "第五关",
    category: "财务风控",
    focus: "收入确认、现金流、敞口、审计线索",
  },
  {
    level: "level-6",
    number: 6,
    shortTitle: "第六关",
    category: "科学研究",
    focus: "实验设计、统计判断、跨表推理",
  },
  {
    level: "level-7",
    number: 7,
    shortTitle: "第七关",
    category: "视觉图表",
    focus: "图表读取、多选筛选、结构化摘要",
  },
  {
    level: "level-8",
    number: 8,
    shortTitle: "第八关",
    category: "抽象规则",
    focus: "网格变换、序列归纳、排序推理",
  },
  {
    level: "level-9",
    number: 9,
    shortTitle: "第九关",
    category: "代码智能体",
    focus: "测试预测、补丁选择、工具轨迹",
  },
  {
    level: "level-10",
    number: 10,
    shortTitle: "第十关",
    category: "综合代理",
    focus: "多轮对话、策略执行、研究任务规划",
  },
];

export const LEVELS: ExamLevel[] = LEVEL_DEFINITIONS.map((definition) => definition.level);
export const PASS_RATIO = 0.6;

export function getLevelDefinition(level: ExamLevel) {
  return LEVEL_DEFINITIONS.find((definition) => definition.level === level) ?? null;
}

export function levelLabel(level: ExamLevel) {
  return getLevelDefinition(level)?.shortTitle ?? level;
}

export function levelCategory(level: ExamLevel) {
  return getLevelDefinition(level)?.category ?? "未分类";
}

export function levelFocus(level: ExamLevel) {
  return getLevelDefinition(level)?.focus ?? "";
}

export function levelNumber(level: ExamLevel) {
  return getLevelDefinition(level)?.number ?? Number(level.replace("level-", ""));
}

export function unlockedLevelsFromMaxLevel(maxLevel: number) {
  return LEVELS.filter((level) => levelNumber(level) <= maxLevel);
}

export function previousLevel(level: ExamLevel): ExamLevel | null {
  const index = LEVELS.indexOf(level);
  return index > 0 ? LEVELS[index - 1] ?? null : null;
}
