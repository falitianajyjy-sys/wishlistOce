const TK = 'wl_admin_token';
let token = localStorage.getItem(TK) || '';
const auth = () => ({ 'x-admin-token': token });

function startEdit(g, info) {
    const old = info.querySelector('.m');
    const input = el('input', {
        value: g.description || '',
        placeholder: 'Description',
        maxLength: 500,
    });
    const save = el('button', { text: 'OK' });
    const cancel = el('button', { class: 'ghost', text: 'Annuler' });
    const row = el('div', { class: 'row' }, [input, save, cancel]);
    row.style.marginTop = '6px';
    if (old) old.hidden = true;
    info.appendChild(row);
    input.focus();

    cancel.onclick = () => {
        row.remove();
        if (old) old.hidden = false;
    };

    const submit = async () => {
        save.disabled = true;
        try {
            await api('/api/gifts/' + g.id, {
                method: 'PATCH',
                headers: auth(),
                body: JSON.stringify({ description: input.value }),
            });
            toast('Description modifiée ✨');
            load();
        } catch (e) {
            toast(e.message);
            save.disabled = false;
        }
    };

    save.onclick = submit;
    input.onkeydown = (ev) => {
        if (ev.key === 'Enter') submit();
        if (ev.key === 'Escape') cancel.onclick();
    };
}

async function load() {
    try {
        const gifts = await api('/api/admin/gifts', { headers: auth() });
        document.getElementById('login').hidden = true;
        document.getElementById('panel').hidden = false;

        const taken = gifts.filter((g) => g.claimed).length;
        document.getElementById('count').textContent =
            `${gifts.length} cadeau${gifts.length > 1 ? 'x' : ''} · ${taken} réservé${taken > 1 ? 's' : ''}`;

        const list = document.getElementById('list');
        list.innerHTML = '';
        gifts.forEach((g) => {
            const c = el('div', { class: 'card' });
            c.appendChild(visual(g));
            const info = el('div', { class: 'grow' }, [el('div', { class: 't', text: g.name })]);
            if (g.description) info.appendChild(el('div', { class: 'm', text: g.description }));
            c.appendChild(info);
            if (g.claimed) c.appendChild(el('span', { class: 'pill', text: 'Réservé' }));

            const edit = el('button', { class: 'ghost', text: '✏️', title: 'Modifier la description' });
            edit.onclick = () => startEdit(g, info);
            c.appendChild(edit);

            const d = el('button', { class: 'ghost', text: '✕', title: 'Supprimer' });
            d.onclick = async () => {
                if (!confirm(`Supprimer « ${g.name} » ?`)) return;
                try {
                    await api('/api/gifts/' + g.id, { method: 'DELETE', headers: auth() });
                } catch (e) {
                    toast(e.message);
                }
                load();
            };
            c.appendChild(d);
            list.appendChild(c);
        });
    } catch (e) {
        localStorage.removeItem(TK);
        document.getElementById('login').hidden = false;
        document.getElementById('panel').hidden = true;
        if (token) toast('Jeton invalide.');
    }
}

document.getElementById('ok').onclick = () => {
    token = document.getElementById('tok').value.trim();
    localStorage.setItem(TK, token);
    load();
};

document.getElementById('add').onclick = async () => {
    const name = document.getElementById('gn').value.trim();
    if (!name) return toast('Donne un nom au cadeau.');

    const form = new FormData();
    form.append('name', name);
    form.append('emoji', document.getElementById('ge').value.trim());
    form.append('description', document.getElementById('gd').value.trim());
    const file = document.getElementById('gi').files[0];
    if (file) form.append('image', file);

    const btn = document.getElementById('add');
    btn.disabled = true;
    try {
        await api('/api/gifts', { method: 'POST', headers: auth(), body: form });
        ['gn', 'ge', 'gd', 'gi'].forEach((i) => (document.getElementById(i).value = ''));
    } catch (e) {
        toast(e.message);
    }
    btn.disabled = false;
    load();
};

if (token) load();