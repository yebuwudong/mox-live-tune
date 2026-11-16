/**
 * mox.live API 短缓存 + 限流观测
 * 适用：/api/forum/landing、/api/forum/thread/{tid}、/api/forum/thread/{tid}/posts
 *
 * 实测问题：
 *   1. 这些接口统一返回 cache-control: no-cache, private
 *      landing 单次 41KB(gzip)，每次进页面都全量重取
 *   2. 服务端有 x-ratelimit-limit: 30（每分钟），撞限流会直接失败
 *
 * 本脚本只放宽浏览器本地缓存时长并把余量写进日志，不改响应体、不改业务字段
 */
const url = $request.url || '';
const headers = $response.headers || {};

// landing 走 2 分钟，帖子内容 60 秒 —— 足够覆盖"返回列表再点进去"这种重复访问
const ttl = /\/api\/forum\/landing/.test(url) ? 120 : 60;

for (const k of Object.keys(headers)) {
  if (k.toLowerCase() === 'cache-control') delete headers[k];
}
headers['Cache-Control'] = `private, max-age=${ttl}`;

// 把限流余量打出来，方便判断模块是否真的减少了请求
const get = (n) => {
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === n) return headers[k];
  }
  return undefined;
};
const remain = get('x-ratelimit-remaining');
const limit = get('x-ratelimit-limit');

if (remain !== undefined) {
  const path = url.split('/api')[1] ? '/api' + url.split('/api')[1].split('?')[0] : url;
  console.log(`[mox] ${path} -> 限流余量 ${remain}/${limit || '?'} 缓存 ${ttl}s`);
}

$done({ headers: headers });
