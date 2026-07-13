---
id: mobile-automation-appium-adb-test-engineering
title: "移动端自动化测试实践：Appium、ADB 脚本与测试工程化"
date: "2026-05-28"
category: aillm项目实践
tags: ["Appium", "ADB", "移动端自动化", "测试工程化", "RuiBot", "AI Agent"]
summary: "结合 RuiBot 测试工程实践，梳理 Appium、ADB 脚本、Jest/API、Agent 能力测试、报告生成和协同闭环在移动端 AI 产品质量保障中的分层定位。"
---

## 引言：从“我也能写脚本抓 UI”开始

最近在做 RuiBot 的测试工程化时，我对 Appium 有了一个更清晰的认识。

一开始我也有一个很自然的疑问：既然我可以自己写脚本抓 UI、点按钮、输入文本、截图，那为什么还要单独引入 Appium？比如 Android 本身就有 ADB，可以执行点击、输入、截图、拉日志，也可以通过 `uiautomator dump` 把当前页面的 UI 层级导出来。看起来，只要我愿意写脚本，似乎也能完成移动端 UI 自动化。

但真正把它放到一个需要长期维护、反复回归、能沉淀报告、能和开发协同的测试体系里，我发现问题不再是“能不能点一下按钮”，而是：

- 能不能稳定地定位元素？
- 能不能可靠地等待页面变化？
- 能不能在失败时自动截图和记录原因？
- 能不能把测试结果沉淀成报告？
- 能不能让这套测试流程长期复用，而不是一次性脚本？

这篇文章结合我当前的 RuiBot 测试工程实践，梳理我对 Appium、ADB 脚本和测试工程化的理解。

## RuiBot 测试工程的整体背景

RuiBot 不是一个单纯的普通 App，它是一个移动端 AI Agent 产品。它既有 Android UI，又有后台接口，也有 AI Agent 的意图识别、Tool 调用、多轮上下文、安全边界等能力。

所以它的测试不能只靠一种手段完成。我现在更倾向于把测试分成几层：

```text
API / Jest 测试
→ 验证后台接口、状态码、返回字段、鉴权、订阅、配额、聊天接口

Agent 能力测试
→ 验证意图识别、工具调用、多轮上下文、安全边界、复杂任务处理

Appium UI 测试
→ 验证真实 Android App 上的启动、输入、点击、弹窗、页面展示和端到端路径

ADB 辅助脚本
→ 负责安装 APK、清理数据、端口转发、截图、日志采集、环境准备

测试报告与协同闭环
→ 生成 report.json / report.html，记录失败现场，支持回归和开发协同
```

这套体系的核心目标不是“跑几个测试命令”，而是让测试执行标准化、结果可视化、问题可追踪、经验可沉淀。

## 移动端自动化测试到底在测什么

移动端自动化测试和接口测试最大的区别是：它站在真实用户使用 App 的角度验证路径是否可用。

比如测试“发送一条消息”，接口测试可能只关心：

```text
POST /api/chat 是否返回 200
content 是否不为空
usage 字段是否存在
remaining 配额是否正确
```

但 Appium UI 测试关心的是另一条链路：

```text
打开 App
→ 等待主界面加载
→ 找到输入框
→ 输入文本
→ 检查发送按钮是否从语音切换为发送
→ 点击发送
→ 检查用户消息是否出现在列表
→ 等待机器人回复
→ 检查机器人消息是否展示
→ 失败时截图并生成报告
```

这类测试能发现接口测试发现不了的问题，例如：

- 接口返回正常，但 UI 没有刷新；
- 按钮状态没有切换；
- 输入框被键盘遮挡；
- 弹窗阻塞了主流程；
- RecyclerView 没有滚动到底部；
- App 卡顿、崩溃或页面白屏。

所以我对 Appium 的定位是：它不是替代 API 测试，而是补足真实用户路径验证。

## ADB 脚本能做什么

ADB 是 Android Debug Bridge，它非常适合做底层设备操作和环境准备。很多简单动作，用 ADB 就可以完成。

常见命令包括：

