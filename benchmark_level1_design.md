# Agent Benchmark Level 1 设计草案

## 1. 目标

做一个对 AI agent 友好的小型评测网站：

- AI 先通过统一接口获取试卷
- AI 再按约定提交答案
- 网站根据标准答案自动评分
- 题目答案固定、可验证、低争议
- 第一关先控制在 10 题，重点测基础能力和最小工具使用能力

这个方向和几个主流 benchmark 的思路是一致的：

- GAIA 强调题目对人类“概念上简单”，但需要推理、浏览、工具使用
- BrowseComp 强调答案应当简短、唯一、可验证
- WebArena 强调环境和交互接口要标准化、可程序验证

对第一关来说，不建议一上来就做非常难的开放互联网题。更稳妥的做法是：

1. 先做一个 `Level 1`，以固定答案、短输出、可自动判分为主
2. 浏览能力优先测试“站内搜索 / 站内页面跳转 / 简单 API 调用”
3. 外网搜索题先少量引入，且最好用“新鲜、冷门、非预训练记忆型”的数据

## 2. 出题原则

### 2.1 必须满足

- 答案短：数字、短字符串、单个选项、日期、ID、SKU 这类最稳
- 唯一：尽量避免“差不多也算对”
- 可验证：最好 exact match，最多做大小写无关或日期格式归一
- 稳定：不要依赖随时间变化的数据
- 抗背题：不能大量依赖模型训练中高频出现的常识事实

### 2.2 第一关建议的能力切分

- 纯计算：不依赖工具
- 规则理解：按题目要求做格式化、排序、筛选
- 单页检索：打开一个页面就能找到答案
- 多跳检索：需要在 2 到 3 个页面之间跳转
- 结构化调用：从 JSON API 读取数据再作答

### 2.3 不建议作为第一关题目来源

- 明星生日
- 国家首都
- 著名公司创始人
- 基础百科知识

这些题很难区分模型是在“调用搜索”还是“直接背出来”。

## 3. 题库结构建议

第一关 10 题可以按下面分布：

- 4 题：纯计算 / 逻辑
- 3 题：站内单页检索
- 2 题：站内多跳检索
- 1 题：站内 API 检索

这样既能测基础正确率，也能开始区分“会不会主动请求网页 / API”。

## 4. 网站接口建议

### 4.1 取卷

`GET /api/exams/level-1`

返回示例：

```json
{
  "exam_id": "level-1-20260424",
  "title": "Agent Benchmark Level 1",
  "time_limit_sec": 600,
  "submit_url": "/api/submissions",
  "questions": [
    {
      "id": "q01",
      "type": "single_choice",
      "prompt": "计算 137 + 289 的结果。",
      "options": ["416", "426", "436", "446"]
    }
  ]
}
```

### 4.2 交卷

`POST /api/submissions`

请求示例：

```json
{
  "exam_id": "level-1-20260424",
  "answers": {
    "q01": "B",
    "q02": "D",
    "q03": "42"
  }
}
```

返回示例：

```json
{
  "exam_id": "level-1-20260424",
  "score": 8,
  "total": 10,
  "accuracy": 0.8,
  "results": [
    {
      "id": "q01",
      "correct": true,
      "expected": "B",
      "received": "B"
    }
  ]
}
```

### 4.3 判分规则

- `single_choice`: 只接受 `A/B/C/D`
- `exact_text`: 去除首尾空格后 exact match
- `date_yyyymmdd`: 统一归一为 8 位数字后比较
- `integer`: 只接受十进制整数字符串

第一版最好以 `single_choice` 和 `integer` 为主，稳定性最高。

## 5. Level 1 初版 10 题

下面这 10 题是可以直接上线的第一版题库草案。为了同时测“无工具能力”和“会不会发请求找信息”，我把它们分成两组：

- `Q01-Q04`：纯题面可解
- `Q05-Q10`：需要访问站内页面或 API

---

### Q01 纯计算

- 类型：`single_choice`
- 题面：计算 `137 + 289` 的结果。
- 选项：
  - A. 416
  - B. 426
  - C. 436
  - D. 446
- 标准答案：`B`
- 测试能力：基础算术

### Q02 简单多步计算

- 类型：`single_choice`
- 题面：计算 `(18 x 7) - 35` 的结果。
- 选项：
  - A. 81
  - B. 91
  - C. 101
  - D. 111
- 标准答案：`B`
- 测试能力：多步计算

### Q03 数列规律

- 类型：`single_choice`
- 题面：数列 `2, 6, 12, 20, 30, ?` 的下一个数字是？
- 选项：
  - A. 36
  - B. 40
  - C. 42
  - D. 48
- 标准答案：`C`
- 测试能力：模式识别

### Q04 简单逻辑

- 类型：`single_choice`
- 题面：小王比小李年长，小张比小李年长，小张比小王年轻。三人中年龄最大的是谁？
- 选项：
  - A. 小李
  - B. 小王
  - C. 小张
  - D. 无法判断
- 标准答案：`B`
- 测试能力：比较关系推理

### Q05 单页检索 + 日期格式化

- 类型：`exact_text`
- 依赖页面：`GET /materials/profile/rivera`
- 题面：访问人物资料页 `/materials/profile/rivera`，找出生日，并按 `YYYYMMDD` 格式回答。
- 页面内容建议：

```text
Name: Nora Rivera
Birthday: March 14, 1991
Role: Archivist
```

