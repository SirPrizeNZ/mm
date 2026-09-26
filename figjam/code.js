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
      figma.ui.onmessage = (reply) => {
        if (reply.type === "ready") {
          figma.ui.postMessage({ type: "start", session, relayUrl: "wss://mm-0sdy.onrender.com/api/relay", name });
        } else if (reply.type === "result" && reply.session === session && reply.result && Array.isArray(reply.result.points) && reply.result.points.length >= 2 && reply.result.points.length <= 10) {
          const result2 = reply.result;
          setLobby((current) => current.session === session ? { ...current, result: result2, message: "Race complete" } : current);
        }
      };
      figma.showUI(__html__, { width: 960, height: 720, title: "Scale Miniatures race" });
    });
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        direction: "vertical",
        spacing: 12,
        padding: 20,
        width: 340,
        fill: "#111014",
        cornerRadius: 12
      },
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 24, fill: "#FFE800" }, "SCALE MINIATURES"),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, fill: "#FFFFFF" }, "Shared race lobby \xB7 up to 10 players"),
      session ? /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 10 }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fill: "#29ABE2" }, "SESSION ", session), /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          padding: 12,
          fill: "#FFE800",
          cornerRadius: 6,
          onClick: play
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 18, fill: "#111014" }, "PLAY IN FIGJAM")
      ), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, width: 300, fill: "#FFFFFF" }, "Each player opens the race here and drives with arrow keys. The first player to join hosts the race."), result ? /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4 }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 16, fill: "#FFE800" }, "After race ", result.gen + 1), result.points.map((score, i) => /* @__PURE__ */ figma.widget.h(Text, { key: i, fontSize: 14, fill: "#FFFFFF" }, result.names?.[i] || "Guest", ": ", score, " points"))) : null, message ? /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: "#FFFFFF" }, message) : null) : /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, width: 300, fill: "#FFFFFF" }, "Create a race, then everyone on this board can join from this card."),
      /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          padding: 9,
          fill: "#EC008C",
          cornerRadius: 6,
          onClick: () => setLobby({ session: newSession(), result: null, message: "" })
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fill: "#FFFFFF" }, session ? "NEW RACE" : "CREATE RACE")
      )
    );
  }
  widget.register(RaceLobby);
})();
