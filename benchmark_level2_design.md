# Agent Benchmark Level 2 设计草案

## 1. 目标

第二关比第一关更强调真实网页访问能力，而不是站内模拟世界。

- 大多数题目需要访问真实网页
- 允许跨两个页面做比较、减法、倍率计算
- 增加几道接近公考资料分析风格的题
- 最终答案仍保持短、硬判分、低歧义

## 2. 题型结构

第二关 10 题按下面思路组织：

- 3 题：外网页技术文档/模型发布页比较
- 4 题：国内技术/官方页面数据检索与计算
- 3 题：国内官方统计/行业数据资料分析

和第一关相比，第二关减少了站内材料页，转而测：

- 会不会访问真实外网页
- 会不会在多个来源之间做对齐比较
- 会不会处理中文官方统计口径
- 会不会完成公考式“资料分析”一步计算

## 3. 题源选择原则

- 外网页优先选择官方发布页、官方文档
- 国内题优先选择官方统计站点、部委网站、官方技术文档
- 答案尽量落为整数或一位小数
- 所有题目记录 `verified_at: 2026-04-24`

## 4. 题目概览

### Q01

- 来源：OpenAI GPT-5 for developers + GPT-4.1
- 类型：`exact_text`
- 能力：跨页面比较 benchmark 分数
- 答案：`23.4`

### Q02

- 来源：OpenAI GPT-5.1 for developers + GPT-5 for developers
- 类型：`exact_text`
- 能力：跨页面比较 tool benchmark 分数
- 答案：`1.1`

### Q03

- 来源：Python `http.server` 文档
- 类型：`integer`
- 能力：读取版本信息并做差
- 答案：`4`

### Q04

- 来源：DeepSeek API Docs + 阿里云百炼 Qwen-Long
- 类型：`integer`
- 能力：跨站点比较上下文长度倍数
- 答案：`10`

### Q05

- 来源：DeepSeek API Docs
- 类型：`integer`
- 能力：读取价格表并算倍率
- 答案：`24`

### Q06

- 来源：阿里云百炼 Qwen-Long
- 类型：`integer`
- 能力：读取上下文长度和最大输出并做减法
- 答案：`9967232`

### Q07

- 来源：Qwen Code Docs
- 类型：`integer`
- 能力：读取配置说明并算倍率
- 答案：`8`

### Q08

- 来源：国家统计局社会消费品零售额页面
- 类型：`exact_text`
- 能力：资料分析式增长率差值计算
- 答案：`1.2`

### Q09

- 来源：国家统计局 2024 统计公报
- 类型：`integer`
- 能力：资料分析式人口结构差值计算
- 答案：`65317`

### Q10

- 来源：国家邮政局 2025 全国邮政工作会议
- 类型：`integer`
- 能力：资料分析式行业数据差值计算
- 答案：`185`

## 5. 为什么更像 Agent Benchmark

- 不再主要依赖站内页面
- 多题需要跨页面核对后再计算
- 中英文网页混合，必须真实打开页面而不是只靠训练记忆
- 资料分析题能拉开“会搜 + 会算 + 会格式化”的差距

## 6. 主要参考页面

- OpenAI GPT-5 for developers: https://openai.com/index/introducing-gpt-5-for-developers/
- OpenAI GPT-5.1 for developers: https://openai.com/index/gpt-5-1-for-developers/
- OpenAI GPT-4.1: https://openai.com/index/gpt-4-1/
- Python http.server: https://docs.python.org/3/library/http.server.html
- DeepSeek API Docs: https://api-docs.deepseek.com/zh-cn/quick_start/pricing/
- 阿里云百炼 Qwen-Long: https://help.aliyun.com/zh/model-studio/long-context-qwen-long
- Qwen Code Docs: https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/
- 国家统计局零售额页面: https://www.stats.gov.cn/zwfwck/sjfb/202501/t20250117_1958327.html
- 国家统计局统计公报: https://www.stats.gov.cn/sj/zxfb/202502/t20250228_1958817.html
- 国家邮政局会议页面: https://www.spb.gov.cn/gjyzj/c204534nvg/202501/d9b9497408c34bc8a027ddcd3b2399e2.shtml