```bash
adb devices
adb install app.apk
adb shell pm clear com.example.app
adb shell input tap 500 1200
adb shell input text "hello"
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
adb shell uiautomator dump /sdcard/window.xml
adb logcat
adb forward tcp:8080 tcp:8080
```

这些能力在测试工程中很有价值，尤其适合：

- 安装或卸载 APK；
- 清理 App 数据；
- 配置端口转发；
- 拉取日志；
- 截图留证；
- 快速执行一次性操作；
- 辅助排查设备和环境问题。

在 RuiBot 的 Agent 测试里，端口转发就是一个典型场景。Agent 内部服务需要通过本地端口访问，如果 ADB 转发没有配置好，测试会直接失败。因此 ADB 很适合承担“环境准备”和“故障辅助诊断”的角色。

## ADB 脚本的局限

ADB 很强，但它不是完整的 UI 测试框架。当测试从“一次性操作”变成“长期回归用例”时，单纯依赖 ADB 脚本会遇到几个明显问题。

### 1. 容易依赖坐标点击

最直接的 ADB 点击方式是：

```bash
adb shell input tap 500 1200
```

这种方式很脆弱。只要设备分辨率、系统字体、状态栏高度、键盘弹出状态、页面布局有变化，坐标就可能失效。

而长期维护的 UI 测试更应该基于元素定位，而不是固定坐标。

### 2. 等待机制不稳定

很多自写脚本会使用：

```bash
sleep 3
```

但 UI 自动化里最难的往往不是点击，而是等待：

- 页面什么时候加载完成？
- 动画什么时候结束？
- AI 回复什么时候出现？
- 弹窗什么时候消失？
- 弱网情况下要等多久？

固定 sleep 的问题是：等短了容易失败，等长了浪费时间，环境慢一点仍然不稳定。

### 3. UI 层级解析成本高

ADB 可以导出 UI 层级：

```bash
adb shell uiautomator dump /sdcard/window.xml
```

但接下来就需要自己解析 XML，查找 `resource-id`、`text`、`content-desc`、`bounds`，再计算坐标并点击。复杂页面、重复元素、动态列表、弹窗都会让脚本越来越难维护。

### 4. 报告和失败留证要自己实现

真正的测试不是执行命令结束，而是要记录：

- 哪条用例执行了；
- 通过还是失败；
- 失败原因是什么；
- 耗时是多少；
- 当时页面截图是什么；
- 结果能否给开发复现和回归。

如果这些都自己写，ADB 脚本会逐渐演变成一个简化版测试框架。

因此我现在的理解是：ADB 适合做设备操作自动化，不适合独立承担长期维护的 UI 测试工程。

## Appium 是什么

Appium 是一个移动端 UI 自动化测试框架。它可以通过 WebDriver 协议控制 Android 或 iOS 设备，在真实 App 上执行点击、输入、滑动、截图、读取元素属性等操作。

它的链路可以理解为：

```text
测试脚本
→ Appium Client
→ Appium Server
→ Android UiAutomator2 / iOS XCUITest
→ 真机或模拟器
→ 被测 App
```

这里有几个容易误解的点：

- Appium 不是某一种脚本语言；
- Appium 不主动替我们写测试逻辑；
- 测试脚本仍然是我们自己写、自己运行；
- Appium Server 是中间层，负责把脚本指令转成设备自动化操作。

比如测试脚本可以用 JavaScript、Python、Java、C# 编写。在我的 RuiBot 测试工程里，Appium 脚本使用的是 JavaScript / Node.js，因为整个测试套件本身就是 npm、Jest、Node.js 和自定义报告系统组织起来的。

## Appium 是如何工作的

以 JavaScript + WebdriverIO 为例，一段 Appium 测试大概是这样：

```js
const { remote } = require("webdriverio")

const driver = await remote({
  hostname: "localhost",
  port: 4723,
  capabilities: {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android",
    "appium:appPackage": "com.example.app",
    "appium:appActivity": ".MainActivity"
  }
})

const input = await driver.$(
  'android=new UiSelector().resourceId("com.example.app:id/input_message")'
)

await input.waitForDisplayed({ timeout: 10000 })
await input.setValue("你好")

const sendBtn = await driver.$(
  'android=new UiSelector().resourceId("com.example.app:id/btn_send")'
)

await sendBtn.click()
```

