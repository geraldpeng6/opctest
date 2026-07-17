import type { MaterialPage } from "@/lib/types";

const materialPages: MaterialPage[] = [
  {
    id: "profile-rivera",
    category: "人物资料",
    title: "诺拉·里维拉",
    summary: "用于档案任务的人事资料条目。",
    slug: ["profile", "rivera"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "姓名", value: "诺拉·里维拉" },
          { label: "生日", value: "1991年3月14日" },
          { label: "职责", value: "档案员" },
        ],
      },
    ],
  },
  {
    id: "catalog-basic-tools",
    category: "目录",
    title: "基础工具目录",
    summary: "站点采购使用的小型五金价格表。",
    slug: ["catalog", "basic-tools"],
    blocks: [
      {
        type: "table",
        columns: ["货号", "名称", "价格"],
        rows: [
          ["T-100", "扳手", "25"],
          ["T-220", "锤子", "19"],
          ["T-315", "钳子", "23"],
          ["T-410", "手锯", "31"],
        ],
      },
    ],
  },
  {
    id: "policy-shipping-v1",
    category: "规则",
    title: "配送规则 v1",
    summary: "站点仓库用于选择配送方式的规则。",
    slug: ["policy", "shipping-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "若重量小于等于 2kg 且订单总额大于等于 100，使用 EXPRESS-LITE。",
          "若重量小于等于 2kg 且订单总额小于 100，使用 STANDARD-S。",
          "若重量大于 2kg，使用 HEAVY-X。",
        ],
      },
    ],
  },
  {
    id: "projects-aurora",
    category: "项目",
    title: "极光项目",
    summary: "一个只分配了单一负责人的内部活跃项目。",
    slug: ["projects", "aurora"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "项目", value: "极光" },
          { label: "负责人", value: "李明辰" },
          { label: "负责人页面", value: "/materials/people/liam-chen" },
          { label: "状态", value: "活跃" },
        ],
      },
    ],
  },
  {
    id: "people-liam-chen",
    category: "人员",
    title: "李明辰",
    summary: "研究部门员工条目。",
    slug: ["people", "liam-chen"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "姓名", value: "李明辰" },
          { label: "员工编号", value: "EC-4182" },
          { label: "部门", value: "研究部" },
        ],
      },
    ],
  },
  {
    id: "archive-blue-harbor-note",
    category: "档案",
    title: "蓝港档案",
    summary: "站内检索返回的归档笔记条目。",
    slug: ["archive", "blue-harbor-note"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "档案标题", value: "蓝港档案" },
          { label: "档案码", value: "AH-9037" },
        ],
      },
    ],
  },
  {
    id: "docs-orders-refunds-v1",
    category: "资料",
    title: "订单与退款接口 v1",
    summary: "站点物流接口的分页说明。",
    slug: ["docs", "orders-refunds-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "从 ?page=1 读取订单，并沿着 next_page 继续读取，直到它变为 null。",
          "即使同一订单出现在多个页面，也只统计一次唯一的 order_id。",
          "逾期订单指状态字段 status 为“已送达”且送达日期 delivered_at 晚于承诺日期 promised_date 的订单。",
          "排除任何至少有一条状态字段 status 为“退款成功”的退款记录的订单。",
        ],
      },
    ],
  },
  {
    id: "policy-refund-v2",
    category: "规则",
    title: "退款规则 v2",
    summary: "客服分诊使用的自动退款规则。",
    slug: ["policy", "refund-v2"],
    blocks: [
      {
        type: "ordered",
        items: [
          "只有当 order_status 为“已送达”时，才可以自动退款。",
          "reported_at 必须在 delivered_at 之后 14 天内。",
          "damage_grade 必须为 2 或 3。",
          "evidence_complete 必须为 true。",
          "custom_item 必须为 false。",
          "prior_refund_count 必须等于 0。",
          "order_total 必须小于或等于 500。",
        ],
      },
    ],
  },
  {
    id: "policy-timezone-note",
    category: "规则",
    title: "时区说明",
    summary: "发射与维护日程使用的参考说明。",
    slug: ["policy", "timezone-note"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "时区", value: "Asia/Tokyo" },
          { label: "偏移", value: "协调世界时 +09:00" },
          { label: "夏令时", value: "不使用夏令时" },
        ],
      },
    ],
  },
  {
    id: "docs-device-events-v1",
    category: "资料",
    title: "设备事件指南 v1",
    summary: "说明如何解释设备日志中的停机记录。",
    slug: ["docs", "device-events-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "只有事件类型等于“故障结束”的行计入停机时间。",
          "忽略“心跳”、“巡检”和“维护”行。",
          "对计入的行按资产代码汇总损失分钟，并返回总数最大的资产。",
        ],
      },
    ],
  },
  {
    id: "docs-purchase-ledger-v1",
    category: "资料",
    title: "采购台账规则 v1",
    summary: "压缩台账档案的对账规则。",
    slug: ["docs", "purchase-ledger-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "压缩包包含入库.csv、出库.csv 和损坏.csv。",
          "只统计状态字段 status 为“已入账”的行。",
          "指定货号的净数量 = 入库 - 出库 - 损坏。",
        ],
      },
    ],
  },
  {
    id: "policy-support-playbook-v2",
    category: "规则",
    title: "客服处理手册 v2",
    summary: "实物商品客服案例的处理代码选择规则。",
    slug: ["policy", "support-playbook-v2"],
    blocks: [
      {
        type: "ordered",
        items: [
          "若 order_status 不是“已送达”，使用 HOLD-VERIFY。",
          "若 damage_grade 为 3，使用 REFUND-FULL-DISCARD。",
          "若 damage_grade 为 2，且 reported_at 距 signed_at 不超过 7 天，并且 customer_tier 为“金牌”或“白金”，使用 REFUND-PARTIAL-RESTOCK。",
          "若 damage_grade 为 2 且上一条规则不适用，使用 REPLACE-STANDARD。",
          "若 damage_grade 为 1，使用 OFFER-CREDIT。",
        ],
      },
    ],
  },
  {
    id: "cases-customer-118",
    category: "案例",
    title: "客户案例 118",
    summary: "用于规则执行任务的静态客服案例文件。",
    slug: ["cases", "customer-118"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "案例", value: "customer-118" },
          { label: "订单状态", value: "已送达" },
          { label: "损坏等级", value: "2" },
          { label: "签收日期", value: "2026-04-10" },
          { label: "报告日期", value: "2026-04-14" },
          { label: "客户等级", value: "金牌" },
          { label: "可否重新入库", value: "是" },
        ],
      },
    ],
  },
  {
    id: "archive-mercury-launch-brief",
    category: "档案",
    title: "水星发射简报",
    summary: "包含发射周人员安排说明的内部长文简报。",
    slug: ["archive", "mercury-launch-brief"],
    blocks: [
      {
        type: "text",
        text: "发射周人员范围锁定为以下值勤徽章：M-104、M-118、M-201、M-233、M-240、M-305、M-412、M-509、M-512。只有这些值勤徽章才算作本简报里的发射周工程人员名单。",
      },
      {
        type: "text",
        text: "徽章职责维护在徽章映射接口中，当前任职状态维护在团队名册表中。只统计发射周徽章标记为“推进”且名册状态为“在岗”的工程人员。",
      },
    ],
  },
  {
    id: "docs-inventory-api-v1",
    category: "资料",
    title: "库存接口指南 v1",
    summary: "移动历史的游标分页与补货判定规则。",
    slug: ["docs", "inventory-api-v1"],
    blocks: [
      {
        type: "ordered",
        items: [
          "从 /api/data/level-3/inventory-movements?cursor=start 开始，并沿着 next_cursor 继续读取，直到它变为 null。",
          "使用起始页上的 catalog.as_of 日期。本数据集中，最近 30 天窗口包含 2026-03-26 当日及之后的行。",
          "净流出 = 已发货 + 损坏 - 补货。",
          "只有当净流出大于等于 reorder_threshold 且 on_hand 小于 safety_stock 时，才触发红色补货。",
          "返回唯一触发红色补货的目录项 alert_code。",
        ],
      },
    ],
  },
  {
    id: "engineering-incident-871",
    category: "工程资料",
    title: "事故概览 871",
    summary: "一次发布后性能退化的服务指标摘录。",
    slug: ["engineering", "incident-871"],
    blocks: [
      {
        type: "table",
        columns: ["服务", "发布前 p95 毫秒", "发布后 p95 毫秒", "错误率"],
        rows: [
          ["api-gateway", "180", "420", "0.4%"],
          ["search-indexer", "210", "980", "1.8%"],
          ["billing-worker", "190", "310", "0.3%"],
          ["profile-service", "160", "270", "0.2%"],
        ],
      },
    ],
  },
  {
    id: "engineering-config-diff-871",
    category: "工程资料",
    title: "配置差异 871",
    summary: "灰度环境与稳定环境的配置差异。",
    slug: ["engineering", "config-diff-871"],
    blocks: [
      {
        type: "table",
        columns: ["配置项", "稳定环境", "灰度环境", "风险说明"],
        rows: [
          ["CACHE_TTL_SECONDS", "60", "3600", "库存、价格和状态字段可能长时间陈旧"],
          ["MAX_DB_POOL", "64", "64", "无差异"],
          ["FEATURE_ORDER_EXPORT", "false", "false", "无差异"],
          ["TRACE_SAMPLE_RATE", "0.05", "0.05", "无差异"],
        ],
      },
    ],
  },
  {
    id: "engineering-trace-sample-871",
    category: "工程资料",
    title: "链路样本 871",
    summary: "失败请求的追踪摘要。",
    slug: ["engineering", "trace-sample-871"],
    blocks: [
      {
        type: "table",
        columns: ["span", "状态", "重试次数", "根因代码"],
        rows: [
          ["request.accept", "ok", "0", "none"],
          ["partner.quote", "failed", "3", "partner-rate-limit"],
          ["cache.write", "skipped", "0", "upstream-failed"],
          ["response.map", "failed", "0", "upstream-failed"],
        ],
      },
    ],
  },
  {
    id: "engineering-schema-review-871",
    category: "工程资料",
    title: "迁移评审 871",
    summary: "数据库迁移前的索引检查记录。",
    slug: ["engineering", "schema-review-871"],
    blocks: [
      {
        type: "ordered",
        items: [
          "新增查询会按 customer_id 和 created_at 过滤订单。",
          "评审要求创建复合索引 idx_orders_customer_created_at。",
          "当前迁移脚本只创建了 idx_orders_created_at，缺少复合索引。",
        ],
      },
    ],
  },
  {
    id: "engineering-queue-runbook",
    category: "工程资料",
    title: "队列运行手册",
    summary: "后台队列的人工处置规则。",
    slug: ["engineering", "queue-runbook"],
    blocks: [
      {
        type: "table",
        columns: ["条件", "动作代码"],
        rows: [
          ["待处理数小于等于 5000", "OBSERVE"],
          ["待处理数超过 5000 且最老消息小于等于 600 秒", "CHECK-CONSUMER"],
          ["待处理数超过 5000 且最老消息超过 600 秒", "SCALE-CONSUMERS"],
          ["存在死信消息", "DRAIN-DLQ"],
        ],
      },
    ],
  },
  {
    id: "engineering-api-contract-v3",
    category: "工程资料",
    title: "接口契约审查 v3",
    summary: "订单响应字段兼容性审查。",
    slug: ["engineering", "api-contract-v3"],
    blocks: [
      {
        type: "table",
        columns: ["字段", "旧类型", "新类型", "结论"],
        rows: [
          ["order_id", "string", "string", "兼容"],
          ["order_total_cents", "string", "integer", "破坏性变更"],
          ["line_items", "array", "array", "兼容"],
          ["created_at", "string", "string", "兼容"],
        ],
      },
    ],
  },
  {
    id: "engineering-release-checklist",
    category: "工程资料",
    title: "发布清单",
    summary: "上线前检查项状态。",
    slug: ["engineering", "release-checklist"],
    blocks: [
      {
        type: "table",
        columns: ["检查项", "状态", "是否阻塞"],
        rows: [
          ["单元测试", "通过", "否"],
          ["数据库演练", "失败", "是"],
          ["监控告警", "通过", "否"],
          ["回滚脚本", "通过", "否"],
        ],
      },
    ],
  },
  {
    id: "engineering-security-audit-sample",
    category: "工程资料",
    title: "安全审计摘录",
    summary: "管理员操作的访问日志样本。",
    slug: ["engineering", "security-audit-sample"],
    blocks: [
      {
        type: "table",
        columns: ["来源", "操作", "结果"],
        rows: [
          ["10.0.1.8", "管理员导出", "允许"],
          ["203.0.113.9", "管理员导出", "拒绝"],
          ["203.0.113.9", "管理员删除", "拒绝"],
          ["198.51.100.12", "普通查询", "拒绝"],
          ["198.51.100.12", "管理员重置", "拒绝"],
          ["10.0.1.9", "管理员重置", "允许"],
        ],
      },
    ],
  },
  {
    id: "engineering-slo-report",
    category: "工程资料",
    title: "SLO 报告",
    summary: "本周错误预算消耗。",
    slug: ["engineering", "slo-report"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "错误预算", value: "43 分钟" },
          { label: "已消耗", value: "37 分钟" },
          { label: "口径", value: "剩余 = 错误预算 - 已消耗" },
        ],
      },
    ],
  },
  {
    id: "engineering-cache-migration-note",
    category: "工程资料",
    title: "缓存迁移说明",
    summary: "缓存迁移期间的处置矩阵。",
    slug: ["engineering", "cache-migration-note"],
    blocks: [
      {
        type: "table",
        columns: ["异步预热延迟", "直写状态", "处置模式"],
        rows: [
          ["小于等于 300 秒", "开启", "继续观察"],
          ["超过 300 秒", "开启", "暂停灰度"],
          ["超过 300 秒", "关闭", "回滚到直写"],
        ],
      },
    ],
  },
  {
    id: "finance-revenue-policy",
    category: "财务资料",
    title: "收入确认政策",
    summary: "二季度软件与服务收入确认口径。",
    slug: ["finance", "revenue-policy"],
    blocks: [
      {
        type: "ordered",
        items: [
          "只有状态为“已交付”且验收为“完成”的订单可以确认收入。",
          "已退款订单不得确认收入。",
          "已收款但未满足确认条件且未退款的金额列为递延收入。",
        ],
      },
    ],
  },
  {
    id: "finance-q2-orders",
    category: "财务资料",
    title: "二季度订单表",
    summary: "金额单位为万元。",
    slug: ["finance", "q2-orders"],
    blocks: [
      {
        type: "table",
        columns: ["订单", "金额", "状态", "验收", "已退款", "已收款"],
        rows: [
          ["A-101", "120", "已交付", "完成", "否", "是"],
          ["A-102", "80", "已发货", "未完成", "否", "是"],
          ["A-103", "200", "已交付", "完成", "是", "是"],
          ["A-104", "150", "已交付", "完成", "否", "是"],
          ["A-105", "90", "已交付", "未完成", "否", "是"],
        ],
      },
    ],
  },
  {
    id: "finance-counterparty-exposure",
    category: "财务资料",
    title: "交易对手敞口表",
    summary: "用于信用敞口筛查。",
    slug: ["finance", "counterparty-exposure"],
    blocks: [
      {
        type: "table",
        columns: ["交易对手", "评级", "敞口"],
        rows: [
          ["北辰制造", "A", "72"],
          ["海岚贸易", "BBB-", "64"],
          ["远杉物流", "BB+", "48"],
          ["青石能源", "BB", "90"],
          ["星阔服务", "BBB", "55"],
        ],
      },
    ],
  },
  {
    id: "finance-liquidity-brief",
    category: "财务资料",
    title: "流动性摘要",
    summary: "金额单位为万元。",
    slug: ["finance", "liquidity-brief"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "现金", value: "320" },
          { label: "30 天应收", value: "180" },
          { label: "已承诺流出", value: "410" },
          { label: "最低缓冲", value: "60" },
          { label: "公式", value: "盈余 = 现金 + 30 天应收 - 已承诺流出 - 最低缓冲" },
        ],
      },
    ],
  },
  {
    id: "finance-portfolio-stress",
    category: "财务资料",
    title: "投资组合压力公式",
    summary: "金额单位为万元。",
    slug: ["finance", "portfolio-stress"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "权益敞口", value: "300" },
          { label: "信用敞口", value: "200" },
          { label: "商品敞口", value: "150" },
          { label: "公式", value: "压力损失 = 权益 × 18% + 信用 × 9% + 商品 × 14%" },
        ],
      },
    ],
  },
  {
    id: "finance-fx-hedge-note",
    category: "财务资料",
    title: "外汇套保说明",
    summary: "欧元发票折算口径。",
    slug: ["finance", "fx-hedge-note"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "发票金额", value: "120 万欧元" },
          { label: "锁汇部分", value: "80 万欧元，汇率 7.72" },
          { label: "未锁汇部分", value: "40 万欧元，按即期汇率 7.91" },
          { label: "口径", value: "人民币合计以万元列示，保留一位小数" },
        ],
      },
    ],
  },
  {
    id: "finance-covenant-note",
    category: "财务资料",
    title: "债务契约说明",
    summary: "季度杠杆测试。",
    slug: ["finance", "covenant-note"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "净债务", value: "900" },
          { label: "调整后 EBITDA", value: "260" },
          { label: "阈值", value: "净债务 / 调整后 EBITDA 小于或等于 3.5 倍即通过" },
        ],
      },
    ],
  },
  {
    id: "finance-audit-sample",
    category: "财务资料",
    title: "审计样本",
    summary: "发票抽样记录。",
    slug: ["finance", "audit-sample"],
    blocks: [
      {
        type: "table",
        columns: ["发票编号", "供应商", "金额"],
        rows: [
          ["INV-112", "北辰制造", "42"],
          ["INV-205", "海岚贸易", "18"],
          ["INV-112", "北辰制造", "42"],
          ["INV-219", "远杉物流", "35"],
          ["INV-301", "青石能源", "27"],
          ["INV-219", "远杉物流", "36"],
        ],
      },
    ],
  },
  {
    id: "finance-cohort-retention",
    category: "财务资料",
    title: "留存表",
    summary: "第一季度队列留存口径。",
    slug: ["finance", "cohort-retention"],
    blocks: [
      {
        type: "table",
        columns: ["队列", "初始用户", "第 3 月活跃", "第 6 月活跃"],
        rows: [["第一季度", "1000", "620", "410"]],
      },
    ],
  },
  {
    id: "finance-expected-loss",
    category: "财务资料",
    title: "预期损失表",
    summary: "预期损失按 PD × LGD × EAD 计算。",
    slug: ["finance", "expected-loss"],
    blocks: [
      {
        type: "table",
        columns: ["资产", "PD", "LGD", "EAD"],
        rows: [
          ["贷款甲", "0.02", "0.40", "1000"],
          ["贷款乙", "0.05", "0.50", "600"],
          ["贷款丙", "0.12", "0.45", "300"],
        ],
      },
    ],
  },
  {
    id: "research-enzyme-kinetics",
    category: "科研资料",
    title: "酶动力学摘要",
    summary: "抑制类型判读。",
    slug: ["research", "enzyme-kinetics"],
    blocks: [
      {
        type: "table",
        columns: ["条件", "Km", "Vmax"],
        rows: [
          ["无抑制剂", "4.0", "100"],
          ["加入候选抑制剂", "8.1", "98"],
        ],
      },
      {
        type: "ordered",
        items: [
          "Vmax 基本不变而 Km 升高，判为竞争性抑制。",
          "Vmax 降低而 Km 基本不变，判为非竞争性抑制。",
        ],
      },
    ],
  },
  {
    id: "research-trial-statistics",
    category: "科研资料",
    title: "试验统计摘要",
    summary: "处理组和对照组事件率。",
    slug: ["research", "trial-statistics"],
    blocks: [
      {
        type: "table",
        columns: ["组别", "样本量", "事件数", "事件率"],
        rows: [
          ["处理组", "200", "32", "16%"],
          ["对照组", "200", "56", "28%"],
        ],
      },
    ],
  },
  {
    id: "research-decay-record",
    category: "科研资料",
    title: "衰变记录",
    summary: "放射性计数随时间变化。",
    slug: ["research", "decay-record"],
    blocks: [
      {
        type: "table",
        columns: ["时间", "计数"],
        rows: [
          ["0 小时", "1000"],
          ["10 小时", "250"],
        ],
      },
      {
        type: "text",
        text: "从 1000 到 250 等于经历两次半衰期。",
      },
    ],
  },
  {
    id: "research-genetics-cross",
    category: "科研资料",
    title: "遗传学记录",
    summary: "双基因测交的理论比例。",
    slug: ["research", "genetics-cross"],
    blocks: [
      {
        type: "ordered",
        items: [
          "亲本组合为 AaBb 与 aabb。",
          "两个基因独立分离。",
          "双隐性 aabb 的理论比例为 1/4。",
          "观察总数按 400 个后代计算。",
        ],
      },
    ],
  },
  {
    id: "research-assay-validation",
    category: "科研资料",
    title: "测定验证表",
    summary: "阴性样本的假阳性结果。",
    slug: ["research", "assay-validation"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "阴性样本", value: "150" },
          { label: "假阳性", value: "3" },
          { label: "特异性", value: "真阴性 / 阴性样本总数" },
        ],
      },
    ],
  },
  {
    id: "research-spectrum-card",
    category: "科研资料",
    title: "质谱判读卡",
    summary: "候选物峰型对照。",
    slug: ["research", "spectrum-card"],
    blocks: [
      {
        type: "table",
        columns: ["候选物", "基峰", "分子离子峰"],
        rows: [
          ["甲苯", "91", "92"],
          ["乙苯", "91", "106"],
          ["苯甲醚", "108", "108"],
        ],
      },
    ],
  },
  {
    id: "research-ecology-plots",
    category: "科研资料",
    title: "生态样地表",
    summary: "本土种数与入侵种数记录。",
    slug: ["research", "ecology-plots"],
    blocks: [
      {
        type: "table",
        columns: ["样地", "本土种数", "入侵种数"],
        rows: [
          ["阿尔法样地", "18", "2"],
          ["贝塔样地", "16", "1"],
          ["伽马样地", "22", "3"],
        ],
      },
    ],
  },
  {
    id: "research-annealing-table",
    category: "科研资料",
    title: "材料热处理表",
    summary: "退火温度与性能。",
    slug: ["research", "annealing-table"],
    blocks: [
      {
        type: "table",
        columns: ["退火温度", "抗拉强度", "延伸率"],
        rows: [
          ["580", "790", "13.1"],
          ["600", "805", "11.4"],
          ["620", "810", "12.5"],
          ["640", "798", "13.0"],
        ],
      },
    ],
  },
  {
    id: "research-multiple-comparison",
    category: "科研资料",
    title: "多重比较说明",
    summary: "Bonferroni 校正。",
    slug: ["research", "multiple-comparison"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "比较数", value: "4" },
          { label: "总体显著性水平", value: "0.05" },
          { label: "校正阈值", value: "0.0125" },
        ],
      },
      {
        type: "table",
        columns: ["比较编号", "原始 p 值"],
        rows: [
          ["A", "0.004"],
          ["B", "0.018"],
          ["C", "0.031"],
          ["D", "0.049"],
        ],
      },
    ],
  },
  {
    id: "research-sample-exclusion",
    category: "科研资料",
    title: "样本排除规则",
    summary: "样本质量控制。",
    slug: ["research", "sample-exclusion"],
    blocks: [
      {
        type: "ordered",
        items: [
          "溶血指数大于 2 的样本应排除。",
          "储存时间超过 48 小时的样本应排除。",
        ],
      },
      {
        type: "table",
        columns: ["样本", "溶血指数", "储存小时"],
        rows: [
          ["S1", "1", "24"],
          ["S2", "3", "20"],
          ["S3", "2", "48"],
          ["S4", "1", "52"],
          ["S5", "4", "60"],
        ],
      },
    ],
  },
  {
    id: "visual-channel-dashboard",
    category: "视觉图表",
    title: "渠道季度图表",
    summary: "四个渠道的季度收入，单位为万元。",
    slug: ["visual", "channel-dashboard"],
    blocks: [
      {
        type: "table",
        columns: ["渠道", "Q1", "Q2", "Q3", "Q4"],
        rows: [
          ["搜索广告", "24", "28", "33", "39"],
          ["线下活动", "18", "22", "20", "16"],
          ["合作渠道", "31", "34", "38", "41"],
          ["邮件召回", "12", "15", "18", "21"],
        ],
      },
    ],
  },
  {
    id: "visual-conversion-funnel",
    category: "视觉图表",
    title: "转化漏斗表",
    summary: "页面访问、注册、付费与错误数。",
    slug: ["visual", "conversion-funnel"],
    blocks: [
      {
        type: "table",
        columns: ["页面", "访问", "注册", "付费", "错误"],
        rows: [
          ["首页", "1200", "180", "48", "6"],
          ["文档页", "800", "96", "32", "8"],
          ["定价页", "640", "128", "64", "4"],
          ["社区页", "500", "50", "15", "12"],
        ],
      },
    ],
  },
  {
    id: "visual-project-timeline",
    category: "视觉图表",
    title: "项目时间线",
    summary: "关键事件发生日期。",
    slug: ["visual", "project-timeline"],
    blocks: [
      {
        type: "table",
        columns: ["日期", "事件"],
        rows: [
          ["2026-03-02", "需求冻结"],
          ["2026-03-05", "数据到位"],
          ["2026-03-08", "模型训练"],
          ["2026-03-11", "灰度"],
          ["2026-03-13", "发布"],
        ],
      },
    ],
  },
  {
    id: "visual-service-network",
    category: "视觉图表",
    title: "调用网络",
    summary: "服务节点之间的单向调用延迟。",
    slug: ["visual", "service-network"],
    blocks: [
      {
        type: "table",
        columns: ["起点", "终点", "延迟"],
        rows: [
          ["入口", "检索", "4"],
          ["入口", "画像", "9"],
          ["检索", "排序", "12"],
          ["画像", "排序", "5"],
          ["排序", "展示", "8"],
          ["检索", "风控", "17"],
          ["风控", "展示", "6"],
        ],
      },
    ],
  },
  {
    id: "visual-heatmap-grid",
    category: "视觉图表",
    title: "热力矩阵",
    summary: "区域在三个时段的活跃度。",
    slug: ["visual", "heatmap-grid"],
    blocks: [
      {
        type: "table",
        columns: ["区域", "早", "中", "晚"],
        rows: [
          ["A", "72", "81", "69"],
          ["B", "84", "79", "88"],
          ["C", "61", "77", "82"],
          ["D", "55", "91", "70"],
        ],
      },
    ],
  },
  {
    id: "abstract-symbol-rules",
    category: "抽象规则",
    title: "符号合成规则",
    summary: "右格由左格和中格合成。",
    slug: ["abstract", "symbol-rules"],
    blocks: [
      {
        type: "ordered",
        items: [
          "合成时保留两边出现过的所有符号。",
          "符号顺序固定为 ○、△、□、◇。",
          "重复出现的符号按出现次数保留。",
        ],
      },
    ],
  },
  {
    id: "abstract-transform-pipeline",
    category: "抽象规则",
    title: "变换流水线",
    summary: "输入图形到输出图形的操作。",
    slug: ["abstract", "transform-pipeline"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "输入", value: "左上角空心小三角" },
          { label: "输出", value: "右下角实心大三角" },
        ],
      },
      {
        type: "table",
        columns: ["编号", "操作"],
        rows: [
          ["A", "移动到右下角"],
          ["B", "放大一倍"],
          ["C", "改成圆形"],
          ["D", "填充为实心"],
        ],
      },
      {
        type: "text",
        text: "允许的最短正确链路必须保持形状为三角形，先处理尺寸，再处理填充，最后移动位置。",
      },
    ],
  },
  {
    id: "abstract-symmetry-panels",
    category: "抽象规则",
    title: "对称面板",
    summary: "四个候选面板的左右结构。",
    slug: ["abstract", "symmetry-panels"],
    blocks: [
      {
        type: "table",
        columns: ["面板", "左列", "右列"],
        rows: [
          ["A", "黑白黑", "黑白黑"],
          ["B", "黑白白", "黑黑白"],
          ["C", "圆方圆", "圆方圆"],
          ["D", "圆圆方", "方圆圆"],
        ],
      },
    ],
  },
  {
    id: "abstract-grid-rules",
    category: "抽象规则",
    title: "网格扩张规则",
    summary: "矩形向外扩张一圈。",
    slug: ["abstract", "grid-rules"],
    blocks: [
      {
        type: "text",
        text: "2×3 黑格矩形向外扩张一圈后，外接矩形变为 4×5。扩张后的全部外接矩形格子都变黑。",
      },
    ],
  },
  {
    id: "abstract-color-vote",
    category: "抽象规则",
    title: "颜色投票规则",
    summary: "三个输入格决定输出颜色。",
    slug: ["abstract", "color-vote"],
    blocks: [
      {
        type: "ordered",
        items: [
          "若某个颜色出现两次或三次，输出该颜色。",
          "若三个颜色都不同，输出灰。",
          "若出现空白，忽略空白后再投票。",
        ],
      },
    ],
  },
  {
    id: "abstract-attribute-rules",
    category: "抽象规则",
    title: "属性规则",
    summary: "边数、填充和颜色映射。",
    slug: ["abstract", "attribute-rules"],
    blocks: [
      {
        type: "table",
        columns: ["输入属性", "输出字段", "输出值"],
        rows: [
          ["3 条边", "shape", "triangle"],
          ["4 条边", "shape", "square"],
          ["实心", "fill", "solid"],
          ["空心", "fill", "hollow"],
          ["黑色", "color", "black"],
        ],
      },
    ],
  },
  {
    id: "abstract-maze-rule",
    category: "抽象规则",
    title: "迷宫规则",
    summary: "最短路径任务。",
    slug: ["abstract", "maze-rule"],
    blocks: [
      {
        type: "table",
        columns: ["行", "格子"],
        rows: [
          ["1", "S . . #"],
          ["2", "# # . #"],
          ["3", ". . . G"],
        ],
      },
      {
        type: "text",
        text: "只能上下左右移动，不能穿过 #。",
      },
    ],
  },
  {
    id: "abstract-analogy-map",
    category: "抽象规则",
    title: "类比映射",
    summary: "字符串映射规则。",
    slug: ["abstract", "analogy-map"],
    blocks: [
      {
        type: "ordered",
        items: [
          "映射先反转字符串。",
          "不替换字符本身。",
          "AB 因此映射为 BA。",
        ],
      },
    ],
  },
  {
    id: "abstract-constraint-card",
    category: "抽象规则",
    title: "约束卡",
    summary: "候选数字筛选。",
    slug: ["abstract", "constraint-card"],
    blocks: [
      {
        type: "ordered",
        items: [
          "必须是奇数。",
          "必须可被 3 整除。",
          "必须小于 20。",
        ],
      },
    ],
  },
  {
    id: "code-parser-bug",
    category: "代码任务",
    title: "解析器缺陷报告",
    summary: "CSV 解析器的最小修复。",
    slug: ["code", "parser-bug"],
    blocks: [
      {
        type: "ordered",
        items: [
          "现有行为：split(',') 后直接返回字段。",
          "新增回归：连续逗号必须保留空字段。",
          "新增回归：字段两侧空格必须 trim。",
          "普通 CSV 三列解析已经通过。",
        ],
      },
      {
        type: "table",
        columns: ["补丁", "说明"],
        rows: [
          ["PATCH-A", "过滤掉所有空字段"],
          ["PATCH-B", "只 trim 第一个字段"],
          ["PATCH-C", "保留空字段，并 trim 每个字段"],
          ["PATCH-D", "把逗号替换为空格后 split"],
        ],
      },
    ],
  },
  {
    id: "code-debug-trace",
    category: "代码任务",
    title: "调试轨迹",
    summary: "下一步调试操作排序。",
    slug: ["code", "debug-trace"],
    blocks: [
      {
        type: "table",
        columns: ["编号", "操作"],
        rows: [
          ["A", "复现失败测试"],
          ["B", "读取失败断言和输入"],
          ["C", "重构整个模块"],
          ["D", "写最小回归测试"],
        ],
      },
      {
        type: "text",
        text: "最小风险链路：先看断言，再复现，再固化回归，最后才扩大改动。",
      },
    ],
  },
  {
    id: "code-browser-task",
    category: "代码任务",
    title: "浏览器任务日志",
    summary: "UI 自动化失败原因。",
    slug: ["code", "browser-task"],
    blocks: [
      {
        type: "ordered",
        items: [
          "输入框已填写。",
          "网络请求尚未发出。",
          "按钮可见但点击坐标命中 modal-backdrop。",
          "移除遮罩后按钮点击成功。",
        ],
      },
    ],
  },
  {
    id: "code-test-matrix",
    category: "代码任务",
    title: "测试矩阵",
    summary: "补丁后的测试预期。",
    slug: ["code", "test-matrix"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "现有通过", value: "4" },
          { label: "新增回归", value: "3" },
          { label: "推荐补丁影响", value: "全部通过" },
        ],
      },
    ],
  },
  {
    id: "code-dependency-conflict",
    category: "代码任务",
    title: "依赖冲突说明",
    summary: "类型定义不兼容。",
    slug: ["code", "dependency-conflict"],
    blocks: [
      {
        type: "text",
        text: "构建日志显示 zod 的 schema 推断缺少 readonly tuple 支持。升级 zod 后，本地 TypeScript 版本无需调整。",
      },
    ],
  },
  {
    id: "code-change-scope",
    category: "代码任务",
    title: "变更清单",
    summary: "最小修复范围。",
    slug: ["code", "change-scope"],
    blocks: [
      {
        type: "table",
        columns: ["文件", "是否必要"],
        rows: [
          ["lib/parser.ts", "必要"],
          ["tests/parser.test.ts", "必要"],
          ["app/globals.css", "无关"],
          ["README.md", "无关"],
        ],
      },
    ],
  },
  {
    id: "code-a11y-regression",
    category: "代码任务",
    title: "可访问性回归",
    summary: "按钮没有可读名称。",
    slug: ["code", "a11y-regression"],
    blocks: [
      {
        type: "table",
        columns: ["补丁", "说明"],
        rows: [
          ["PATCH-A", "把按钮文字改成透明"],
          ["PATCH-B", "为图标按钮补 aria-label，不改变 CSS"],
          ["PATCH-C", "删除按钮边框"],
          ["PATCH-D", "把按钮换成 div"],
        ],
      },
    ],
  },
  {
    id: "code-api-contract",
    category: "代码任务",
    title: "API 契约",
    summary: "最小合法请求体。",
    slug: ["code", "api-contract"],
    blocks: [
      {
        type: "ordered",
        items: [
          "请求体必须包含 name。",
          "请求体必须包含 items。",
          "items 必须是非空字符串数组。",
          "可选字段不要发送。",
        ],
      },
    ],
  },
  {
    id: "code-release-runbook",
    category: "代码任务",
    title: "发布手册",
    summary: "发布前检查顺序。",
    slug: ["code", "release-runbook"],
    blocks: [
      {
        type: "table",
        columns: ["编号", "步骤"],
        rows: [
          ["A", "运行单元测试"],
          ["B", "构建生产包"],
          ["C", "运行类型检查"],
          ["D", "检查运行时配置"],
        ],
      },
      {
        type: "text",
        text: "推荐顺序：先测试，再类型检查，再构建，最后核对运行时配置。",
      },
    ],
  },
  {
    id: "agent-support-policy",
    category: "综合代理",
    title: "客服策略和对话",
    summary: "工具调用前必须核验订单。",
    slug: ["agent", "support-policy"],
    blocks: [
      {
        type: "ordered",
        items: [
          "用户请求退款，订单号 O-8841。",
          "退款前必须先调用 order.lookup 核验订单状态。",
          "只有订单状态为 delivered 且 7 天内，才允许创建退款。",
        ],
      },
    ],
  },
  {
    id: "agent-web-task",
    category: "综合代理",
    title: "网页任务卡",
    summary: "完成表单提交的动作链。",
    slug: ["agent", "web-task"],
    blocks: [
      {
        type: "table",
        columns: ["编号", "动作"],
        rows: [
          ["A", "选择确认复选框"],
          ["B", "打开目标页面"],
          ["C", "提交表单"],
          ["D", "填写必填字段"],
        ],
      },
    ],
  },
  {
    id: "agent-procurement-policy",
    category: "综合代理",
    title: "采购政策",
    summary: "供应商筛选。",
    slug: ["agent", "procurement-policy"],
    blocks: [
      {
        type: "table",
        columns: ["供应商", "安全审计", "报价", "交付天数"],
        rows: [
          ["杉木数据", "通过", "88", "12"],
          ["北辰算力", "未通过", "72", "10"],
          ["远岚咨询", "通过", "105", "9"],
          ["栈桥科技", "通过", "94", "14"],
        ],
      },
      {
        type: "text",
        text: "进入下一轮必须安全审计通过，报价不超过 100，交付不超过 14 天。",
      },
    ],
  },
  {
    id: "agent-mle-card",
    category: "综合代理",
    title: "机器学习任务卡",
    summary: "评估和修复优先级。",
    slug: ["agent", "mle-card"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "训练集准确率", value: "0.991" },
          { label: "验证 macro_f1", value: "0.742" },
          { label: "风险", value: "验证集泄漏来自重复用户样本" },
        ],
      },
    ],
  },
  {
    id: "agent-security-boundary",
    category: "综合代理",
    title: "安全策略",
    summary: "数据边界规则。",
    slug: ["agent", "security-boundary"],
    blocks: [
      {
        type: "ordered",
        items: [
          "不得向第三方插件发送客户邮箱。",
          "不得把会话令牌写入公开系统。",
          "允许上传匿名聚合计数。",
          "允许在本地读取脱敏日志。",
        ],
      },
    ],
  },
  {
    id: "agent-research-plan",
    category: "综合代理",
    title: "研究执行卡",
    summary: "可复现研究流程。",
    slug: ["agent", "research-plan"],
    blocks: [
      {
        type: "table",
        columns: ["编号", "步骤"],
        rows: [
          ["A", "固定数据切分和随机种子"],
          ["B", "定义评价指标和验收阈值"],
          ["C", "生成最终报告和复现实验命令"],
          ["D", "运行实验并保存原始结果"],
        ],
      },
    ],
  },
  {
    id: "agent-sla-contract",
    category: "综合代理",
    title: "合同 SLA",
    summary: "报告补交日期。",
    slug: ["agent", "sla-contract"],
    blocks: [
      {
        type: "keyValue",
        rows: [
          { label: "事故日期", value: "2026-04-15" },
          { label: "补交时限", value: "3 个自然日内" },
          { label: "节假日规则", value: "本合同按自然日计算，不顺延" },
        ],
      },
    ],
  },
  {
    id: "agent-final-decision",
    category: "综合代理",
    title: "综合任务评分规程",
    summary: "硬约束和成本。",
    slug: ["agent", "final-decision"],
    blocks: [
      {
        type: "table",
        columns: ["方案", "准确率", "隐私合规", "可复现", "成本"],
        rows: [
          ["PLAN-A", "0.91", "否", "是", "70"],
          ["PLAN-B", "0.89", "是", "否", "55"],
          ["PLAN-C", "0.88", "是", "是", "60"],
          ["PLAN-D", "0.86", "是", "是", "75"],
        ],
      },
      {
        type: "text",
        text: "硬约束：准确率至少 0.87，隐私合规为是，可复现为是。满足硬约束后选择成本最低方案。",
      },
    ],
  },
];

export function getMaterialPageBySlug(slug: string[]) {
  return materialPages.find((page) => page.slug.join("/") === slug.join("/"));
}

export function getAllMaterialParams() {
  return materialPages.map((page) => ({ slug: page.slug }));
}
