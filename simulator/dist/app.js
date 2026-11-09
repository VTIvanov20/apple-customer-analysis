"use strict";
const $ = (id) => document.getElementById(id),
  names = ["iPhone", "Desktop", "Accessories"];
const defaults = {
  duration: 60,
  window: 10,
  split: 70,
  dwell: 6,
  events: 2,
  seed: 42,
  readings: [
    [0, 66, 30, 69, 12, 6],
    [10, 73, 40, 80, 8, 5],
    [20, 24, 50, 31, 1, 1],
  ],
};
let cfg,
  frames = [],
  model = [],
  playing = false,
  at = 0,
  images = {},
  last = 0,
  acc = 0,
  runSummary = {};
function fill(c) {
  for (const k of ["duration", "window", "split", "dwell", "events", "seed"])
    $(k).value = c[k];
  $("inputs").innerHTML = c.readings
    .map(
      (r, z) =>
        `<tr><td>${names[z]}</td>${r.map((v, i) => `<td><input aria-label="${names[z]} ${["first minute", "first count", "second minute", "second count", "ground staff", "mezzanine staff"][i]}" type="number" min="0" step="${i === 1 || i === 3 ? "any" : "1"}" value="${v}"></td>`).join("")}</tr>`,
    )
    .join("");
}
function read() {
  let c = {};
  for (const k of ["duration", "window", "split", "dwell", "events", "seed"]) {
    c[k] = Number($(k).value);
    if (!Number.isFinite(c[k]) || !$(k).checkValidity())
      throw Error("Check " + k + " input range.");
  }
  c.readings = [...$("inputs").rows].map((row) =>
    [...row.querySelectorAll("input")].map((x) => Number(x.value)),
  );
  for (const r of c.readings)
    if (
      r.length !== 6 ||
      r.some((v) => !Number.isFinite(v) || v < 0) ||
      r[1] <= 0 ||
      r[3] <= 0 ||
      r[2] <= r[0] ||
      r[0] > 180 ||
      r[2] > 180 ||
      r[4] > 100 ||
      r[5] > 100 ||
      !Number.isInteger(r[4]) ||
      !Number.isInteger(r[5])
    )
      throw Error(
        "Use positive counts, increasing observation times (0–180 min) and whole staff counts (0–100).",
      );
  return c;
}
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const obstacles = [[], []];
for (const x of [508, 651, 794, 937, 1079, 1222])
  for (const y of [304, 494])
    obstacles[0].push([x - 5, y - 5, x + 48, y + 171]);
for (const [x, y] of [
  [491, 341],
  [491, 467],
  [650, 467],
  [792, 467],
  [943, 467],
  [1092, 467],
  [1254, 341],
  [1254, 467],
])
  obstacles[1].push([x - 7, y - 6, x + 44, y + 105]);
obstacles[1].push([685, 300, 1068, 432]);
const trees = [
  [427, 335],
  [427, 423],
  [427, 520],
  [591, 335],
  [591, 423],
  [591, 520],
  [1192, 335],
  [1192, 423],
  [1192, 520],
  [1354, 335],
  [1354, 423],
  [1354, 520],
];
function walk(f, x, y) {
  if (x < 450 || x > 1400 || y < (f ? 310 : 290) || y > (f ? 575 : 690))
    return false;
  if (
    obstacles[f].some((b) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3])
  )
    return false;
  if (f && trees.some((p) => (x - p[0]) ** 2 + (y - p[1]) ** 2 < 25 ** 2))
    return false;
  return true;
}
const nodes = [new Map(), new Map()];
for (let f = 0; f < 2; f++)
  for (let y = 290; y <= 690; y += 10)
    for (let x = 450; x <= 1400; x += 10)
      if (walk(f, x, y)) nodes[f].set(x + "," + y, [x, y]);
