---
id: ruibot-8-layer-architecture
title: "RuiBot 8 层 Agent 架构：从 Android 平台到自主决策的全栈 AI 工程实践"
date: "2026-05-21"
category: project
tags: ["Android", "Agent", "架构设计", "ReAct", "Tool Use", "Kotlin", "企业级AI"]
summary: "深度解析 RuiBot V3.1 的 8 层分离架构——如何在 Android 嵌入式环境下，用 12 个原生 Tool、6 个 Skill 和 ReAct Agent Loop 构建一个自主决策的企业级 AI 办公助手。"
---

## 引言：为什么是 8 层？

在 AI Agent 工程化的过程中，一个核心矛盾始终存在：**模型能力的边界在扩展，但工程系统的复杂度在爆炸**。当一个 AI 助手需要同时操作日历、发送飞书消息、截屏分析、生成图片、管理定时任务时，如果把所有逻辑堆在一个 `ChatViewModel` 里，代码会迅速退化为不可维护的意大利面条。

RuiBot 是面向展锐 T760 平板的企业级 Android AI 办公助手。在 V1.0 到 V3.0 的演进过程中，我们经历了从"能对话"到"能办事"再到"能自主决策"的三次架构蜕变。V3.1 最终确立了受 Claude Code 启发的 **8 层分离架构**——每一层有精确的职责边界、明确的"是什么"和"不是什么"的定义。

本文将从工程实践的角度，逐层拆解这 8 层架构的设计动机、实现细节和踩坑经验。

## 架构全景

```
┌─────────────────────── RuiBot V3.1 Architecture ───────────────────────┐
│                                                                         │
│  L7  Application   会议助手(4场景) · 悬浮球 App Dock                     │
│      ─────────────────────────────────────────────────────────────────   │
│  L6  Agent         QueryLoop (ReAct 循环，最多 10 步 Tool 调用)          │
│      ─────────────────────────────────────────────────────────────────   │
│  L5  Plugin        JSON manifest 声明 Tool+Skill+App 的打包分发单元      │
│      ─────────────────────────────────────────────────────────────────   │
│  L4  Hook          ToolLifecycleHook (Audit/Metrics) · ProactiveEngine  │
│      ─────────────────────────────────────────────────────────────────   │
│  L3  Memory        ShortTermMemory · LongTermMemory · EncryptedPrefs    │
│      ─────────────────────────────────────────────────────────────────   │
│  L2  Skill         提示词模板，改变模型行为上下文（不是函数调用）           │
│      ─────────────────────────────────────────────────────────────────   │
│  L1  Tool          12 个原生 Tool——模型可调用的无状态函数                 │
│      ─────────────────────────────────────────────────────────────────   │
│  L0  Platform      SystemController · ScreenCapture · CameraCapture     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
        │                    │                    │                    │
   Cloud AI Services     Xunfei ASR          External Apps         Android OS
   MiniMax / DeepSeek    WebSocket           Feishu / Email        Calendar / Settings
   Qwen                  Real-time stream    Browser / WPS         MediaProjection
```

关键设计原则：**依赖只能向下，不能向上；同层不耦合**。L6 Agent 可以调用 L1 Tool，但 L1 Tool 不知道 L6 的存在。这保证了每一层都可以独立测试和替换。

## L0 Platform：被低估的硬件抽象层

L0 是 RuiBot 独有的层级——在桌面端 AI 工具中不需要这一层，但在 Android 嵌入式环境下，它是整个系统的地基。

```kotlin
// platform/SystemController.kt
class SystemController(private val context: Context) {
    fun setBrightness(level: Int) { /* Settings.System.putInt */ }
    fun setVolume(stream: Int, level: Int) { /* AudioManager */ }
    fun toggleWifi(enabled: Boolean) { /* WifiManager */ }
    fun toggleBluetooth(enabled: Boolean) { /* BluetoothAdapter */ }
}
```

