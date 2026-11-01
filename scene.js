// TipkoFlip page: café scene. Without JS, or with reduced motion, the final picture stays as it is in the HTML.
(() => {
  const scene = document.getElementById("scene");
  if (!scene || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const $ = id => document.getElementById(id);
  const say = $("say"), input = $("input"), cursor = $("cursor");
  const ok = $("ok"), cup = $("cup"), arrows = $("arrows"), ripple = $("ripple"), head = $("themHead");
  const steps = [...$("steps").children], btn = $("pause");
  const tsp = [...say.querySelectorAll("text")];
  const lines = tsp.map(t => t.textContent);
  const full = lines.join(" ");
  let paused = false;

  btn.hidden = false;
  btn.addEventListener("click", () => {
    paused = !paused;
    btn.textContent = paused ? btn.dataset.play : btn.dataset.pause;
    btn.setAttribute("aria-pressed", String(paused));
  });

  const wait = async ms => {
    let t = 0;
    while (t < ms) {
      await new Promise(r => setTimeout(r, 40));
      if (!paused) t += 40;
    }
  };
  const step = i => steps.forEach((li, j) => li.classList.toggle("active", i === j));
  const instant = (el, css) => { el.style.transition = "none"; Object.assign(el.style, css); el.getBoundingClientRect(); el.style.transition = ""; };
  const restart = (el, cls) => { el.classList.remove(cls); el.getBoundingClientRect(); el.classList.add(cls); };

  function typed(n) {
    input.textContent = full.slice(0, n);
    let rem = n;
    lines.forEach((l, i) => {
      tsp[i].textContent = l.slice(0, Math.max(0, Math.min(l.length, rem)));
      rem -= l.length + 1;
    });
    cursor.setAttribute("x", 128 + input.getComputedTextLength() + 1);
  }

  async function loop() {
    scene.classList.add("playing");
    for (;;) {
      // start: empty field, display facing us
      instant(say, { transform: "rotate(0deg)" });
      instant(ok, { opacity: "0", transform: "scale(0.4)" });
      instant(cup, { opacity: "0", transform: "translate(0px, -150px)" });
      arrows.style.opacity = "0";
      typed(0);
      cursor.style.display = "";
      step(0);
      await wait(700);

      for (let n = 1; n <= full.length; n++) {
        typed(n);
        await wait(n === full.length ? 0 : (full[n - 1] === " " ? 140 : 75));
      }
      await wait(900);
      cursor.style.display = "none";

      // tap on the flip button, the text turns to the person across
      step(1);
      restart(ripple, "tap");
      await wait(350);
      arrows.style.opacity = "1";
      say.style.transition = "transform 1.6s cubic-bezier(.65,0,.35,1)";
      say.style.transform = "rotate(180deg)";
      await wait(1700);
      arrows.style.opacity = "0";
      await wait(300);

      // the waiter reads, nods and brings the coffee
      step(2);
      restart(head, "nod");
      await wait(500);
      Object.assign(ok.style, { opacity: "1", transform: "scale(1)" });
      await wait(900);
      Object.assign(cup.style, { opacity: "1", transform: "translate(0px, 0px)" });
      await wait(3200);
      ok.style.opacity = "0";
      await wait(500);
    }
  }
  loop();
})();
