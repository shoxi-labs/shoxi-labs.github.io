// TypeTalk page: counter scene (split screen, conversation both ways).
// Without JS, or with reduced motion, the final picture stays as it is in the HTML.
(() => {
  const fig = document.getElementById("scene-both");
  if (!fig || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const k = name => fig.querySelector(`[data-k="${name}"]`);
  const say = [...k("say").children], heard = [...k("heard").children], waves = [...k("waves").children];
  const input = k("input"), cursor = k("cursor"), head = k("head"), listen = k("listen");
  const card = k("card"), box = k("box"), btn = k("pause");
  const lis = [...k("steps").children];
  // the text comes from the HTML (final picture), so HR and EN pages share this script
  const typed = say.map(t => t.textContent);
  const heardLines = heard.map(t => t.textContent.split(" "));
  const words = heardLines.flat();
  const full = typed.join(" ");

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
    return p => { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; X(m) < p ? lo = m : hi = m; } return Y((lo + hi) / 2); };
  }
  const out = bezier(.2, .8, .2, 1), inOut = bezier(.65, 0, .35, 1);
  const prog = (t, s, d) => Math.min(1, Math.max(0, (t - s) / d));

  const charAt = []; let tc = 700;
  for (let n = 1; n <= full.length; n++) { charAt.push(tc); tc += full[n - 1] === " " ? 140 : 75; }
  const tStep1 = charAt[charAt.length - 1] + 1500;   // read (nod), then answer out loud
  const tStep2 = tStep1 + 3000;                      // ID card up, parcel down
  const tBox = tStep2 + 1200;
  const duration = tBox + 900 + 2600;

  function seek(t) {
    const n = charAt.filter(c => t >= c).length;
    input.textContent = full.slice(0, n);
    let rem = n;
    typed.forEach((l, i) => { say[i].textContent = l.slice(0, Math.max(0, Math.min(l.length, rem))); rem -= l.length + 1; });
    cursor.setAttribute("x", 120 + input.getComputedTextLength() + 1);
    cursor.setAttribute("opacity", t >= 500 && t < tStep1 - 600 && Math.floor((t - 500) / 500) % 2 === 0 ? 1 : 0);

    const np = prog(t, tStep1 - 1000, 900);
    head.setAttribute("transform", `translate(0 ${np > 0 && np < 1 ? 6 * Math.sin(2 * Math.PI * np) ** 2 : 0})`);

    const speaking = t >= tStep1 && t < tStep1 + 2400;
    waves.forEach((w, i) => {
      const ph = ((t - tStep1) / 900 - i * 0.18) % 1;
      w.setAttribute("opacity", speaking ? 0.25 + 0.75 * Math.max(0, Math.sin(Math.PI * ph)) : 0);
    });
    const listening = t >= tStep1 - 200 && t < tStep1 + 2700;
    listen.setAttribute("opacity", listening ? 0.55 + 0.45 * Math.sin(t / 160) : 0);

    const per = 2000 / words.length;
    const shown = words.filter((_, i) => t >= tStep1 + 300 + i * per).length;
    let w = 0;
    heardLines.forEach((line, i) => {
      heard[i].textContent = line.slice(0, Math.max(0, Math.min(line.length, shown - w))).join(" ");
      w += line.length;
    });

    card.setAttribute("transform", `translate(0 ${-230 * inOut(prog(t, tStep2, 900))})`);
    card.setAttribute("opacity", 1 - prog(t, tStep2 + 650, 250));
    box.setAttribute("opacity", prog(t, tBox, 250));
    box.setAttribute("transform", `translate(0 ${-210 * (1 - out(prog(t, tBox, 900)))})`);

    const active = t < tStep1 ? 0 : t < tStep2 ? 1 : 2;
    lis.forEach((li, i) => li.classList.toggle("active", i === active));
  }

  let paused = false, visible = false, t = 0, last = null;
  btn.hidden = false;
  btn.addEventListener("click", () => {
    paused = !paused;
    btn.textContent = paused ? btn.dataset.play : btn.dataset.pause;
    btn.setAttribute("aria-pressed", String(paused));
  });
  // runs only while on screen
  new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); }).observe(fig);

  fig.classList.add("playing");
  const frame = now => {
    if (last !== null && !paused && visible) t = (t + now - last) % duration;
    last = now;
    seek(t);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