L0 的设计哲学是**封装平台差异，暴露统一接口**。展锐 T760 平板的 Android 系统有大量定制化行为（比如 WiFi 开关需要额外的权限申请流程），这些细节全部封装在 L0 内部，上层完全无感。

L0 还包括 `ScreenCapture`（MediaProjection 截屏）和 `CameraCapture`（相机拍照），它们是 L1 `screenshot` Tool 和 `image` Tool 的底层依赖。

## L1 Tool：模型的"手"

Tool 是整个架构中最关键的抽象——它是 AI 模型与物理世界交互的唯一通道。

### Tool 接口设计

```kotlin
interface Tool {
    val id: String                    // LLM function name (snake_case)
    val displayName: String           // 用户可见名称
    val description: String           // LLM 工具描述
    val parametersSchema: JSONObject  // JSON Schema (OpenAI function calling format)
    val timeoutMs: Long               // 超时保护，默认 30s
    val worksOffline: Boolean         // 是否可离线执行

    suspend fun execute(arguments: String): ToolResult

    fun safetyLevel(arguments: String = ""): ToolSafety
}
```

这里有一个重要的设计决策：**`execute` 接收原始 JSON 字符串，而不是反序列化后的对象**。原因有二：
1. Tool 的参数 schema 是动态的（来自 JSON Schema），编译时无法确定类型
2. 避免为每个 Tool 创建独立的 Args data class，减少样板代码

### 安全分级模型

```kotlin
enum class ToolSafety {
    READ_ONLY,  // 静默执行：查询日历、搜索网页
    NOTIFY,     // 执行后 Toast 通知：调音量、生图
    CONFIRM,    // 弹窗确认后执行：发邮件、发飞书
    BLOCK,      // 禁止 LLM 调用：恢复出厂设置
}
```

这个分级模型直接对标 Claude Code 的权限系统。`ToolSafety` 不是静态属性——`safetyLevel(arguments)` 接收参数，同一个 Tool 在不同操作下可以有不同的安全等级。例如 `calendar` Tool 在查询时是 `READ_ONLY`，在创建事件时是 `CONFIRM`。

### ToolExecutor 执行管线

```kotlin
class ToolExecutor(private val quotaService: QuotaService?) {
    suspend fun execute(tool: Tool, arguments: String): ToolResult {
        // Step 1: JSON 校验
        // Step 2: 必填参数检查
        // Step 3a: 安全等级检查（BLOCK 直接拒绝）
        // Step 3b: Hook 链 beforeExecute（审计/熔断）
        // Step 3c: 配额预检（消耗 AI 资源前确认额度）
        // Step 4: 带超时的 execute
        // Step 5: Hook 链 afterExecute（指标采集）
        // Step 6: 配额消耗（仅成功时）
    }
}
```

6 步管线确保了每次 Tool 调用都是**可观测、可审计、可限流**的。

### 12 个原生 Tool

| Tool | 能力 | 安全等级 |
|------|------|---------|
| `calendar` | 查询/创建/删除系统日历事件 | L1/L2 |
| `web` | 联网搜索 + AI 汇总 | L1 |
| `file_read` | PDF/TXT/DOCX 解析 + AI 分析 | L1 |
| `image` | 文生图 / 图片理解 / OCR | L1 |
| `device_control` | 亮度/音量/WiFi/蓝牙控制 | L2 |
| `send_feishu` | 发送飞书消息 | L2 |
| `email` | SMTP 发送邮件 | L2 |
| `excel` | 表格数据处理 | L1 |
| `generate_video` | AI 文生视频 | L1 |
| `audio_generate` | 文字转语音 | L1 |
| `contacts` | 通讯录查询 | L1 |
| `schedule` | 定时任务（Cron）管理 | L1 |

## L2 Skill：不是函数调用，是行为切换

这是最容易被误解的一层。**Skill 不是 Tool 的封装，而是模型行为的上下文覆盖**。

```kotlin
// skill/DeepQA.kt
class DeepQA : PromptOnlySkillProvider {
    override val id = "deep_qa"
    override val capability = AICapability.REASONING  // 切换到 DeepSeek R1
    override val templatePrompt = """
        请进行深度分析，展示完整的推理过程。
        使用思维链（Chain of Thought）方法，逐步推导。
    """
}
```

