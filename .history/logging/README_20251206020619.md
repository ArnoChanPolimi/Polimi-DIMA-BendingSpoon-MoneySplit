负责：

提供一个统一的 Logger 接口（info / error），
方便你在 UI、core、services 任何地方记日志。

不负责：

不写业务逻辑。

不控制数据流。

README 大纲：

用来统一处理日志输出（开发期先用 console，后期可接远程服务）。

让核心逻辑可以在不依赖 console 的情况下记录调试信息。

core 可以依赖 logging，但 logging 不依赖 core。