- 标准答案：`19910314`
- 测试能力：请求网页、信息抽取、日期格式化

### Q06 单页检索 + 表格查找

- 类型：`single_choice`
- 依赖页面：`GET /materials/catalog/basic-tools`
- 题面：访问商品页 `/materials/catalog/basic-tools`。价格最低的商品 SKU 是哪一个？
- 页面内容建议：

```text
SKU      Name        Price
T-100    Wrench      25
T-220    Hammer      19
T-315    Pliers      23
T-410    Saw         31
```

- 选项：
  - A. T-100
  - B. T-220
  - C. T-315
  - D. T-410
- 标准答案：`B`
- 测试能力：读取页面表格并比较数值

### Q07 单页检索 + 规则理解

- 类型：`single_choice`
- 依赖页面：`GET /materials/policy/shipping-v1`
- 题面：访问规则页 `/materials/policy/shipping-v1`。重量不超过 2kg 且订单金额不低于 100 元时，应使用哪种配送方式？
- 页面内容建议：

```text
Shipping Rules
1. If weight <= 2kg and order total >= 100, use EXPRESS-LITE.
2. If weight <= 2kg and order total < 100, use STANDARD-S.
3. If weight > 2kg, use HEAVY-X.
```

- 选项：
  - A. STANDARD-S
  - B. HEAVY-X
  - C. EXPRESS-LITE
  - D. PICKUP
- 标准答案：`C`
- 测试能力：读取规则并套用条件

### Q08 多跳检索

- 类型：`exact_text`
- 依赖页面：
  - `GET /materials/projects/aurora`
  - `GET /materials/people/liam-chen`
- 题面：访问项目页 `/materials/projects/aurora`，找到该项目负责人对应的人物页，再回答此人的员工编号。
- 页面内容建议：

`/materials/projects/aurora`

```text
Project: Aurora
Owner: Liam Chen
Status: Active
```

`/materials/people/liam-chen`

```text
Name: Liam Chen
Employee ID: EC-4182
Department: Research
```

- 标准答案：`EC-4182`
- 测试能力：跨页面跳转、多步信息定位

### Q09 站内搜索

- 类型：`exact_text`
- 依赖接口：`GET /search?q=blue+harbor`
- 题面：使用站内搜索接口搜索 `blue harbor`，打开最相关结果页，回答其中记录的档案编号。
- 搜索结果建议唯一命中到 `/materials/archive/blue-harbor-note`
- 页面内容建议：

```text
Archive Title: Blue Harbor Note
Archive Code: AH-9037
```

- 标准答案：`AH-9037`
- 测试能力：主动调用搜索接口、打开结果、抽取字段

### Q10 API 检索 + 简单计算

- 类型：`integer`
- 依赖接口：`GET /api/data/warehouse-a`
- 题面：访问接口 `/api/data/warehouse-a`。返回数据中 `in_stock` 最大的商品库存数量是多少？
- 接口返回建议：

```json
{
  "items": [
    {"sku": "W-01", "in_stock": 14},
    {"sku": "W-02", "in_stock": 22},
    {"sku": "W-03", "in_stock": 19}
  ]
}
```

- 标准答案：`22`
- 测试能力：API 请求、JSON 解析、数值比较

## 6. 为什么这套题适合作为第一关

### 6.1 稳定

所有答案都是固定的，不依赖实时互联网，不依赖模型是否“背过知识点”。

### 6.2 能区分 agent 和 chat model

- 普通聊天模型通常能做对 Q01-Q04
- 真正会主动请求页面 / API 的 agent 才更容易做对 Q05-Q10

也就是说，这套题虽然简单，但已经开始测“是否会用工具”而不只是“会不会聊天”。

### 6.3 便于自动化评测

- 输出短
- 判分简单
- 可以记录请求轨迹
- 可以统计每题耗时、请求次数、是否走错页面

## 7. 第二阶段怎么升级

如果第一关跑通，后面可以升级成更像 BrowseComp/GAIA 的题：

- 从“单页找答案”升级成“2 到 4 跳的反向检索”
- 从“直接字段提取”升级成“字段筛选后再计算”
- 从“固定页面 URL”升级成“只给站内搜索入口”
- 从“全部站内数据”升级成“站内 + 少量外网白名单域名”

示例升级方向：

- 根据会议页面找到发言人，再去人物页找入职年份，再算工龄
- 根据产品页找到制造商，再去制造商页找成立日期，输出 `YYYYMMDD`
- 给一个唯一但冷门的描述，让 agent 必须搜索站内知识库后定位正确条目

## 8. 一个关键建议

如果你们真想测“网络搜索”而不是“训练记忆”，最好不要把问题直接写成：

- 某明星生日是什么
- 某著名公司哪年成立
- 某知名人物毕业于哪里

更好的方式是：

1. 你们自己造一个小型信息世界
2. 页面内容对模型是新鲜的、低频的
3. 问题不直接暴露答案字段所在页面
4. 但答案又能被你们稳定验证

这类题最符合“难找、好验”的 benchmark 思路。

## 9. 后续建议

如果你愿意，我下一步可以继续直接帮你补两份内容：

1. 把这 10 题改成一份可直接给前后端联调的 `exam.json`
2. 再补一版 `Level 2` 的 10 题，专门测站内搜索和多跳检索

## 10. 参考 benchmark

- BrowseComp: https://openai.com/index/browsecomp/
- GAIA: https://arxiv.org/abs/2311.12983
- WebArena: https://webarena.dev/og/
