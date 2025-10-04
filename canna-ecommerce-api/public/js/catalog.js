// ===============================
// Helpers UI (Toasts & UX)
// ===============================
(function () {
  let toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container'; // usá tus estilos si ya existen
      Object.assign(toastContainer.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      });
      document.body.appendChild(toastContainer);
    }
  }

  function makeToastEl(message, type = 'ok') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // .toast, .toast.ok, .toast.err
    Object.assign(toast.style, {
      background: type === 'err' ? '#ffebee' : '#e8f5e9',
      color: type === 'err' ? '#b71c1c' : '#1b5e20',
      border: '1px solid rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${type === 'err' ? '#d32f2f' : '#2e7d32'}`,
      padding: '10px 12px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '360px'
    });

    const text = document.createElement('div');
    text.textContent = message;

    const close = document.createElement('button');
    close.textContent = '✕';
    Object.assign(close.style, {
      marginLeft: 'auto',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '16px',
      lineHeight: 1,
      color: 'inherit'
    });
    close.onclick = () => toast.remove();

    toast.appendChild(text);
    toast.appendChild(close);
    return toast;
  }

  function showToast(message, type = 'ok', ms = 2500) {
    ensureToastContainer();
    const el = makeToastEl(message, type);
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .25s ease';
      setTimeout(() => el.remove(), 250);
    }, ms);
  }

  // Exponer mínimamente
  window._uiToast = { show: showToast };
})();

// ===============================
// Carrito (API)
// ===============================
(async function () {
  async function ensureCart() {
    let cid = localStorage.getItem('cartId');
    if (!cid) {
      const res = await fetch('/api/carts', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.payload?._id) {
        throw new Error(data?.message || 'No se pudo crear el carrito');
      }
      cid = data.payload._id;
      localStorage.setItem('cartId', cid);
    }
    return cid;
  }

  async function addToCart(pid, qty = 1) {
    const cid = await ensureCart();
    // Aseguramos existencia y luego seteamos cantidad exacta si >1
    const addRes = await fetch(`/api/carts/${cid}/product/${pid}`, { method: 'POST' });
    if (!addRes.ok) {
      const err = await safeJson(addRes);
      throw new Error(err?.message || 'No se pudo agregar el producto');
    }
    if (qty > 1) {
      const putRes = await fetch(`/api/carts/${cid}/product/${pid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(qty) })
      });
      if (!putRes.ok) {
        const err = await safeJson(putRes);
        throw new Error(err?.message || 'No se pudo actualizar la cantidad');
      }
    }
    return cid;
  }

  async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
  }

  // ===============================
  // Eventos: agregar al carrito desde cards y detalle
  // ===============================
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pid = btn.dataset.pid;
      // si estamos en /products/:pid puede existir #qty
      const qtyInput = document.getElementById('qty');
      const qty = qtyInput ? Math.max(parseInt(qtyInput.value) || 1, 1) : 1;
      btn.disabled = true;

      try {
        const cid = await addToCart(pid, qty);
        window._uiToast.show('✅ Producto agregado. Ver carrito → /carts/' + cid, 'ok');
      } catch (err) {
        console.error(err);
        window._uiToast.show('❌ ' + (err.message || 'No se pudo agregar'), 'err');
      } finally {
        btn.disabled = false;
      }
    });
  });

  // ===============================
  // Mejoras UX de filtros/búsqueda (vista /products)
  // ===============================
  const filtersForm = document.getElementById('filters');
  const search = document.getElementById('search');

  if (filtersForm && search) {
    filtersForm.addEventListener('submit', (e) => {
      // Si hay texto, usarlo como query libre
      const text = (search.value || '').trim();
      if (text) {
        const url = new URL(window.location.href);
        url.searchParams.set('query', text);
        const sortSel = filtersForm.querySelector('select[name="sort"]');
        const limitSel = filtersForm.querySelector('select[name="limit"]');
        if (sortSel?.value) url.searchParams.set('sort', sortSel.value);
        if (limitSel?.value) url.searchParams.set('limit', limitSel.value);
        e.preventDefault();
        window.location.href = url.toString();
      }
    });

    // Chips de categoría: mantener foco visual sin romper el submit
    const chips = filtersForm.querySelectorAll('.chips .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }
})();