当用户说"深度分析一下这个算法的时间复杂度"时：
1. `QueryLoop.detectSkillActivation()` 通过正则匹配到 `deep_qa`
2. 将 `AICapability` 从 `CHAT`（MiniMax abab7）切换到 `REASONING`（DeepSeek R1）
3. 将 `templatePrompt` 注入系统 prompt 尾部
4. DeepSeek R1 以推理模式响应，输出思维链

**Skill 的本质是一个 (capability, templatePrompt) 二元组**。它不执行任何操作，只改变 LLM "以什么身份、用什么模型、按什么风格"来回答。

| Skill | 行为改变 | 模型选择 |
|-------|---------|---------|
| `deep_qa` | 推理模式，输出思维链 | DeepSeek R1 |
| `text_process` | 翻译/润色/摘要格式指令 | MiniMax M2.7 |
| `task_plan` | 规划格式（看板/分步） | MiniMax abab7 |
| `meeting` | 会议场景全流程 | MiniMax abab7 |
| `scan_doc` | 文档 OCR + 分析 | MiniMax vision |
| `general_qa` | 默认通用对话（兜底） | MiniMax abab7 |

Skill 路由采用正则模式匹配，未匹配则默认走 `general_qa`。这是一个刻意的设计选择——正则匹配的延迟 <1ms，远低于 LLM 意图分类的延迟。

## L3 Memory：让 AI 记住你

Memory 系统解决的是 LLM 的"失忆症"——每次对话都是无状态的，但用户期望 AI 能记住自己的偏好和历史。

### 双层记忆架构

```kotlin
class MemoryManager(
    private val shortTermDao: ShortTermMemoryDao,   // 短期：最近对话上下文
    private val longTermDao: LongTermMemoryDao,     // 长期：用户偏好和事实
    private val extractor: MemoryExtractor,          // 从对话中提取记忆
    private val conflictChecker: ConflictChecker,    // 检测记忆冲突
    private val retriever: MemoryRetriever,          // RAG 检索
    private val aiSummarizer: MemoryAiSummarizer,    // AI 摘要压缩
)
```

- **短期记忆**：最近 N 轮对话的摘要，存储在 Room DB 中，自动过期
- **长期记忆**：用户偏好（"我喜欢用 Markdown 格式"）、事实（"我的飞书 ID 是 xxx"），通过 `MemoryExtractor` 从对话中自动提取

### 记忆注入策略

记忆不是简单地拼接到 system prompt 里。RuiBot 采用 **G12 策略**——将记忆作为独立的 user message 注入，而非 system prompt 的一部分：

```kotlin
// QueryLoop.kt — 记忆注入
if (memoryProvider != null) {
    val memories = memoryProvider.invoke(context.userInput, context.conversationId)
    val memoryMsg = promptBuilder.buildMemoryContextMessage(memories)
    if (memoryMsg != null) {
        messages.add(memoryMsg)
        messages.add(CloudAIClient.ChatMessage(
            role = "assistant",
            content = "好的，我已了解这些背景信息。"
        ))
    }
}
```

为什么用 user message 而不是 system prompt？因为**系统 prompt 是 prompt cache 的前缀**，如果每次都变（拼入不同的记忆），cache 命中率会暴跌。将记忆作为独立 message 注入，system prompt 保持固定，最大化缓存收益。

### 字段级加密

所有记忆数据在写入 Room DB 前进行字段级加密，读取时解密。清除记忆时执行 `VACUUM`，确保数据无法通过 SQLite 文件恢复。

## L4 Hook：事件驱动的自动化

Hook 是"不需要用户说话就能做事"的层级。

### 三条触发路径

```
定时触发（CronWorker）  →  HookEngine.fire("end_of_day_brief")
日历事件观察           →  HookEngine.fire("pre_meeting_brief", payload)
手动触发（用户按钮）   →  HookEngine.fire("morning_brief")
```

