const KEY = 'wl_guest_token';
let me = localStorage.getItem(KEY);
if (!me) {
    me = crypto.randomUUID();
    localStorage.setItem(KEY, me);
}

let lastSig = '';
let carouselIdx = 0;

async function act(g, btn) {
    btn.disabled = true;
    try {
        await api(`/api/gifts/${g.id}/${g.mine ? 'release' : 'claim'}`, {
            method: 'POST',
            body: JSON.stringify({ token: me }),
        });
        toast(g.mine ? 'Cadeau remis dans la liste.' : 'Merci ! Cadeau réservé 🎁');
    } catch (e) {
        toast(e.message);
    }
    load(true);
}

/* Carte simple : "Mon choix" */
function card(g) {
    const c = el('div', { class: 'card mine' });
    c.appendChild(visual(g));
    const info = el('div', { class: 'grow' }, [el('div', { class: 't', text: g.name })]);
    if (g.description) info.appendChild(el('div', { class: 'm', text: g.description }));
    c.appendChild(info);
    const b = el('button', { class: 'ghost', text: 'Annuler' });
    b.onclick = () => act(g, b);
    c.appendChild(b);
    return c;
}

/* Diapositive du carrousel */
function slideVisual(g) {
    if (!g.imageUrl) return el('div', { class: 'slide-emo', text: g.emoji });
    const img = el('img', {
        class: 'slide-img zoomable',
        src: g.imageUrl,
        alt: g.name,
        loading: 'lazy',
        draggable: false,
    });
    img.onclick = () => openPhoto(g.imageUrl, g.name);
    return img;
}

function slide(g) {
    const s = el('article', { class: 'slide' });
    s.appendChild(slideVisual(g));
    s.appendChild(el('div', { class: 't', text: g.name }));
    if (g.description) s.appendChild(el('div', { class: 'm', text: g.description }));
    const b = el('button', { text: 'Je l’offre' });
    b.onclick = () => act(g, b);
    s.appendChild(b);
    return s;
}

function carousel(gifts) {
    const node = el('div', { class: 'carousel' });
    const track = el('div', { class: 'track' });
    gifts.forEach((g) => track.appendChild(slide(g)));
    const slides = Array.from(track.children);

    const prev = el('button', { class: 'nav prev', text: '‹', title: 'Précédent' });
    const next = el('button', { class: 'nav next', text: '›', title: 'Suivant' });
    const dots = el('div', { class: 'dots' });

    const current = () => {
        let best = 0;
        let dist = Infinity;
        slides.forEach((s, i) => {
            const d = Math.abs(s.offsetLeft - track.scrollLeft);
            if (d < dist) {
                dist = d;
                best = i;
            }
        });
        return best;
    };

    const go = (i) => {
        const k = Math.max(0, Math.min(i, slides.length - 1));
        track.scrollTo({ left: slides[k].offsetLeft, behavior: 'smooth' });
    };

    const dotEls = slides.map((_, i) => {
        const d = el('button', { class: 'dot', title: 'Cadeau ' + (i + 1) });
        d.onclick = () => go(i);
        dots.appendChild(d);
        return d;
    });

    const sync = () => {
        const i = current();
        carouselIdx = i;
        dotEls.forEach((d, k) => d.classList.toggle('on', k === i));
        prev.disabled = i === 0;
        next.disabled = i === slides.length - 1;
    };

    prev.onclick = () => go(current() - 1);
    next.onclick = () => go(current() + 1);
    track.addEventListener('scroll', () => requestAnimationFrame(sync));

    node.appendChild(track);
    if (slides.length > 1) {
        node.appendChild(prev);
        node.appendChild(next);
        node.appendChild(dots);
    }

    const restore = () => {
        const i = Math.min(carouselIdx, slides.length - 1);
        track.scrollLeft = slides[i].offsetLeft;
        sync();
    };

    return { node, restore };
}

async function load(force = false) {
    try {
        const gifts = await api('/api/gifts?me=' + encodeURIComponent(me));
        const sig = JSON.stringify(gifts);
        if (!force && sig === lastSig) return;
        lastSig = sig;

        const mine = gifts.filter((g) => g.mine);
        const free = gifts.filter((g) => !g.mine);

        const mineBox = document.getElementById('mine');
        mineBox.innerHTML = '';
        if (mine.length) {
            mineBox.appendChild(el('h2', { text: 'Mon choix' }));
            mine.forEach((g) => mineBox.appendChild(card(g)));
        }

        const freeBox = document.getElementById('free');
        freeBox.innerHTML = '';

        if (mine.length) {
            freeBox.appendChild(
                el('div', {
                    class: 'note',
                    text: 'Merci ! 🎉 Tu as choisi ton cadeau. Pour en prendre un autre, annule d’abord ton choix.',
                })
            );
            return;
        }

        freeBox.appendChild(el('h2', { text: 'Encore disponibles' }));
        if (!free.length) {
            freeBox.appendChild(
                el('div', { class: 'empty', text: 'Tous les cadeaux ont été choisis. Merci à tous ! 🎉' })
            );
            return;
        }

        const { node, restore } = carousel(free);
        freeBox.appendChild(node);
        restore();
    } catch (e) {
        toast('Connexion perdue, réessaie.');
    }
}

load();
setInterval(load, 10000);

const stage = document.getElementById('stage');
const openBtn = document.getElementById('openCard');

openBtn.onclick = () => {
    openBtn.disabled = true;
    stage.classList.add('open');
    setTimeout(() => {
        document.getElementById('cover').hidden = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1150);
};