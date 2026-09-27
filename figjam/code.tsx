/** FigJam owns the invitation and final score. Each player runs the game in a local widget iframe. */
const { widget } = figma;
const { AutoLayout, Text, useSyncedState } = widget;

declare const __RELAY_URL__: string;

interface Result { gen: number; points: number[]; names: string[]; at: number }
interface LobbyState {
  session: string; result: Result | null; message: string;
  admin?: string; players?: string[]; track?: string; laps?: number;
}
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newSession(): string {
  let code = '';
  for (let i = 0; i < 20; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return code;
}

function RaceLobby() {
  const [lobby, setLobby] = useSyncedState<LobbyState>('lobby',
    { session: '', result: null, message: '' });
  const { session, result, message } = lobby;
  const play = (race: LobbyState): void => {
    const name = figma.currentUser?.name?.trim().slice(0, 40) || 'Guest';
    figma.on('close', () => figma.ui.postMessage({ type: 'disconnect' }));
    figma.ui.onmessage = (reply: { type?: string; session?: string; result?: Result;
      admin?: string; players?: string[]; track?: string; laps?: number }) => {
      if (reply.type === 'ready') {
        figma.ui.postMessage({ type: 'start', session: race.session, relayUrl: __RELAY_URL__, name,
          track: race.track, laps: race.laps });
      } else if (reply.type === 'lobby' && reply.session === race.session
          && typeof reply.admin === 'string' && Array.isArray(reply.players)
          && reply.players.length <= 10 && reply.players.every(p => typeof p === 'string')
          && typeof reply.track === 'string' && typeof reply.laps === 'number') {
        setLobby(current => current.session === race.session ? {
          ...current, admin: reply.admin!.slice(0, 40),
          players: reply.players!.map(p => p.slice(0, 40)),
          track: reply.track!.slice(0, 40), laps: reply.laps,
        } : current);
      } else if (reply.type === 'result' && reply.session === race.session && reply.result
          && Array.isArray(reply.result.points) && reply.result.points.length >= 2
          && reply.result.points.length <= 10) {
        const result = reply.result;
        setLobby(current => current.session === race.session
          ? { ...current, result, message: 'Race complete' } : current);
      }
    };
    figma.showUI(__html__, { width: 960, height: 720, title: 'MiniGrid Racers' });
  };
  const newRace = (): void => {
    const name = figma.currentUser?.name?.trim().slice(0, 40) || 'Guest';
    const race: LobbyState = { session: newSession(), result: null, message: '',
      admin: name, players: [name], track: 'Round 2 · track 1', laps: 3 };
    setLobby(race);
    play(race);
  };

  return <AutoLayout direction="vertical" spacing={10} padding={20} width={340}
    fill="#111014" cornerRadius={12}>
    <Text fontSize={24} fill="#FFE800">MiniGrid Racers</Text>
    <Text fontSize={14} fill="#FFFFFF">Admin: {lobby.admin || '—'}</Text>
    <Text fontSize={14} width={300} fill="#FFFFFF">In lobby: {lobby.players?.length ? lobby.players.join(', ') : '—'}</Text>
    <Text fontSize={14} fill="#FFFFFF">Track: {lobby.track || 'Round 2 · track 1'}</Text>
    <Text fontSize={14} fill="#FFFFFF">Laps: {lobby.laps || 3}</Text>
    {session
      ? <AutoLayout direction="vertical" spacing={10}>
          <AutoLayout padding={12} fill="#FFE800" cornerRadius={6}
            onClick={() => play(lobby)}>
            <Text fontSize={18} fill="#111014">JOIN RACE</Text>
          </AutoLayout>
          {result ? <AutoLayout direction="vertical" spacing={4}>
            <Text fontSize={16} fill="#FFE800">After race {result.gen + 1}</Text>
            {result.points.map((score, i) => <Text key={i} fontSize={14} fill="#FFFFFF">{result.names?.[i] || 'Guest'}: {score} points</Text>)}
          </AutoLayout> : null}
          {message ? <Text fontSize={12} fill="#FFFFFF">{message}</Text> : null}
        </AutoLayout>
      : null}
    <AutoLayout padding={9} fill="#EC008C" cornerRadius={6}
      onClick={newRace}>
      <Text fontSize={13} fill="#FFFFFF">{session ? 'NEW RACE' : 'CREATE RACE'}</Text>
    </AutoLayout>
  </AutoLayout>;
}

widget.register(RaceLobby);
