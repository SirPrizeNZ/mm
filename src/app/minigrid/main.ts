/** FigJam iframe game: original MiniGrid race, existing relay and packet protocol. */
import { Relay } from '../../hal/net/Relay';
import { decodePacket, encodeHash, encodeInput, encodeSay, HASH, INPUT, SAY } from '../../net/packet';
import { advance, COLORS, drawCars, drawTrack, HEIGHT, initialState, LEFT, RIGHT,
  standings, stateHash, TICK_MS, TRACK_NAMES, TRACKS, UP, DOWN, WIDTH } from './race';

interface Launch { session: string; relayUrl: string; name: string; track?: string; laps?: number }
interface Settings { track: number; laps: number }
interface Go extends Settings { humans: number; names: string[] }
type Message = { profile?: string; request?: boolean; settings?: Settings; go?: Go;
  ready?: boolean; startAt?: number; abort?: string; underway?: boolean };

const $ = <T extends HTMLElement>(selector: string): T => document.querySelector<T>(selector)!;
const status = $<HTMLElement>('#status');
const players = $<HTMLUListElement>('#players');
const admin = $<HTMLElement>('#admin');
const setup = $<HTMLElement>('#setup');
const start = $<HTMLButtonElement>('#start');
const trackSelect = $<HTMLSelectElement>('#track');
const lapsInput = $<HTMLInputElement>('#laps');
const preview = $<HTMLImageElement>('#map-preview');
const selection = $<HTMLElement>('#selection');
const countdown = $<HTMLElement>('#countdown');
const stage = $<HTMLElement>('#stage');
const canvas = $<HTMLCanvasElement>('#screen');
const overlay = $<HTMLElement>('#overlay');
const board = $<HTMLElement>('#board');
const lobby = $<HTMLElement>('#lobby');
const ctx = canvas.getContext('2d')!;
canvas.width = WIDTH; canvas.height = HEIGHT;

const keyBits: Record<string, number> = { ArrowLeft: LEFT, ArrowRight: RIGHT,
  ArrowUp: UP, ArrowDown: DOWN, KeyA: LEFT, KeyD: RIGHT, KeyW: UP, KeyS: DOWN };
