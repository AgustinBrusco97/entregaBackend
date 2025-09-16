(function () {
  const grid = document.getElementById('catalog-grid');
  const chips = document.getElementById('cat-filter');
  const search = document.getElementById('search');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.card'));
  const norm = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

  let activeCat = 'all';
  let query = '';

  function apply() {
    const nq = norm(query);
    items.forEach((card) => {
      const cat = card.dataset.category || '';
      const title = card.dataset.title || '';
      const hitCat = activeCat === 'all' || cat === activeCat;
      const hitText = !nq || norm(title).includes(nq);
      card.classList.toggle('hidden', !(hitCat && hitText));
    });
  }

  function debounce(fn, delay = 220) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const applyDebounced = debounce(apply, 220);

  if (chips) {
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      activeCat = btn.dataset.cat;
      chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      apply();
    });
  }

  if (search) {
    search.addEventListener('input', (e) => {
      query = e.target.value || '';
      applyDebounced();
    });
  }

  apply();
})();
