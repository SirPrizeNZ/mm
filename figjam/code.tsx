/** FigJam owns the invitation and final score. Each player runs the game in a local widget iframe. */
const { widget } = figma;
const { AutoLayout, Text, useSyncedState } = widget;

declare const __RELAY_URL__: string;

interface Result { gen: number; points: number[]; names: string[]; at: number }
interface LobbyState { session: string; result: Result | null; message: string }
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
  const play = (): Promise<void> => new Promise(() => {
    const name = figma.currentUser?.name?.trim().slice(0, 40) || 'Guest';
    figma.ui.onmessage = (reply: { type?: string; session?: string; result?: Result }) => {
      if (reply.type === 'ready') {
        figma.ui.postMessage({ type: 'start', session, relayUrl: __RELAY_URL__, name });
      } else if (reply.type === 'result' && reply.session === session && reply.result
          && Array.isArray(reply.result.points) && reply.result.points.length >= 2
          && reply.result.points.length <= 10) {
        const result = reply.result;
        setLobby(current => current.session === session
          ? { ...current, result, message: 'Race complete' } : current);
      }
    };
    figma.showUI(__html__, { width: 960, height: 720, title: 'Scale Miniatures race' });
  });

  return <AutoLayout direction="vertical" spacing={12} padding={20} width={340}
    fill="#111014" cornerRadius={12}>
    <Text fontSize={24} fill="#FFE800">SCALE MINIATURES</Text>
    <Text fontSize={14} fill="#FFFFFF">Shared race lobby · up to 10 players</Text>
    {session
      ? <AutoLayout direction="vertical" spacing={10}>
          <Text fontSize={13} fill="#29ABE2">SESSION {session}</Text>
          <AutoLayout padding={12} fill="#FFE800" cornerRadius={6}
            onClick={play}>
            <Text fontSize={18} fill="#111014">PLAY IN FIGJAM</Text>
          </AutoLayout>
          <Text fontSize={12} width={300} fill="#FFFFFF">Each player opens the race here and drives with arrow keys. The first player to join hosts the race.</Text>
          {result ? <AutoLayout direction="vertical" spacing={4}>
            <Text fontSize={16} fill="#FFE800">After race {result.gen + 1}</Text>
            {result.points.map((score, i) => <Text key={i} fontSize={14} fill="#FFFFFF">{result.names?.[i] || 'Guest'}: {score} points</Text>)}
          </AutoLayout> : null}
          {message ? <Text fontSize={12} fill="#FFFFFF">{message}</Text> : null}
        </AutoLayout>
      : <Text fontSize={13} width={300} fill="#FFFFFF">Create a race, then everyone on this board can join from this card.</Text>}
    <AutoLayout padding={9} fill="#EC008C" cornerRadius={6}
      onClick={() => setLobby({ session: newSession(), result: null, message: '' })}>
      <Text fontSize={13} fill="#FFFFFF">{session ? 'NEW RACE' : 'CREATE RACE'}</Text>
    </AutoLayout>
  </AutoLayout>;
}

widget.register(RaceLobby);
