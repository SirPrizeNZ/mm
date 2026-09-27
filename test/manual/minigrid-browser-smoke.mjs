/** Run with node test/manual/minigrid-browser-smoke.mjs [2|4|10]. Requires Edge on Windows. */
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { start } from '../../server/relay.mjs';

const count = Math.max(2, Math.min(10, Number(process.argv[2] || 2)));
const finishRace = process.argv.includes('--finish');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const dataDir = await mkdtemp(join(tmpdir(), 'minigrid-edge-'));
const relay = start(0);
const portOf = server => new Promise(resolve => server.listening
  ? resolve(server.address().port) : server.once('listening', () => resolve(server.address().port)));
const relayPort = await portOf(relay);
let ui = await readFile('figjam/ui.html', 'utf8');
if (finishRace) {
  const marker = 'const state = initialState(1, settings.track);';
  if (!ui.includes(marker)) throw new Error('Cannot instrument race state in test bundle');
  ui = ui.replace(marker, `${marker} globalThis.__minigridTestState = state;`);
}
const page = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(ui);
});
page.listen(0, '127.0.0.1');
const pagePort = await portOf(page);
const debugPort = 19493;
const browser = spawn(edge, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=${dataDir}`, 'about:blank'],
  { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const eventually = async (task, timeout = 12000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) { try { const value = await task(); if (value) return value; } catch {} await sleep(100); }
  throw new Error('Timed out waiting for browser condition');
};
class CDP {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pending = new Map();
    this.ws.onmessage = event => { const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') console.log('browser exception', msg.params.exceptionDetails.text,
        msg.params.exceptionDetails.exception?.description);
      if (!msg.id) return; const p = this.pending.get(msg.id); if (!p) return;
      this.pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); };
  }
  async ready() { await eventually(() => this.ws.readyState === WebSocket.OPEN); }
  send(method, params = {}) { const id = ++this.id;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params })); }); }
  async eval(expression) { const result = await this.send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value; }
  close() { this.ws.close(); }
}

const tabs = [];
try {
  await eventually(async () => (await fetch(`http://127.0.0.1:${debugPort}/json/version`)).ok);
  const session = 'ABCDEFGHJKLMNPQRSTUV';
  for (let i = 0; i < count; i++) {
    const tab = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?http%3A%2F%2F127.0.0.1%3A${pagePort}%2F`,
      { method: 'PUT' })).json();
    const cdp = new CDP(tab.webSocketDebuggerUrl); await cdp.ready();
    await cdp.send('Runtime.enable');
    await eventually(() => cdp.eval(`location.port === '${pagePort}'
      && document.readyState === 'complete' && !!document.querySelector('#status')`));
    await cdp.eval(`globalThis.__widgetMessages=[];
      window.addEventListener('message',e=>{if(e.data?.pluginMessage?.type==='result')
        globalThis.__widgetMessages.push(e.data.pluginMessage)})`);
    await cdp.eval(`window.dispatchEvent(new MessageEvent('message',{data:{pluginMessage:{type:'start',session:'${session}',
      relayUrl:'ws://127.0.0.1:${relayPort}/api/relay',name:'Driver ${i + 1}',
      track:'Harbour Loop',laps:1}}}))`);
    tabs.push(cdp);
  }
  await eventually(async () => (await tabs[0].eval('document.querySelectorAll("#players li").length')) === count)
    .catch(async e => { console.log('debug', await Promise.all(tabs.map(t => t.eval(`({url:location.href,
      status:document.querySelector('#status')?.textContent,
      players:document.querySelectorAll('#players li').length,
      started:globalThis.__SM_FIGJAM__, scripts:document.scripts.length,
      validSession:/^[A-Z2-9]{20}$/.test('${session}'),
      validRelay:/^wss?:\\/\\/[^/]+\\/api\\/relay$/.test('ws://127.0.0.1:${relayPort}/api/relay')})`)))); throw e; });
  const names = await tabs[0].eval('[...document.querySelectorAll("#players li")].map(x=>x.textContent)');
  if (new Set(names).size !== count) throw new Error(`Nonunique lobby: ${names}`);
  if (count === 2) {
    const lobbyShot = await tabs[0].send('Page.captureScreenshot', { format: 'png' });
    await writeFile('community/images/minigrid-lobby-original.png', Buffer.from(lobbyShot.data, 'base64'));
  }
  await tabs[0].eval('document.querySelector("#start").click()');
  await eventually(async () => (await tabs[0].eval('document.querySelector("#stage").hidden')) === false, 15000);
  await eventually(async () => (await tabs.at(-1).eval('document.querySelector("#stage").hidden')) === false, 15000);
  if (finishRace) {
    for (let i = 0; i < tabs.length; i++) {
      await tabs[i].eval(`(() => {
        const me = ${i}; let previous = 0;
        setInterval(() => {
          const car = globalThis.__minigridTestState?.cars[me];
          if (!car || car.finished) return;
          const phase = Math.atan2((car.y - 300) / 185, (car.x - 480) / 305);
          const desired = Math.atan2(185 * Math.cos(phase), -305 * Math.sin(phase));
          const error = Math.atan2(Math.sin(desired - car.angle), Math.cos(desired - car.angle));
          const next = 0x20 | (error > .02 ? 0x40 : error < -.02 ? 0x80 : 0);
          for (const [bit, code] of [[0x20,'ArrowUp'],[0x40,'ArrowRight'],[0x80,'ArrowLeft']]) {
            if ((previous & bit) !== (next & bit))
              window.dispatchEvent(new KeyboardEvent(next & bit ? 'keydown' : 'keyup', { code }));
          }
          previous = next;
        }, 25);
      })()`);
    }
    await eventually(async () => (await tabs[0].eval('document.querySelector("#board").hidden')) === false, 45000)
      .catch(async e => { console.log('finish debug', JSON.stringify(await Promise.all(tabs.map(t => t.eval(`({
        status:document.querySelector('#status').textContent,
        overlay:document.querySelector('#overlay').textContent,
        cars:globalThis.__minigridTestState?.cars,
        step:globalThis.__minigridTestState?.step})`))))); throw e; });
    const result = await tabs[0].eval('[...document.querySelectorAll("#board li")].map(x=>x.textContent)');
    if (result.length !== count) throw new Error(`Missing standings: ${result}`);
    const saved = await (await fetch(`http://127.0.0.1:${relayPort}/api/relay/result?session=${session}`)).json();
    if (saved.points?.length !== count) throw new Error(`Missing relay result: ${JSON.stringify(saved)}`);
    const widgetMessages = await tabs[0].eval('globalThis.__widgetMessages');
    if (widgetMessages.at(-1)?.result?.points?.length !== count)
      throw new Error(`Missing FigJam result message: ${JSON.stringify(widgetMessages)}`);
    console.log(JSON.stringify({ finished: true, result, relay: saved,
      widgetResult: widgetMessages.at(-1).result }));
  }
  if (!finishRace) {
    const before = await tabs[0].eval('document.querySelector("#screen").toDataURL()');
    await tabs[0].eval("window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowUp',bubbles:true}))");
    await sleep(1500);
    await tabs[0].eval("window.dispatchEvent(new KeyboardEvent('keyup',{code:'ArrowUp',bubbles:true}))");
    const after = await tabs[0].eval('document.querySelector("#screen").toDataURL()');
    const remote = await tabs.at(-1).eval('document.querySelector("#screen").toDataURL()');
    if (before === after || before === remote) throw new Error(`Canvas did not update: beforeAfter=${before === after}, beforeRemote=${before === remote}, overlays=${JSON.stringify(await Promise.all(tabs.map(t => t.eval("document.querySelector('#overlay').textContent"))))}`);
    const shot = await tabs[0].send('Page.captureScreenshot', { format: 'png' });
    const output = `figjam-evidence/minigrid-${count}-client-smoke.png`;
    await writeFile(output, Buffer.from(shot.data, 'base64'));
    console.log(JSON.stringify({ ok: true, clients: count, names, output,
      overlay: await tabs[0].eval('document.querySelector("#overlay").textContent') }));
  }
} finally {
  for (const tab of tabs) tab.close();
  browser.kill(); relay.close(); page.close();
  await sleep(250);
  if (dirname(resolve(dataDir)) === resolve(tmpdir()) && basename(dataDir).startsWith('minigrid-edge-'))
    await rm(dataDir, { recursive: true, force: true }).catch(() => {});
}