### HookEngine 设计

```kotlin
class HookEngine(
    private val hookRegistry: HookRegistry,
    private val toolLookup: (String) -> Tool?,
    private val outputDispatcher: HookOutputDispatcher,
    private val fireTracker: HookFireTracker,
) {
    suspend fun fire(
        hookId: String,
        payload: Map<String, Any?> = emptyMap(),
        occurrenceKey: String? = null,
    ): Boolean {
        // 1. 查找 Hook 定义
        // 2. 检查静默窗口（防止重复触发）
        // 3. 查找关联的 Tool
        // 4. 合并静态参数 + 动态 payload
        // 5. 通过 ToolExecutor 执行
        // 6. 分发输出（通知栏 / 对话内卡片）
    }
}
```

Hook 的核心设计是**一个 Tool 实现，多条触发路径**。`pre_meeting_brief` Tool 既可以被日历事件触发（30 分钟前自动准备会议情报），也可以被 Cron 触发（每天早上 9 点），还可以被用户手动触发（"立即生成"按钮）。

### ProactiveEngine：主动式 AI

```kotlin
// proactive/MorningBriefWorker.kt — 每天早上 8:30
class MorningBriefWorker : CoroutineWorker() {
    override suspend fun doWork(): Result {
        hookEngine.fire("morning_brief")
        return Result.success()
    }
}
```

三个 Proactive Worker：
- **MorningBriefWorker**：每日晨报（日程 + 天气 + 待办）
- **PreMeetingWorker**：会前 30 分钟情报准备
- **EveningReportWorker**：每日工作日报自动生成

## L5 Plugin：声明式打包分发

Plugin 是 Tool + Skill + Application 的打包单元，通过 JSON manifest 声明：

```json
{
  "id": "office",
  "displayName": "智能办公",
  "version": "1.0",
  "toolRefs": ["calendar", "email", "daily_report", "excel"],
  "skillRefs": ["task_plan"],
  "appRefs": []
}
```

### PluginRegistry

```kotlin
class PluginRegistry {
    private val plugins = mutableMapOf<String, Plugin>()

    fun getAllTools(): List<Tool> = plugins.values.flatMap { it.tools }
    fun getAllSkills(): List<Skill> = plugins.values.flatMap { it.skills }
    fun getAllApps(): List<Application> = plugins.values.flatMap { it.apps }
    fun getAllHooks(): List<Hook> = plugins.values.flatMap { it.hooks }
}
```

`PluginRegistry` 是整个系统的**服务注册中心**。QueryLoop 通过它获取所有可用的 Tool，SkillRouter 通过它查找 Skill，HookEngine 通过它定位 Tool 实现。

10 个 Plugin manifest 按业务域组织：智能办公、通信协作、媒体创作、设备控制、文件处理等。

## L6 Agent：ReAct 循环的心脏

L6 是整个架构的核心——`QueryLoop` 实现了一个完整的 ReAct（Reasoning + Acting）循环。

### 三层意图分类

在进入 ReAct 循环之前，QueryLoop 执行三层意图分类：

```
Tier 1: IntentClassifier — 关键词精确匹配（≤6 字符 + 场景关键词 → HIGH）
Tier 2: IntentClassifier — 关键词 + 动作上下文评分 → HIGH/MEDIUM
Tier 3: LLM fallback — tool_choice 由分类器置信度驱动
```

```kotlin
// QueryLoop.kt — 意图分类
val intentResult = intentClassifier.classify(context.userInput)
when (intentResult.confidence) {
    IntentClassifier.Confidence.HIGH -> {
        toolChoiceOverride = "required"  // 强制 LLM 调用 Tool
    }
    IntentClassifier.Confidence.MEDIUM -> {
        toolChoiceOverride = "required"
    }
    IntentClassifier.Confidence.LOW -> {
        // 软提示，LLM 自主判断
    }
}
```

**关键设计**：HIGH 置信度不再绕过 LLM——LLM 始终是唯一的决策者。分类器只影响 `tool_choice` 参数和工具提示，不替代 LLM 判断。这保证了"L6 路由唯一性"不变量。

