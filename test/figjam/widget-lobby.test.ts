import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

type Node = { children: (Node | string | null)[]; props: Record<string, unknown> };

describe('FigJam race creation', () => {
  it('opens the creator lobby and makes that player admin on Create Race and New Race', () => {
    let lobby: Record<string, unknown> = { session: '', result: null, message: '' };
    let render!: () => Node;
    const posted: Record<string, unknown>[] = [];
    let modalOpens = 0;
    let modalTitle = '';
    const figma = {
      currentUser: { name: 'Sam' },
      ui: { onmessage: (_message: unknown) => {}, postMessage: (message: Record<string, unknown>) => posted.push(message) },
      on: () => {},
      showUI: (_html: string, options: { title: string }) => { modalOpens++; modalTitle = options.title; },
      widget: {
        AutoLayout: 'AutoLayout', Text: 'Text',
        h: (_kind: unknown, props: Record<string, unknown>, ...children: (Node | string | null)[]): Node => ({ props, children }),
        useSyncedState: (_key: string, initial: Record<string, unknown>) => {
          if (!lobby.session) lobby = { ...initial, ...lobby };
          return [lobby, (next: Record<string, unknown> | ((current: Record<string, unknown>) => Record<string, unknown>)) => {
            lobby = typeof next === 'function' ? next(lobby) : next;
          }];
        },
        register: (component: () => Node) => { render = component; },
      },
    };
    runInNewContext(readFileSync(new URL('../../figjam/code.js', import.meta.url), 'utf8'), { figma, __html__: '' });

    for (let attempt = 0; attempt < 2; attempt++) {
      const card = render();
      const create = card.children.at(-1) as Node;
      (create.props.onClick as () => void)();
      expect(modalOpens).toBe(attempt + 1);
      expect(modalTitle).toBe('MiniGrid Racers');
      expect(lobby.admin).toBe('Sam');
      expect(lobby.players).toEqual(['Sam']);
      expect(lobby.session).toMatch(/^[A-Z2-9]{20}$/);
      figma.ui.onmessage({ type: 'ready' });
      expect(posted.at(-1)).toMatchObject({ type: 'start', session: lobby.session, name: 'Sam', laps: 3 });
    }
  });
});