let keys = 0;
const typing = (e: Event): boolean => ['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
addEventListener('keydown', e => { if (typing(e)) return; const bit = keyBits[e.code];
  if (bit) { keys |= bit; e.preventDefault(); } });
addEventListener('keyup', e => { if (typing(e)) return; const bit = keyBits[e.code];
  if (bit) { keys &= ~bit; e.preventDefault(); } });
addEventListener('blur', () => { keys = 0; });

function mapPreview(track: number): void {
  const offscreen = document.createElement('canvas');
  offscreen.width = WIDTH; offscreen.height = HEIGHT;
  drawTrack(offscreen.getContext('2d')!, track);
  preview.src = offscreen.toDataURL('image/png');
  preview.hidden = false;
}

export async function startMiniGrid(launch: Launch): Promise<void> {
  const name = launch.name.trim().slice(0, 40) || 'Guest';
  status.textContent = 'Connecting to race…';
  const wire = await Relay.join(launch.session, launch.relayUrl, true);
  const mine = wire.slot;
  if (mine >= 10) { status.textContent = 'This race is full.'; wire.close(); return; }
  const host = mine === 0;
  const names = new Map<number, string>([[mine, name]]);
  let settings: Settings = { track: Math.max(0, TRACK_NAMES.indexOf((launch.track ?? '') as typeof TRACK_NAMES[number])),
    laps: Math.max(1, Math.min(10, Math.round(launch.laps || 3))) };
  let agreed: Go | undefined;
  let startAt = 0;
  let ended = false;
  const ready = new Set<number>();
  const inputs: number[][] = Array.from({ length: 10 }, () => []);
  let sent = -1;
  const state = initialState(1, settings.track);
  let lastFrame = performance.now(), frames = 0, fps = 0, fpsAt = lastFrame;

  for (let i = 0; i < TRACK_NAMES.length; i++) {
    const option = document.createElement('option'); option.value = String(i); option.textContent = TRACK_NAMES[i]!;
    trackSelect.append(option);
  }
  trackSelect.value = String(settings.track);
  lapsInput.value = String(settings.laps);
  mapPreview(settings.track);
  $('#roomline').hidden = false;
  setup.hidden = !host;
  selection.hidden = host;
  lobby.hidden = false;

  const tellBoard = (): void => {
    parent.postMessage({ pluginMessage: { type: 'lobby', session: launch.session,
      admin: names.get(0) ?? '',
      players: [mine, ...wire.peers].sort((a, b) => a - b).map(s => names.get(s) ?? 'Joining…'),
      track: TRACK_NAMES[settings.track], laps: settings.laps } }, '*');
  };
  const showRoom = (): void => {
    const slots = [mine, ...wire.peers].sort((a, b) => a - b);
    players.replaceChildren();
    for (const slot of slots) { const li = document.createElement('li');
      li.textContent = names.get(slot) ?? 'Joining…'; players.append(li); }
    admin.textContent = `Admin: ${names.get(0) ?? 'Joining…'}`;
    selection.textContent = `Track: ${TRACK_NAMES[settings.track]} · Laps: ${settings.laps}`;
    start.disabled = !host || !!agreed || slots.length < 2
      || slots.some((slot, i) => slot !== i);
    if (!agreed) status.textContent = host
      ? (start.disabled ? 'Waiting for at least two players…' : 'Ready to start.')
      : 'Waiting for admin to start…';
    tellBoard();
  };
  const publishSettings = (): void => {
    if (!host || agreed) return;
    settings = { track: Number(trackSelect.value),
      laps: Math.max(1, Math.min(10, Math.round(Number(lapsInput.value) || 3))) };
    lapsInput.value = String(settings.laps);
    mapPreview(settings.track);
    wire.send(encodeSay({ settings })); showRoom();
  };
  trackSelect.addEventListener('change', publishSettings);
  lapsInput.addEventListener('change', publishSettings);
  showRoom();
  wire.send(encodeSay({ profile: name, request: true }));

  const finish = (): void => {
    if (!agreed || ended) return;
    ended = true;
    const order = standings(state);
    const points = Array.from({ length: agreed.humans }, (_, i) => agreed!.humans - order.indexOf(i));
    board.replaceChildren();
    const title = document.createElement('h2'); title.textContent = 'Race results'; board.append(title);
    const list = document.createElement('ol');
    for (const slot of order) { const li = document.createElement('li');
      li.textContent = `${agreed.names[slot] ?? 'Guest'} — ${points[slot]} points`;
      if (slot === mine) li.className = 'you'; list.append(li); }
    board.append(list);
    stage.hidden = true; board.hidden = false; countdown.hidden = true;
    status.textContent = 'Race complete. Start a new race from the FigJam board.';
    wire.publishResult(0, points, agreed.names);
    parent.postMessage({ pluginMessage: { type: 'result', session: launch.session,
      result: { gen: 0, points, names: agreed.names, at: Date.now() } } }, '*');
  };
  const begin = (): void => {
    if (!agreed || ended || !startAt) return;
    const left = Math.ceil((startAt - Date.now()) / 1000);
    if (left > 0) { countdown.textContent = String(left); countdown.hidden = false;
      status.textContent = `Race starts in ${left}…`; return; }
    countdown.hidden = true; lobby.hidden = true; stage.hidden = false;
    status.textContent = 'Arrow keys to drive';
    const target = Math.min(30 * 60 * 5, Math.floor((Date.now() - startAt) / TICK_MS));
    const horizon = Math.min(target + 4, 30 * 60 * 5);
    while (sent < horizon) {
      sent++; inputs[mine]![sent] = keys;
      // Repeating the last eight inputs uses the existing loss-tolerant packet shape.
      if (sent % 2 === 0 || sent === horizon) {
        const from = Math.max(0, sent - 7);
        wire.send(encodeInput(0, from, inputs[mine]!.slice(from, sent + 1)));
      }
    }
    let catchup = 0;
    while (state.step <= target && catchup++ < 120) {
      const stepInputs = inputs.slice(0, agreed.humans).map(log => log[state.step]);
      if (stepInputs.some(x => x === undefined)) break;
      advance(state, stepInputs as number[], agreed.track, agreed.laps);
      if (state.step % 60 === 0) wire.send(encodeHash(0, state.step, stateHash(state)));
      const firstFinish = Math.min(...state.cars.map(c => c.finished || Infinity));
      if (state.cars.every(c => c.finished) || state.step >= 30 * 60 * 5
          || (Number.isFinite(firstFinish) && state.step - firstFinish >= 30 * 30)) {
        finish(); return;
      }
    }
    drawTrack(ctx, agreed.track); drawCars(ctx, state, agreed.names, mine);
    frames++;
    const now = performance.now();
    if (now - fpsAt > 1000) { fps = Math.round(frames * 1000 / (now - fpsAt));
      fpsAt = now; frames = 0; }
    lastFrame = now;
    overlay.hidden = false;
    overlay.textContent = `${agreed.names[mine]} · lap ${Math.min(agreed.laps, state.cars[mine]!.laps + 1)}/${agreed.laps} · ${fps} FPS`;
  };
  void lastFrame;

  wire.onJoin = () => { wire.send(encodeSay({ profile: name })); showRoom(); };
  wire.onLeave = slot => {
    names.delete(slot); ready.delete(slot); showRoom();
    if (agreed && !ended) { ended = true; stage.hidden = true; lobby.hidden = false;
      status.textContent = 'A driver disconnected. Start a new race from the FigJam board.'; }
  };
  wire.onError = why => { status.textContent = why; };
  wire.onPacket = (from, data) => {
    const packet = decodePacket(data); if (!packet) return;
    if (packet.kind === INPUT && agreed && from < agreed.humans && packet.gen === 0) {
      for (let i = 0; i < packet.bytes.length; i++) inputs[from]![packet.from + i] = packet.bytes[i]!;
      return;
    }
    if (packet.kind === HASH && packet.gen === 0 && packet.step === state.step && agreed
        && packet.hash !== stateHash(state)) {
      ended = true; stage.hidden = true; lobby.hidden = false;
      status.textContent = 'Race states differed. Start a new race.'; return;
    }
    if (packet.kind !== SAY) return;
    let body: Message; try { body = JSON.parse(packet.text) as Message; } catch { return; }
    if (typeof body.profile === 'string') {
      names.set(from, body.profile.trim().slice(0, 40) || 'Guest'); showRoom();
      if (body.request) { wire.send(encodeSay({ profile: name }));
        if (host) wire.send(encodeSay({ settings, underway: !!agreed })); }
    }
    if (!host && from === 0 && body.settings && !agreed) {
      if (Number.isInteger(body.settings.track) && body.settings.track >= 0
          && body.settings.track < TRACKS.length && Number.isInteger(body.settings.laps)) {
        settings = { track: body.settings.track, laps: Math.max(1, Math.min(10, body.settings.laps)) };
        mapPreview(settings.track); showRoom();
      }
    }
    if (body.underway && !agreed) { start.disabled = true;
      status.textContent = 'This race already started. Join the next race from the FigJam board.'; }
    if (body.go && from === 0 && !agreed) {
      const go = body.go;
      if (go.humans < 2 || go.humans > 10 || go.names.length !== go.humans
          || go.track < 0 || go.track >= TRACKS.length || go.laps < 1 || go.laps > 10) return;
      agreed = go; state.cars = initialState(go.humans, go.track).cars;
      ready.add(mine); wire.send(encodeSay({ ready: true })); showRoom();
    }
    if (host && body.ready && agreed) {
      ready.add(from);
      if (ready.size === agreed.humans && !startAt) {
        startAt = Date.now() + 5000;
        wire.send(encodeSay({ startAt }));
      }
    }
    if (body.startAt && from === 0 && agreed && !startAt) startAt = body.startAt;
  };

  start.addEventListener('click', () => {
    if (!host || start.disabled || agreed) return;
    const slots = [mine, ...wire.peers].sort((a, b) => a - b);
    agreed = { ...settings, humans: slots.length,
      names: slots.map(slot => names.get(slot) ?? 'Guest') };
    state.cars = initialState(agreed.humans, agreed.track).cars;
    ready.add(mine); start.disabled = true;
    wire.send(encodeSay({ go: agreed })); showRoom();
  });
  $('#fullscreen').addEventListener('click', () => {
    void stage.requestFullscreen?.().catch(() => {});
  });
  addEventListener('figjam-close', () => wire.close(), { once: true });
  addEventListener('pagehide', () => wire.close(), { once: true });
  const timer = setInterval(() => { if (ended || !wire.open) { clearInterval(timer); return; }
    begin(); }, TICK_MS);
}
