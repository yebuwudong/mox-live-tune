/**
 * mox.live 静态资源长缓存
 * 适用：/build/assets/*（文件名自带 contenthash，天然可长缓存）
 * 实测问题：服务端只给 max-age=43200（12 小时），且带 ETag，导致频繁 304 协商
 * 本脚本只改写响应头，不动任何内容
 */
const headers = $response.headers || {};

// 大小写不敏感地删除头字段
function del(name) {
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === name) delete headers[k];
  }
}

del('cache-control');
del('expires');
del('etag');
del('last-modified');
del('pragma');

headers['Cache-Control'] = 'public, max-age=31536000, immutable';
headers['Expires'] = new Date(Date.now() + 31536000000).toUTCString();

$done({ headers: headers });