这段代码不是直接调用后端接口，而是在真实 Android 设备上找到输入框、输入文字、点击发送按钮。

Appium 的测试过程可以概括为：

```text
操作
→ 观察
→ 断言
→ 记录结果
```

例如：

```text
操作：输入“你好”并点击发送
观察：页面是否出现机器人消息
断言：机器人消息在指定时间内可见
记录：通过则写 PASS，失败则截图并写入报告
```

## 为什么不是只用自写脚本

理论上，我当然可以用 ADB 自己写脚本完成一部分 UI 自动化。但问题是，随着测试用例增多，我需要自己解决一系列框架级问题。

Appium 的价值就在于，它已经把这些通用问题封装好了。

| 对比项 | ADB / 自写 UI 脚本 | Appium |
|---|---|---|
| 定位方式 | 常见是坐标或手动解析 XML | 元素级定位 |
| 等待机制 | sleep 或手写轮询 | 显式等待 |
| 属性读取 | 自己解析 UI 层级 | getAttribute / isDisplayed |
| 点击输入 | 命令式操作 | WebDriver 元素操作 |
| 截图 | adb screencap | saveScreenshot |
| 报告 | 自己实现 | 易于接入测试框架和自定义报告 |
| 稳定性 | 容易受设备和布局影响 | 更适合长期维护 |
| 适合场景 | 一次性操作、环境准备 | 冒烟测试、UI 回归、端到端路径 |

所以我现在会这样分工：

```text
ADB：负责设备管理、环境准备、日志和一次性辅助操作。
Appium：负责真实 App 上的核心路径验证和 UI 回归。
Jest/API：负责后台接口、边界、鉴权、配额、状态码。
Agent 测试：负责 AI 意图识别、Tool 调用、多轮上下文和安全边界。
```

## RuiBot 中的 Appium 实践

在 RuiBot 的测试工程里，Appium 主要用来覆盖真实 App 的关键路径。

比如冒烟测试会检查：

```text
1. Appium 会话是否能建立；
2. App 是否能正常启动；
3. 主界面输入框是否出现；
4. 输入文本后发送按钮是否切换；
5. 是否能保存截图；
6. 附件面板是否能弹出；
7. 测试结束后是否生成 report.json 和 report.html。
```

全量 UI 测试则更偏向回归：

```text
启动流程
聊天流程
多轮对话
工具入口
账户页面
异常提示
会议/录音弹窗
性能体验
失败截图
```

这些测试的价值在于，它们不是验证某个函数返回值，而是验证用户在真实 App 上能否完成路径。

## 测试报告：从终端输出到可追踪资产

测试工程化里很重要的一点是：测试结果不能只停留在终端输出。

在 RuiBot 测试工程中，我把测试结果沉淀成两种报告：

```text
report.json
→ 结构化数据，适合后续 dashboard、CI 或自动化分析消费

report.html
→ 可视化报告，适合人工查看、复盘、提交给开发定位问题
```

Appium 测试本身已经有报告能力，后来我又补齐了 Jest 测试报告，让 `test:server` 和 `test:agent` 也能生成统一的 JSON 和 HTML 报告。

这样服务端测试、Agent 测试和 Appium UI 测试可以形成统一的报告体系：

```text
测试执行
→ 记录每条用例结果
→ 失败时保留错误信息
→ 必要时截图
→ 生成 report.json
→ 生成 report.html
→ 支持回归和协同
```

这对测试协同很重要。因为问题不再只是“我在终端看到失败了”，而是可以把报告路径、失败用例、错误信息、截图一起提供给开发，后续也能复盘。

## 不只是功能测试：性能、安全、敏感信息和边界

对于 AI Agent 产品来说，测试不能只验证正常路径是否能跑通，还要关注性能、安全、敏感信息和边界条件。

### 性能

性能测试不只是看“快不快”，而是看链路中每一段是否稳定：

