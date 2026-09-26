/** Browser-side entry for the local FigJam widget iframe. */
import { startOnline } from '../src/app/online/main';

declare global {
  var __SM_FIGJAM_WAIT__: boolean | undefined;
  var __SM_FIGJAM__: { session: string; relayUrl: string; name: string;
    track?: string; laps?: number; gameDataRoot?: string } | undefined;
}
declare const __GAME_DATA_ROOT__: string;

let started = false;
const status = document.querySelector<HTMLElement>('#status');
const showError = (why: string): void => { if (status) status.textContent = why; };
addEventListener('error', event => showError(`Race failed to open: ${event.message}`));
addEventListener('unhandledrejection', event => showError(`Race failed to open: ${String(event.reason)}`));
addEventListener('message', event => {
  const message = event.data?.pluginMessage as { type?: string; session?: string;
    relayUrl?: string; name?: string; track?: string; laps?: number } | undefined;
  if (message?.type === 'disconnect') {
    dispatchEvent(new Event('figjam-close'));
    return;
  }
  if (started) return;
  if (message?.type !== 'start' || !/^[A-Z2-9]{20}$/.test(message.session ?? '')
      || !/^wss?:\/\/[^/]+\/api\/relay$/.test(message.relayUrl ?? '')) return;
  started = true;
  clearInterval(readyTimer);
  globalThis.__SM_FIGJAM__ = {
    session: message.session!, relayUrl: message.relayUrl!, name: message.name?.trim().slice(0, 40) || 'Guest',
    track: message.track, laps: message.laps,
    gameDataRoot: __GAME_DATA_ROOT__ || undefined,
  };
  startOnline();
});

const announceReady = (): void => parent.postMessage({ pluginMessage: { type: 'ready' } }, '*');
const readyTimer = setInterval(announceReady, 1000);
announceReady();
setTimeout(() => {
  if (!started) showError('Waiting for the FigJam widget to connect. Close this window and try Join race again.');
}, 5000);
