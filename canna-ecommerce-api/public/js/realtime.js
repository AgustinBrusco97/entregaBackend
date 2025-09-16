const socket = io();

function ensureToastContainer() {
  let c = document.querySelector('.toast-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(msg, type = 'info', ms = 2200) {
  const c = ensureToastContainer();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<div class="msg">${msg}</div>`;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('hide');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, ms);
}

async function fetchProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.products)) return data.products;
  return [];
}

function cardHTML(p) {
  const id = p.id || p._id || '';
  const img = (p.thumbnails && p.thumbnails[0]) ? p.thumbnails[0] : '';
  const titleInitial = String(p.title || '?').charAt(0);
  const thumb = img
    ? `<img src="${img}" alt="" onerror="this.outerHTML='<div class=&quot;placeholder&quot;>${titleInitial}</div>'">`
    : `<div class="placeholder">${titleInitial}</div>`;
  const desc = p.description ? p.description : '';
  const code = p.code ? p.code : '';
  return `
    <article class="card" data-title="${p.title || ''}" data-category="${p.category || ''}">
      <div class="thumb">
        ${thumb}
        <span class="badge">${p.category || ''}</span>
      </div>
      <div class="card-body">
        <h3 class="title">${p.title || ''}</h3>
        <p class="desc">${desc}</p>
        <div class="meta">
          <span class="price">$${p.price ?? ''}</span>
          <span class="stock">Stock: ${p.stock ?? ''}</span>
        </div>
        <code class="sku">${code}</code>
        <div class="actions">
          <button data-action="del" data-id="${id}" class="danger">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

async function renderGrid() {
  const grid = document.getElementById('rt-grid') || document.getElementById('products-list');
  if (!grid) return;
  grid.innerHTML = '<div class="skeleton-grid"></div>';
  try {
    const items = await fetchProducts();
    if (!items.length) {
      grid.innerHTML = '<p class="empty">No hay productos</p>';
      return;
    }
    grid.innerHTML = items.map(cardHTML).join('');
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="empty">Error cargando productos</p>';
  }
}

renderGrid();

socket.on('products:changed', () => {
  renderGrid();
  showToast('Productos actualizados', 'info', 1400);
});

const createForm = document.getElementById('ws-create-form');
const deleteForm = document.getElementById('ws-delete-form');

function defaultSpecs(category) {
  switch (category) {
    case 'flowers': return { strain: 'Custom', thc: 20, cbd: 0.3, aroma: 'terroso', weight: 3.5 };
    case 'extracts': return { type: 'BHO', thc: 85, cbd: 1, quantity: 1 };
    case 'edibles': return { thcMg: 10, units: 1 };
    case 'accessories': return { type: 'genérico', material: 'aluminio', compatibility: 'universal' };
    default: return {};
  }
}

if (createForm) {
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(createForm);
    const category = fd.get('category');
    const specsText = fd.get('specs');
    let specs = {};
    if (specsText && specsText.trim()) {
      try { specs = JSON.parse(specsText); } catch { showToast('Specs debe ser JSON válido', 'error'); return; }
    } else {
      specs = defaultSpecs(category);
    }
    const thumbs = (fd.get('thumbnails') || '').split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      title: fd.get('title'),
      description: fd.get('description'),
      code: fd.get('code'),
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
      category,
      status: true,
      specs,
      ...(thumbs.length ? { thumbnails: thumbs } : {})
    };
    socket.emit('ws:createProduct', payload, (resp) => {
      if (resp?.ok) showToast('Producto creado', 'success');
      else showToast(resp?.error || 'Error creando producto', 'error');
    });
    createForm.reset();
  });
}

if (deleteForm) {
  deleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(deleteForm);
    const id = fd.get('id');
    socket.emit('ws:deleteProduct', id, (resp) => {
      if (resp?.ok) showToast('Producto eliminado', 'success');
      else showToast(resp?.error || 'Error eliminando producto', 'error');
    });
    deleteForm.reset();
  });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="del"]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  socket.emit('ws:deleteProduct', id, (resp) => {
    if (resp?.ok) showToast('Producto eliminado', 'success');
    else showToast(resp?.error || 'Error eliminando producto', 'error');
  });
});

socket.on('ws:error', (msg) => showToast(msg || 'Error', 'error'));

socket.on('users:count', (n) => {
  const el = document.getElementById('online');
  if (el) el.textContent = String(n);
});