### Tool Narrowing：从 18 个到 3 个

MiniMax 的 function calling 在工具数量超过 15 个时延迟会从 1.5s 飙升到 4s。解决方案是**意图驱动的工具裁剪**：

```kotlin
private val TOOL_NARROWING_GROUPS: Map<String, Set<String>> = mapOf(
    "web" to setOf("web", "file_read"),
    "send_feishu" to setOf("send_feishu", "contacts"),
    "email" to setOf("email", "contacts", "file_read"),
    "image" to setOf("image"),
    // ...
)
```

当用户说"搜索最新 AI 动态"时，IntentClassifier 匹配到 `web` Tool，QueryLoop 只发送 `web` + `file_read` 两个 Tool 定义给 LLM，而非全部 18 个。实测：3 个 Tool → 全场景 ≤1500ms。

### ReAct 循环

```kotlin
fun run(context: QueryContext): Flow<QueryEvent> = flow {
    // Step 0: 意图分类 + Skill 检测
    // Step 1: 构建消息（system prompt + memory + history + hint + user）
    // Step 2: ReAct 循环
    for (step in 0 until maxSteps) {
        // 2a. 发送给 LLM（带 Tool 定义）
        // 2b. LLM 返回 → 直接回答 or tool_calls
        // 2c. 无 tool_calls → 最终回答，结束
        // 2d. 有 tool_calls → 安全检查 → 执行 → 结果回传
        // 2e. 循环检测（连续调用同一 Tool ≥2 次 → 注入停止提示）
    }
}
```

### 安全审批通道

对于 CONFIRM 级别的 Tool，QueryLoop 通过 `Channel<Boolean>` 实现异步审批：

```kotlin
val confirmationChannel = Channel<Boolean>(Channel.RENDEZVOUS)

// 发送确认请求
emit(QueryEvent.ConfirmationNeeded(toolId, description))
val confirmed = confirmationChannel.receive()  // 挂起等待
if (confirmed) { /* 执行 */ } else { /* 拒绝 */ }
```

UI 层收到 `ConfirmationNeeded` 事件后弹出确认对话框，用户点击后通过 `confirmationChannel.send(true/false)` 恢复执行。

### 循环检测与查询重注入

两个关键的防护机制：

1. **循环检测**：如果 LLM 连续 2 次调用同一个 Tool，注入系统提示要求直接回答
2. **查询重注入**：Tool 执行完成后，注入"请基于以上工具结果，回答用户的原始问题"，对抗 LLM 的近因偏差

## L7 Application：持续运行的 UI

L7 Application 是与 L1 Tool 的本质区别——**Tool 是 request-response，Application 是持续运行的会话**。

### 会议助手

```
用户: "录音"
→ QueryLoop 匹配关键词 → SceneClarificationNeeded
→ "好的，是什么场景？"
用户: "面试云运维岗"
→ ApplicationLaunchRequired → MeetingRecordActivity
→ 左栏实时转录，右栏 AI 洞察
→ 悬浮球显示录音状态
→ 结束 → 结构化会议纪要
```

### 悬浮球 App Dock

```kotlin
// core/app/AppDockBridge.kt
class AppDockBridge {
    val state: StateFlow<AppDockState>  // 双向 StateFlow 通信
    fun notifyAppStarted(appId: String)
    fun notifyAppStopped(appId: String)
}
```

悬浮球是 App 的 Dock——通过 `AppDockBridge` 的双向 StateFlow 通信，显示运行中 App 的状态和快捷操作。

## 层间交互：一次完整的请求流

用户说"搜索最新 AI 动态然后帮我整理成要点"：

