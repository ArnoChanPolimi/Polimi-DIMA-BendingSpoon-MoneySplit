 core/ – 核心业务逻辑（纯 TypeScript）

本目录包含与“AA 记账”相关的 **领域模型和纯函数**。

核心目标：

- 所有这里的函数都满足：
  - **输入 → 输出**，没有副作用；
  - 不访问网络、不访问存储、不依赖 React Native；
  - 任意测试环境下都能直接调用和单元测试。

---

## v1 阶段计划模块

- `core/models/`
  - 定义核心数据结构：
    - `User`
    - `Ledger`（账本）
    - `Expense`（消费）
    - `Balance`（每个人的余额摘要）

- `core/usecases/`
  - 面向场景的纯函数：
    - `addExpense(ledger, expenseInput) -> updatedLedger`
    - `calculateBalances(ledger) -> Balance[]`
  - 不关心数据如何被保存或展示，只负责：
    - 校验输入；
    - 调用领域内算法；
    - 返回新的数据结构。

- `core/algorithms/`
  - 存放具体的计算算法：
    - v1：简单均分算法；
    - v2：不均分、自定义比例；
    - v3：债务简化（最少转账次序）。

---

## 与其他模块的关系

- 上层 UI 会：
  - 从 `services` 获取一个 `Ledger` 对象；
  - 调用 `core/usecases` 中的函数；
  - 将返回的结果渲染出来。

- `core` 不调用 `services`，只依赖：
  - 自身的 `models`、`algorithms`；
  - 可选的 `logging`/`utils`（如果需要记录调试信息）。

> 简单记忆：  
> - **core 就是“数学大脑”**：给你一盘账，算出每人该出多少钱。  
> - 它不关心“这个账从哪来”“算完给谁看”“结果存到哪去”。