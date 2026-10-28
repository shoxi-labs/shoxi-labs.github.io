// Home: TypeTalk on an upright phone. Messages are typed in the field, appear on the display,
// then turn to face the person across; one after another, only while the phone is on screen.
// Without JS, or with reduced motion, the first message stays turned, as in the HTML.
(() => {
  const fig = document.getElementById("phone");
  if (!fig || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const shown = fig.querySelector(".display p"), field = fig.querySelector(".field");
  const btn = document.getElementById("phonePause");
  const messages = fig.dataset.messages.split("|");
  let paused = false, visible = false;

  btn.hidden = false;
  btn.addEventListener("click", () => {
    paused = !paused;
    btn.textContent = paused ? btn.dataset.play : btn.dataset.pause;
    btn.setAttribute("aria-pressed", String(paused));
  });
  new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); }, { threshold: 0.3 }).observe(fig);

  // time passes only while the phone is on screen and not paused
  const wait = async ms => {
    let t = 0;
    while (t < ms) {
      await new Promise(r => setTimeout(r, 40));
      if (!paused && visible) t += 40;
    }
  };
  const set = (el, css, transition) => { el.style.transition = transition; Object.assign(el.style, css); };

  async function loop() {
    for (let i = 0; ; i = (i + 1) % messages.length) {
      const msg = messages[i];
      set(shown, { transform: "rotate(0deg)", opacity: "1" }, "none");
      shown.textContent = ""; field.textContent = "";
      await wait(500);
      for (let n = 1; n <= msg.length; n++) {
        shown.textContent = field.textContent = msg.slice(0, n);
        await wait(msg[n - 1] === " " ? 110 : 55);
      }
      await wait(900);
      set(shown, { transform: "rotate(180deg)" }, "transform 1.4s cubic-bezier(.65,0,.35,1)");
      await wait(1400 + 2800);
      set(shown, { opacity: "0" }, "opacity .4s");
      field.style.transition = "opacity .4s"; field.style.opacity = "0";
      await wait(450);
      shown.textContent = ""; field.textContent = "";
      set(field, { opacity: "1" }, "none");
    }
  }
  loop();
})();
