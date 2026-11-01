function el(tag, attrs = {}, kids = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else n[k] = v;
    }
    kids.forEach((c) => n.appendChild(c));
    return n;
}

function openPhoto(src, name) {
    const box = el('div', { class: 'lightbox' });
    const big = el('img', { src, alt: name });
    const cap = el('div', { class: 'lb-cap', text: name });
    const close = el('button', { class: 'lb-close', text: '✕', title: 'Fermer' });

    const shut = () => {
        box.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => {
        if (e.key === 'Escape') shut();
    };

    close.onclick = shut;
    box.onclick = (e) => {
        if (e.target === box) shut();
    };
    document.addEventListener('keydown', onKey);

    box.appendChild(big);
    box.appendChild(cap);
    box.appendChild(close);
    document.body.appendChild(box);
    document.body.style.overflow = 'hidden';
}

function visual(g) {
    if (!g.imageUrl) return el('div', { class: 'emo', text: g.emoji });
    const img = el('img', {
        class: 'thumb zoomable',
        src: g.imageUrl,
        alt: g.name,
        loading: 'lazy',
    });
    img.onclick = () => openPhoto(g.imageUrl, g.name);
    return img;
}

function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.style.display = 'none'), 3200);
}

async function api(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
}