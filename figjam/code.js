"use strict";
(() => {
  // figjam/code.tsx
  var { widget } = figma;
  var { AutoLayout, Text, useSyncedState } = widget;
  var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function newSession() {
    let code = "";
    for (let i = 0; i < 20; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    return code;
  }
  function RaceLobby() {
    const [lobby, setLobby] = useSyncedState(
      "lobby",
      { session: "", result: null, message: "" }
    );
    const { session, result, message } = lobby;
    const play = () => new Promise(() => {
      const name = figma.currentUser?.name?.trim().slice(0, 40) || "Guest";
      figma.on("close", () => figma.ui.postMessage({ type: "disconnect" }));
      figma.ui.onmessage = (reply) => {
        if (reply.type === "ready") {
          figma.ui.postMessage({
            type: "start",
            session,
            relayUrl: "wss://mm-0sdy.onrender.com/api/relay",
            name,
            track: lobby.track,
            laps: lobby.laps
          });
        } else if (reply.type === "lobby" && reply.session === session && typeof reply.admin === "string" && Array.isArray(reply.players) && reply.players.length <= 10 && reply.players.every((p) => typeof p === "string") && typeof reply.track === "string" && typeof reply.laps === "number") {
          setLobby((current) => current.session === session ? {
            ...current,
            admin: reply.admin.slice(0, 40),
            players: reply.players.map((p) => p.slice(0, 40)),
            track: reply.track.slice(0, 40),
            laps: reply.laps
          } : current);
        } else if (reply.type === "result" && reply.session === session && reply.result && Array.isArray(reply.result.points) && reply.result.points.length >= 2 && reply.result.points.length <= 10) {
          const result2 = reply.result;
          setLobby((current) => current.session === session ? { ...current, result: result2, message: "Race complete" } : current);
        }
      };
      figma.showUI(__html__, { width: 960, height: 720, title: "MicroMachine" });
    });
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        direction: "vertical",
        spacing: 10,
        padding: 20,
        width: 340,
        fill: "#111014",
        cornerRadius: 12
      },
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 24, fill: "#FFE800" }, "MicroMachine"),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, fill: "#FFFFFF" }, "Admin: ", lobby.admin || "\u2014"),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, width: 300, fill: "#FFFFFF" }, "In lobby: ", lobby.players?.length ? lobby.players.join(", ") : "\u2014"),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, fill: "#FFFFFF" }, "Track: ", lobby.track || "Round 2 \xB7 track 1"),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, fill: "#FFFFFF" }, "Laps: ", lobby.laps || 3),
      session ? /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 10 }, /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          padding: 12,
          fill: "#FFE800",
          cornerRadius: 6,
          onClick: play
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 18, fill: "#111014" }, "JOIN RACE")
      ), result ? /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4 }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 16, fill: "#FFE800" }, "After race ", result.gen + 1), result.points.map((score, i) => /* @__PURE__ */ figma.widget.h(Text, { key: i, fontSize: 14, fill: "#FFFFFF" }, result.names?.[i] || "Guest", ": ", score, " points"))) : null, message ? /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: "#FFFFFF" }, message) : null) : null,
      /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          padding: 9,
          fill: "#EC008C",
          cornerRadius: 6,
          onClick: () => setLobby({
            session: newSession(),
            result: null,
            message: "",
            admin: "",
            players: [],
            track: "Round 2 \xB7 track 1",
            laps: 3
          })
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fill: "#FFFFFF" }, session ? "NEW RACE" : "CREATE RACE")
      )
    );
  }
  widget.register(RaceLobby);
})();