const targetRects = [
  [
    [[500, 490, 1300, 660]],
    [[500, 305, 990, 470]],
    [
      [560, 290, 1250, 300],
      [1065, 310, 1300, 470],
    ],
  ],
  [
    [[780, 460, 1320, 570]],
    [
      [465, 340, 560, 570],
      [560, 460, 745, 570],
    ],
    [
      [455, 310, 675, 325],
      [1080, 310, 1390, 325],
      [1230, 340, 1320, 445],
    ],
  ],
];
function inRect(p, r) {
  return p[0] >= r[0] && p[0] <= r[2] && p[1] >= r[1] && p[1] <= r[3];
}
const targets = targetRects.map((zones, f) =>
  zones.map((rs) =>
    [...nodes[f].values()].filter((p) => rs.some((r) => inRect(p, r))),
  ),
);
function nearest(f, p) {
  if (nodes[f].has(p.join(","))) return nodes[f].get(p.join(","));
  return [...nodes[f].values()].reduce((a, b) =>
    Math.hypot(b[0] - p[0], b[1] - p[1]) < Math.hypot(a[0] - p[0], a[1] - p[1])
      ? b
      : a,
  );
}
const entries = [nearest(0, [470, 690]), nearest(1, [450, 450])],
  cache = new Map();
function path(f, a, b) {
  a = nearest(f, a);
  b = nearest(f, b);
  let key = [f, ...a, ...b].join("_");
  if (cache.has(key)) return cache.get(key).map((p) => p.slice());
  let start = a.join(","),
    end = b.join(","),
    q = [start],
    prev = new Map([[start, null]]);
  for (let i = 0; i < q.length && !prev.has(end); i++) {
    let [x, y] = nodes[f].get(q[i]);
    for (const [dx, dy] of [
      [10, 0],
      [-10, 0],
      [0, 10],
      [0, -10],
    ]) {
      let k = [x + dx, y + dy].join(",");
      if (nodes[f].has(k) && !prev.has(k)) {
        prev.set(k, q[i]);
        q.push(k);
      }
    }
  }
  if (!prev.has(end)) throw Error("Disconnected route network");
  let p = [],
    k = end;
  while (k !== null) {
    p.push(nodes[f].get(k));
    k = prev.get(k);
  }
  p.reverse();
  cache.set(key, p);
  return p.map((x) => x.slice());
}
function prediction(c, z, min) {
  const [t, a, u, b] = c.readings[z];
  return a * (b / a) ** ((min - t) / (u - t));
}
function build(c) {
  const random = rng(c.seed),
    choose = (a) => a[Math.floor(random() * a.length)],
    queue = [],
    staff = [],
    end = c.duration * 60,
    warm = c.dwell * 60;
  let id = 0;
  model = [];
  cache.clear();
  for (let start = 0; start < c.duration; start += c.window)
    for (let z = 0; z < 3; z++) {
      const r = c.readings[z],
        v = prediction(c, z, start);
      model.push({
        start,
        zone: names[z],
        events: v,
        source:
          start === r[0] || start === r[2]
            ? "observed_anchor"
            : start > r[0] && start < r[2]
              ? "interpolated"
              : "extrapolated",
      });
      if (!Number.isFinite(v) || v > 30000)
        throw Error(
          "Growth produces excessive traffic. Reduce duration or anchor counts.",
        );
    }
  function schedule(start, length) {
    for (let f = 0; f < 2; f++)
      for (let z = 0; z < 3; z++) {
        let expected =
            ((prediction(c, z, Math.max(0, start / 60)) * length) /
              (c.window * 60) /
              c.events) *
            (f ? 1 - c.split / 100 : c.split / 100),
          n = Math.floor(expected) + (random() < expected % 1 ? 1 : 0);
        if (queue.length + n > 5000)
          throw Error(
            "Scenario exceeds 5,000 visitors. Reduce counts/duration.",
          );
        for (let i = 0; i < n; i++)
          queue.push({
            id: "C" + ++id,
            kind: "customer",
            f,
            z,
            born: start + random() * length,
            dwell: c.dwell * 60 * (0.65 + random() * 0.7),
            pos: entries[f].slice(),
            phase: 0,
            p: [],
            wait: 0,
          });
      }
  }
  schedule(-warm, warm);
  for (let t = 0; t < end; t += c.window * 60)
    schedule(t, Math.min(c.window * 60, end - t));
  queue.sort((a, b) => a.born - b.born);
  for (let f = 0; f < 2; f++)
    for (let z = 0; z < 3; z++)
      for (let i = 0; i < c.readings[z][4 + f]; i++)
        staff.push({
          id: `S${f}-${z}-${i}`,
          kind: "staff",
          f,
          z,
          pos: choose(targets[f][z]).slice(),
          phase: 0,
          p: [],
          wait: random() * 40,
        });
  let active = [],
    qi = 0,
    out = [];
  const route = (a) => {
    a.p = path(a.f, a.pos, choose(targets[a.f][a.z])).slice(1);
  };
  for (let t = -warm; t <= end; t += 2) {
    while (qi < queue.length && queue[qi].born <= t) {
      let a = queue[qi++];
      route(a);
      active.push(a);
    }
    for (const a of [...active, ...staff]) {
      if (a.wait > 0) {
        a.wait -= 2;
        continue;
      }
      if (!a.p.length) {
        if (a.kind === "staff") {
          route(a);
          a.wait = 15 + random() * 45;
        } else if (a.phase === 0) {
          a.phase = 1;
          a.wait = a.dwell * 0.65;
          route(a);
        } else if (a.phase === 1) {
          a.phase = 2;
          a.wait = a.dwell * 0.35;
          a.p = path(a.f, a.pos, entries[a.f]).slice(1);
        } else {
          a.dead = true;
          continue;
        }
      }
      let remaining = a.kind === "staff" ? 10 : 32;
      while (remaining > 0 && a.p.length) {
        let b = a.p[0],
          d = Math.hypot(b[0] - a.pos[0], b[1] - a.pos[1]);
        if (d <= remaining) {
          a.pos = b.slice();
          a.p.shift();
          remaining -= d;
        } else {
          a.pos = [
            a.pos[0] + ((b[0] - a.pos[0]) * remaining) / d,
            a.pos[1] + ((b[1] - a.pos[1]) * remaining) / d,
          ];
          remaining = 0;
        }
      }
    }
    active = active.filter((a) => !a.dead);
    if (t >= 0)
      out.push({
        t,
        agents: [...active, ...staff].map((a) => ({
          id: a.id,
          kind: a.kind,
          f: a.f,
          z: a.z,
          x: a.pos[0],
          y: a.pos[1],
        })),
      });
  }
  if (!out.length) throw Error("Use a visit duration in whole minutes.");
  runSummary = {
    syntheticVisitorsScheduled: queue.filter((a) => a.born >= 0).length,
    initialOccupants: out[0].agents.filter((a) => a.kind === "customer").length,
  };
  return out;
}
function rebuild() {
  try {
    $("error").textContent = "";
    const next = read();
    if (!Number.isInteger(next.dwell))
      throw Error("Use whole minutes for visit duration.");
    playing = false;
    $("play").textContent = "▶ Play simulation";
    const data = build(next);
    cfg = next;
    frames = data;
    at = 0;
    $("timeline").max = frames.length - 1;
    $("timeline").value = 0;
    $("splitLabel").textContent = `${cfg.split} / ${100 - cfg.split}`;
    $("staffCount").textContent = cfg.readings.reduce(
      (s, r) => s + r[4] + r[5],
      0,
    );
    draw();
  } catch (e) {
    $("error").textContent = e.message;
  }
}
function draw() {
  if (!frames.length) return;
  const frame = frames[at];
  $("clock").textContent = `${Math.floor(frame.t / 60)
    .toString()
    .padStart(
      2,
      "0",
    )}:${(frame.t % 60).toString().padStart(2, "0")} / ${cfg.duration}:00`;
  $("customers").textContent = frame.agents.filter(
    (a) => a.kind === "customer",
  ).length;
  for (let f = 0; f < 2; f++) {
    let canvas = $(f ? "mezzanine" : "ground"),
      ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1774, 887);
    ctx.drawImage(
      images[
        (f ? "mezzanine" : "ground") +
          ($("zones").checked ? "_zones" : "_clean")
      ],
      0,
      0,
      1774,
      887,
    );
    if ($("grid").checked) {
      ctx.strokeStyle = "#417d961f";
      ctx.fillStyle = "#567b8c";
      ctx.font = "17px monospace";
      ctx.lineWidth = 1;
      for (let x = 0; x < 1774; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 165);
        ctx.lineTo(x, 730);
        ctx.stroke();
        ctx.fillText(x, x + 2, 175);
      }
      for (let y = 200; y < 731; y += 100) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(1730, y);
        ctx.stroke();
        ctx.fillText(y, 45, y - 3);
      }
    }
    for (const a of frame.agents.filter((a) => a.f === f)) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.kind === "staff" ? 7 : 6, 0, Math.PI * 2);
      ctx.fillStyle = a.kind === "staff" ? "#f6abae" : "#a3defb";
      ctx.strokeStyle = a.kind === "staff" ? "#9e404d" : "#267898";
      ctx.lineWidth = 1.6;
      ctx.fill();
      ctx.stroke();
    }
    const aa = frame.agents.filter((a) => a.f === f);
    $(f ? "mcount" : "gcount").textContent =
      `${aa.filter((a) => a.kind === "customer").length} customers · ${aa.filter((a) => a.kind === "staff").length} staff`;
  }
}
function download(name, text, type = "text/plain") {
  const u = URL.createObjectURL(new Blob([text], { type })),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
$("apply").onclick = rebuild;
$("play").onclick = () => {
  playing = !playing;
  $("play").textContent = playing ? "Ⅱ Pause" : "▶ Play simulation";
};
$("reset").onclick = () => {
  playing = false;
  at = 0;
  $("timeline").value = 0;
  $("play").textContent = "▶ Play simulation";
  draw();
};
$("timeline").oninput = () => {
  at = Number($("timeline").value);
  draw();
};
$("zones").onchange = $("grid").onchange = draw;
$("csv").onclick = () => {
  let rows = [
    "provenance,seed,time_seconds,agent_id,role,floor,zone,x_px,y_px,x_normalized,y_normalized",
  ];
  for (const f of frames.filter((f) => f.t % 10 === 0))
    for (const a of f.agents)
      rows.push(
        [
          "synthetic",
          cfg.seed,
          f.t,
          a.id,
          a.kind,
          a.f ? "mezzanine" : "ground",
          names[a.z],
          a.x.toFixed(2),
          a.y.toFixed(2),
          (a.x / 1774).toFixed(6),
          (a.y / 887).toFixed(6),
        ].join(","),
      );
  download("orchard_synthetic_coordinates.csv", rows.join("\n"), "text/csv");
};
$("rates").onclick = () =>
  download(
    "orchard_modelled_activity.csv",
    "window_start_min,zone,events_per_window,source,ground_share,mezzanine_share\n" +
      model
        .map((m) =>
          [
            m.start,
            m.zone,
            m.events.toFixed(5),
            m.source,
            cfg.split / 100,
            1 - cfg.split / 100,
          ].join(","),
        )
        .join("\n"),
    "text/csv",
  );
$("config").onclick = () =>
  download(
    "orchard_scenario.json",
    JSON.stringify(
      {
        ...cfg,
        provenance: "synthetic scenario; not measured customer occupancy",
        coordinateSystem:
          "image pixels; origin top-left; x right, y down; 1774 by 887",
        runSummary,
      },
      null,
      2,
    ),
    "application/json",
  );
$("import").onchange = async (e) => {
  try {
    let c = JSON.parse(await e.target.files[0].text());
    if (
      !Array.isArray(c.readings) ||
      c.readings.length !== 3 ||
      c.readings.some((r) => !Array.isArray(r) || r.length !== 6)
    )
      throw Error("Expected three six-value reading rows.");
    fill(c);
    rebuild();
  } catch (e) {
    $("error").textContent = "Import failed: " + e.message;
  }
};
for (const id of ["ground", "mezzanine"])
  $(id).onmousemove = (e) => {
    const b = e.target.getBoundingClientRect();
    $("cursor").textContent =
      `${id}: x ${Math.round(((e.clientX - b.left) * 1774) / b.width)}, y ${Math.round(((e.clientY - b.top) * 887) / b.height)}`;
  };
function tick(ts) {
  if (playing && frames.length) {
    acc += ((ts - last) / 1000) * Number($("speed").value);
    if (acc >= 2) {
      at = Math.min(frames.length - 1, at + Math.floor(acc / 2));
      acc %= 2;
      $("timeline").value = at;
      draw();
      if (at === frames.length - 1) {
        playing = false;
        $("play").textContent = "▶ Play simulation";
      }
    }
  }
  last = ts;
  requestAnimationFrame(tick);
}
fill(defaults);
Promise.all(
  ["ground_clean", "ground_zones", "mezzanine_clean", "mezzanine_zones"].map(
    (k) =>
      new Promise((resolve, reject) => {
        let im = new Image();
        im.onload = () => {
          images[k] = im;
          resolve();
        };
        im.onerror = reject;
        im.src = "assets/" + k + ".jpg";
      }),
  ),
)
  .then(() => {
    rebuild();
    requestAnimationFrame(tick);
  })
  .catch(() => ($("error").textContent = "Floor plans could not load."));