```
Step 0: IntentClassifier → MEDIUM confidence, tool_choice=required
Step 0.5: Skill 检测 → general_qa（无特殊 Skill 匹配）
Step 1: PromptBuilder 构建 system prompt
         L3 Memory 注入用户偏好
         L0 SystemInfo 注入设备状态
Step 2: LLM 返回 tool_call: web("最新AI行业动态")
Step 3: ToolExecutor 执行 web Tool
         L4 Hook: AuditHook 记录审计日志
         L4 Hook: MetricsHook 采集耗时指标
Step 4: ToolResult 返回搜索结果
Step 5: 查询重注入："请基于以上工具结果，回答用户的原始问题"
Step 6: LLM 生成结构化要点摘要
Step 7: 流式输出到 ChatAdapter
```

全程用户只说了一句话，AI 自主完成了 2 步推理。

## 与 Claude Code 的对标

| RuiBot 层 | Claude Code 对应 | 差异点 |
|-----------|-----------------|--------|
| L0 Platform | — (桌面环境无需) | RuiBot 独有，Android 硬件适配 |
| L1 Tool | Bash, Read, Write, Edit, Grep | RuiBot 面向办公场景（日历/飞书/邮件） |
| L2 Skill | /commit, /review-pr, /simplify | 同为提示词模板，RuiBot 增加了模型切换 |
| L3 Memory | CLAUDE.md, memory files | RuiBot 有短期/长期双层 + 字段级加密 |
| L4 Hook | pre-commit hooks, shell hooks | RuiBot 增加了 Cron 定时触发 |
| L5 Plugin | marketplace plugins | RuiBot 用 JSON manifest 声明式打包 |
| L6 Agent | sub-agent (Explore, Plan) | RuiBot 单线程 ReAct，Claude Code 多 agent |
| L7 Application | Artifacts (富交互区域) | RuiBot 是全屏 Activity，Claude Code 是内联 |

## 性能实测

| 指标 | PRD 基线 | V3.1 实测 | 状态 |
|------|---------|----------|------|
| 冷启动 | ≤2000ms | **1399ms** | ✅ |
| 内存占用 | ≤400MB | **82MB** PSS | ✅ |
| APK 体积 | ≤30MB | **9.8MB** | ✅ |
| 首字响应 | ≤1500ms | **≤1500ms** (3 tools) | ✅ |
| API 通过率 | — | **97%** (30/31) | ✅ |

## 工程教训

### 1. Tool Hint 补偿弱模型

MiniMax 的 function calling 能力较弱，经常忽略应该调用的 Tool。解决方案是在 QueryLoop 中增加 **Tool Hint**——通过正则匹配用户输入，在 user message 中注入"你可能需要使用以下工具"的提示。

### 2. Prompt Cache 是性能命脉

System prompt 的固定前缀（角色定义 + 工具描述）占 token 数的 60%。通过将记忆、Skill 上下文作为独立 message 注入（而非拼入 system prompt），prompt cache 命中率从 40% 提升到 85%。

### 3. 安全分级不能是静态的

同一个 Tool（如 `calendar`）在不同操作下需要不同的安全等级。`safetyLevel(arguments)` 的设计允许 Tool 根据具体参数动态决定安全等级。

### 4. 循环检测是必须的

LLM 在 ReAct 循环中会陷入"工具调用死循环"——反复调用同一个 Tool 而不给出最终答案。循环检测 + 停止提示注入是必要的防护机制。

## 总结

RuiBot 的 8 层架构不是过度设计——它是 Android 嵌入式环境下 AI Agent 工程化的必然结果。每一层解决一个明确的问题：

- **L0** 解决平台差异
- **L1** 解决 AI 与物理世界的交互
- **L2** 解决模型行为的动态切换
- **L3** 解决 LLM 的失忆症
- **L4** 解决事件驱动的自动化
- **L5** 解决能力的打包分发
- **L6** 解决自主决策循环
- **L7** 解决持续运行的 UI 会话

层间依赖严格向下，同层零耦合。这使得每一层都可以独立测试、独立替换、独立演进。当未来需要接入新的 AI 模型、新的 Tool、新的触发方式时，只需要在对应层级做修改，不会波及其他层。

这就是 8 层架构的工程价值——**不是让系统更复杂，而是让复杂度可管理**。
