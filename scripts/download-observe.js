/**
 * mox.live 附件下载 —— 只读观测，绝不改写
 *
 * 实测响应结构（tid=650604&aid=3932020 实抓）：
 *   {"status":"success","success":true,"data":{"sev":null,"is_paid":false,
 *    "type":"text","source":"new",
 *    "temporary_link":"https://mox.live/api/forum/attachments/download-file",
 *    "filename":"","raw_name":""}}
 *
 * 本脚本仅把服务端返回的原始判断打到日志，便于核对接口行为。
 * 不对 is_paid / sev / filename / temporary_link 做任何修改。
 */
try {
  const body = JSON.parse($response.body || '{}');
  const d = body.data || {};
  const tid = ($request.url.match(/[?&]tid=(\d+)/) || [])[1] || '?';
  const aid = ($request.url.match(/[?&]aid=(\d+)/) || [])[1] || '?';

  const name = d.filename || d.raw_name || '(空)';
  console.log(
    `[mox] 下载接口 tid=${tid} aid=${aid} ` +
    `success=${body.success} is_paid=${d.is_paid} type=${d.type} 文件名=${name}`
  );
} catch (e) {
  console.log('[mox] 下载接口返回非 JSON，跳过观测');
}

$done({});
