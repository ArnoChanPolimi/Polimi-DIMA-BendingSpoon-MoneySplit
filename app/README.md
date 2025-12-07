# app/ – 前端页面 & 路由

这里放 **所有页面（Screens）和路由文件**。

当前计划页面：

- `app/(tabs)/index.tsx` – HomeScreen（首页）
- `app/(tabs)/ledgers.tsx` – LedgerListScreen（账本列表页）
- `app/(tabs)/settings.tsx` – SettingsScreen（设置/关于页）
- `app/ledger/[id].tsx` – LedgerDetailScreen（账本详情页）

约定：

- 页面只负责：
  - 显示界面（布局、文案、按钮）
  - 处理用户点击、跳转
  - 将来调用业务逻辑和数据接口（core / services）
- 页面不负责：
  - 写结算算法
  - 直接操作数据库
  - 写日志系统