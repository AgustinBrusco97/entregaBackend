(function () {
  // UI toasts (usamos los del catalog si existen)
  const toast = (msg, type='ok') => {
    if (window._uiToast?.show) return window._uiToast.show(msg, type);
    alert(msg);
  };

  const socket = io();

  socket.on('connect', () => {
    console.log('🔌 WS conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 WS desconectado');
  });

  // Cuando el server nos avisa que cambiaron productos → refrescamos
  socket.on('products:changed', async () => {
    await refreshGrid();
  });

  // Render del grid (pide a la API y rehidrata)
  async function refreshGrid() {
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      const list = data?.payload || [];
      const grid = document.getElementById('rt-grid');
      if (!grid) return;

      grid.innerHTML = list.map(p => `
        <article class="card" data-id="${p._id}">
          <div class="thumb">
            ${p.thumbnails?.[0]
              ? `<img src="${p.thumbnails[0]}" alt="" onerror="this.outerHTML='<div class=&quot;placeholder&quot;>${(p.title||'')[0]||''}</div>'">`
              : `<div class="placeholder">${(p.title||'')[0]||''}</div>`}
            <span class="badge">${p.category || ''}</span>
          </div>
          <div class="card-body">
            <h3 class="title">${p.title || ''}</h3>
            <p class="desc">${p.description || ''}</p>
            <div class="meta">
              <span class="price">$ ${p.price ?? 0}</span>
              <span class="stock">Stock: ${p.stock ?? 0}</span>
            </div>
            ${p.code ? `<code class="sku">${p.code}</code>` : ''}
            <div class="actions">
              <button class="danger ws-delete" data-id="${p._id}">Eliminar</button>
            </div>
          </div>
        </article>
      `).join('');

      bindDeleteButtons();
    } catch (err) {
      console.error(err);
      toast('❌ Error refrescando lista', 'err');
    }
  }

  function bindDeleteButtons() {
    document.querySelectorAll('.ws-delete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        socket.emit('ws:deleteProduct', id, (ack) => {
          if (ack?.ok) {
            toast('🗑️ Producto eliminado', 'ok');
          } else {
            toast('❌ ' + (ack?.error || 'Error eliminando'), 'err');
          }
        });
      };
    });
  }

  // Form de creación por WS
  const form = document.getElementById('ws-create-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        title: fd.get('title'),
        description: fd.get('description') || '',
        price: Number(fd.get('price')),
        category: fd.get('category'),
        stock: Number(fd.get('stock')),
        code: fd.get('code') || undefined,
        thumbnails: fd.get('thumbnail') ? [fd.get('thumbnail')] : []
      };

      socket.emit('ws:createProduct', payload, (ack) => {
        if (ack?.ok) {
          toast('✅ Producto creado', 'ok');
          form.reset();
        } else {
          toast('❌ ' + (ack?.error || 'Error creando'), 'err');
        }
      });
    };
  }

  // primer render
  refreshGrid();
})();
