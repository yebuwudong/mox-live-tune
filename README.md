# mox.live 论坛优化模块 (Surge)

## 安装

```
surge:///install-module?url=https://raw.githubusercontent.com/yebuwudong/mox-live-tune/main/mox-live-tune.sgmodule
```

## 做了什么

| 优化 | 依据 |
|---|---|
| `/build/assets/*` 强制一年 immutable 缓存 | 原生只给 `max-age=43200` 且带 ETag，12h 后必重新协商；文件名带 contenthash |
| `/api/forum/landing` 缓存 120s | 单次 41,215 B (gzip)，原 `no-cache, private` |
| `/api/forum/thread/{tid}`、`/posts` 缓存 60s | 每次进页面全量重取 |
| 限流余量写入日志 | 服务端 `x-ratelimit-limit: 30` |
| 下载接口只读观测 | 打印 `is_paid` / `filename`，不改写 |

## 刻意不做

- **不设 DIRECT 分流**：实测 `mox.live` 直连超时（走规则才 200），强制直连会断流。
- **不改写头像 301**：该 301 是"用户无头像"落占位图，统一重写会覆盖真实头像。
- **不裁剪 URL 参数**：页面链接参与前端路由状态。
- **不修改任何权限/付费字段**。

## 回滚

在 Surge 中关闭或删除 `mox.live 论坛优化` 模块即可，本模块未改动 profile 任何原有配置。
