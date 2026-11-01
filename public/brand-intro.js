(() => {
  const intro = document.getElementById('brandIntro');
  if (!intro) return;
  const surfaces = ['gate', 'shell'].map(id => document.getElementById(id)).filter(Boolean);
  surfaces.forEach(surface => { surface.inert = true; });
  let closed = false;
  const dismiss = () => {
    if (closed) return;
    closed = true;
    surfaces.forEach(surface => { surface.inert = false; });
    // Do not remove a focused skip button until focus is returned to the page.
    if (intro.contains(document.activeElement)) document.activeElement.blur();
    intro.classList.add('is-leaving');
    setTimeout(() => intro.remove(), 320);
  };
  document.getElementById('skipIntro').addEventListener('click', dismiss);
  intro.addEventListener('keydown', event => { if (event.key === 'Escape') dismiss(); });
  setTimeout(dismiss, matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 2200);
})();
