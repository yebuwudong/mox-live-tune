/**
 * mox.live 外观改写 —— Surge http-response 脚本
 *
 * 原理：站点是 Inertia + Vue 的 SPA，首页/帖子页首次返回的是完整 HTML 文档。
 *      本脚本在该 HTML 的 </head> 前插入一段 <style>，由浏览器解析执行。
 *      注意：Surge 脚本引擎没有 document / window，不能写浏览器 DOM 代码。
 *
 * 配色全部走站点自带的 --mx-* 变量体系（实测自 purify-BLSZtWZ3.css）：
 *   :root      { --mx-bg: 242 243 245; --mx-surface: 255 255 255; ... }
 *   :root.dark { --mx-bg: 15 17 21;   --mx-surface: 24 27 33;  ... }
 * 值是 RGB 三元组，必须写成 rgb(var(--mx-x) / alpha)，不能写 hex。
 * 因此本样式跟随站点自带的明暗切换，不会破坏它的主题逻辑。
 */

const CSS = `
/* ===== 1. 配色：只换色板，沿用站点变量体系 ===== */
:root {
  --mx-bg: 244 245 247;
  --mx-surface: 255 255 255;
  --mx-line: 226 229 233;
  --mx-soft: 247 248 250;
  --mx-hover: 236 244 252;
  --mx-ink: 33 37 41;
  --mx-ink-2: 85 92 100;
  --mx-ink-3: 116 124 133;
  --mx-ink-4: 156 163 170;
  --mx-accent: 45 140 205;
  --mx-accent-hover: 22 120 190;
  --mx-link: 22 110 160;
  --mx-radius-sm: 6px;
  --mx-radius: 10px;
  --el-color-primary: #2d8ccd;
  --el-border-radius-base: 8px;
}
:root[class~=dark] {
  --mx-bg: 14 16 20;
  --mx-surface: 23 26 32;
  --mx-line: 42 47 56;
  --mx-soft: 31 35 43;
  --mx-hover: 28 42 58;
  --mx-ink: 200 206 214;
  --mx-ink-2: 156 164 174;
  --mx-ink-3: 126 134 145;
  --mx-ink-4: 102 110 121;
  --mx-accent: 74 164 224;
  --mx-accent-hover: 108 186 240;
  --mx-link: 118 188 238;
  --el-color-primary: #4aa4e0;
}

/* ===== 2. 阅读体验 ===== */
body {
  font-size: 15px;
  line-height: 1.7;
  letter-spacing: .01em;
  -webkit-font-smoothing: antialiased;
}
.contents, .notify { line-height: 1.8; word-break: break-word; }
.contents p { margin: .6em 0; }

/* ===== 3. 卡片圆角与投影 ===== */
.mx-card {
  border-radius: var(--mx-radius);
  box-shadow: 0 1px 2px rgb(0 0 0 / .04), 0 2px 8px rgb(0 0 0 / .03);
  transition: box-shadow .2s ease, border-color .2s ease;
}
:root[class~=dark] .mx-card {
  box-shadow: 0 1px 2px rgb(0 0 0 / .30), 0 2px 10px rgb(0 0 0 / .25);
}
.mx-card:hover { box-shadow: 0 2px 6px rgb(0 0 0 / .07), 0 6px 18px rgb(0 0 0 / .06); }
.mx-card-head { padding: .65rem .85rem; font-weight: 600; }

/* ===== 4. 图片不撑破屏幕 ===== */
.contents img, .notify img { max-width: 100%; height: auto; border-radius: 8px; }
.el-image-viewer__wrapper img { max-width: none; }

/* ===== 5. 导航与按钮 ===== */
.mx-nav-link, .mx-nav-on { font-weight: 600; letter-spacing: .01em; }
.mx-btn { border-radius: 8px; transition: transform .12s ease, opacity .12s ease; }
.mx-btn:active { transform: scale(.97); }

/* ===== 6. 滚动条 ===== */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: rgb(var(--mx-ink-4) / .45); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
`;

const MARK = '<style id="mx-custom-theme" data-source="surge-module">';

try {
  let body = $response.body || '';

  // 只处理 HTML 文档；接口 JSON 直接放行
  const isHtml = /<html[\s>]/i.test(body) || /<\/head>/i.test(body);
  if (!isHtml) {
    $done({});
  } else if (body.indexOf('mx-custom-theme') !== -1) {
    // 已注入过，避免重复
    $done({});
  } else {
    const tag = MARK + CSS + '</style>';
    if (/<\/head>/i.test(body)) {
      body = body.replace(/<\/head>/i, tag + '</head>');
    } else if (/<\/body>/i.test(body)) {
      body = body.replace(/<\/body>/i, tag + '</body>');
    } else {
      body = tag + body;
    }

    // 注入后长度变了，必须剔除 content-length，否则响应体被截断
    const headers = $response.headers || {};
    for (const k of Object.keys(headers)) {
      const lk = k.toLowerCase();
      if (lk === 'content-length' || lk === 'content-encoding') delete headers[k];
    }

    console.log('[mox-theme] 已注入外观样式，HTML ' + body.length + ' 字节');
    $done({ body: body, headers: headers });
  }
} catch (e) {
  console.log('[mox-theme] 注入失败: ' + e);
  $done({});
}