```text
用户输入
→ UI 响应
→ 意图识别
→ Tool 调用
→ 后台接口
→ AI 回复
→ 页面渲染
```

需要关注：

- 普通接口响应时间；
- AI 首响时间；
- 完整回复耗时；
- 多轮对话后是否变慢；
- App 页面是否卡顿；
- 长时间自动化运行是否稳定。

### 安全

安全测试要重点关注：

- 无 token 是否拒绝；
- 伪造 token 是否拒绝；
- A 用户能否访问 B 用户数据；
- 普通用户能否访问会员接口；
- 异常输入是否返回合理 4xx，而不是 500；
- 错误信息是否暴露内部堆栈或敏感字段。

### AI Agent 安全边界

AI Agent 还要额外关注：

- Prompt Injection；
- 越狱诱导；
- 多轮上下文污染；
- Tool 误调用；
- 信息不足时是否会追问；
- 危险操作是否需要确认；
- 不同用户的数据是否隔离。

比如用户只说“帮我取消”，Agent 不应该直接取消日程，而应该先确认取消对象。

### 敏感信息

敏感信息包括：

```text
手机号
token
验证码
订单信息
订阅状态
用户 ID
聊天记录
设备信息
```

测试时要检查：

- 日志是否明文打印 token 或验证码；
- 接口错误是否泄露堆栈；
- AI 回复是否暴露系统提示词；
- 不同用户的历史对话是否串号；
- 手机号、token 是否做了必要脱敏。

### 边界场景

边界测试包括：

```text
空输入
超长输入
乱码
多语言混合
emoji
重复提交
配额刚好为 0
订阅刚好过期
Tool 超时
网络失败
ADB 断开
Appium 会话断开
```

这些场景的目标不是让系统永远不失败，而是让系统在失败时可控、可解释、不崩溃、不误执行。

## 测试协同闭环

测试工程化最终要服务于协同。

我现在更倾向于把问题流转成一个闭环：

```text
发现问题
→ 形成测试记录或测试批次
→ 附上 report.html / report.json / 截图 / bug 小结
→ 开发修复
→ 获取修复版本
→ 回归验证
→ 通过或打回
→ 归档沉淀
```

这样做的好处是：

- 问题不会散落在聊天记录里；
- 每次修复都有对应验证依据；
- 回归结果可以追踪；
- 测试经验可以复用；
- 后续新人也能理解历史问题和验证方式。

这也是我理解的测试工程化：它不只是跑自动化脚本，而是把测试执行、结果记录、问题反馈和回归验收组织成一套持续运转的流程。

## 我的最终理解

经过这段实践，我对 ADB、Appium 和测试工程化的定位更加清楚了。

```text
ADB 解决的是：我能不能操作设备。
Appium 解决的是：我能不能稳定验证真实 App 的 UI 路径。
Jest/API 解决的是：我能不能快速验证后台逻辑和边界条件。
Agent 测试解决的是：我能不能验证 AI 的理解、调用和安全边界。
测试报告解决的是：结果能不能留痕、复盘和协同。
测试工程化解决的是：这些能力能不能长期复用和沉淀。
```

如果只是临时点一下按钮，ADB 脚本足够。如果要长期验证真实 App 的核心路径，Appium 更合适。如果要保障整个 AI Agent 产品质量，就需要 API、Agent、UI、报告和协同流程一起工作。

所以我现在不会把 Appium 看成“另一种写脚本的方式”，而是把它看作移动端 UI 自动化工程化中的关键一层。

## 总结

移动端自动化的目标不是让手机自动点几下，而是让产品质量可以被持续、稳定、可追踪地验证。

ADB 脚本提供底层设备控制能力，Appium 提供标准化 UI 自动化能力，Jest/API 测试提供快速接口验证，Agent 测试覆盖 AI 产品特有的能力边界，而报告和协同流程让这些结果真正变成项目资产。

对我来说，这次实践最大的收获是：测试不是单点动作，而是一套工程系统。只有把工具、脚本、报告、用例、边界场景和协同流程串起来，测试才会从“临时验证”变成“技术沉淀”。
