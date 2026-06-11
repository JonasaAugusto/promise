/* ================================================================
   PROMISE — main.js
   Cursor | Hero Particles | Scroll Reveal | Typewriter | Parallax
   ================================================================ */

/* ---- Cursor personalizado ---- */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
}, { passive: true });

function addHoverTarget(selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}

addHoverTarget('button, a, .game-heart-el, .victory-back-btn');


/* ---- Hero Particles ---- */
const heroParticlesEl = document.getElementById('hero-particles');

const HEART_SYMBOLS = ['❤', '♥', '💗', '💕', '💖', '🌹'];
const RED_SHADES = [
    '#e63950', '#ff6b8a', '#ff4d6d', '#c9184a',
    '#c9a84c', '#e8c97a', '#ffb3c6', '#ff85a1'
];

function createHeroParticle() {
    if (!heroParticlesEl) return;

    const el = document.createElement('span');
    el.className = 'hero-particle';
    el.textContent = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];

    const size    = Math.random() * 22 + 8;
    const opacity = (Math.random() * 0.45 + 0.1).toFixed(2);
    const dur     = Math.random() * 14 + 9;
    const delay   = Math.random() * 10;
    const left    = Math.random() * 100;
    const color   = RED_SHADES[Math.floor(Math.random() * RED_SHADES.length)];

    el.style.cssText = `
        left: ${left}%;
        font-size: ${size}px;
        color: ${color};
        --op: ${opacity};
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
    `;

    heroParticlesEl.appendChild(el);

    // Recycle after animation
    const totalMs = (dur + delay) * 1000;
    setTimeout(() => {
        el.remove();
        createHeroParticle();
    }, totalMs + 200);
}

// Seed initial particles
for (let i = 0; i < 30; i++) createHeroParticle();


/* ---- Música de fundo ----
   iOS só permite tocar áudio a partir de um gesto da usuária, então a
   música começa no clique de "Abrir a carta" (ou ao destravar o site). */
const bgMusic  = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let musicStarted = false;

function startMusic() {
    if (musicStarted || !bgMusic) return;

    bgMusic.volume = 0.55; // iOS ignora, mas vale para desktop
    const attempt = bgMusic.play();
    if (!attempt) return;

    attempt.then(() => {
        musicStarted = true;
        if (musicBtn) {
            musicBtn.classList.remove('hidden');
            musicBtn.textContent = '🎵';
        }
    }).catch(() => {
        // Arquivo ausente ou bloqueado: segue sem música, sem erro na tela
    });
}

if (musicBtn && bgMusic) {
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().catch(() => {});
            musicBtn.textContent = '🎵';
            musicBtn.classList.remove('muted');
        } else {
            bgMusic.pause();
            musicBtn.textContent = '🔇';
            musicBtn.classList.add('muted');
        }
    });
}


/* ---- Trava secreta ---- */
const lockScreen = document.getElementById('lock-screen');
const LOCK_KEY   = 'promise_unlocked';

function normalizeAnswer(str) {
    return str.trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

(function initLock() {
    const secret = window.CONFIG?.PERGUNTA_SECRETA;
    // Aceita lista de variações (respostas) ou string única (resposta)
    const variants = [].concat(secret?.respostas ?? secret?.resposta ?? [])
                       .filter(Boolean).map(normalizeAnswer);
    const enabled = variants.length > 0 &&
                    localStorage.getItem(LOCK_KEY) !== 'true';
    if (!enabled || !lockScreen) return;

    document.getElementById('lock-question').textContent = secret.pergunta;
    lockScreen.classList.remove('hidden');
    document.body.classList.add('locked');

    const input    = document.getElementById('lock-input');
    const errorEl  = document.getElementById('lock-error');

    function tryUnlock() {
        const typed = normalizeAnswer(input.value);
        const ok = variants.some(v => typed === v || typed.includes(v));
        if (ok) {
            localStorage.setItem(LOCK_KEY, 'true');
            lockScreen.classList.add('unlocking');
            document.body.classList.remove('locked');
            setTimeout(() => lockScreen.classList.add('hidden'), 900);
        } else {
            errorEl.textContent = secret.erroMensagem;
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }
    }

    document.getElementById('lock-btn').addEventListener('click', tryUnlock);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryUnlock();
    });
})();


/* ---- Botão "Abrir a carta": ripple + música + smooth scroll ----
   Só "click" — no iOS o toque dispara click; ouvir touchstart junto
   causava ripple e scroll duplicados. O clique é o gesto que o iOS
   exige para liberar o áudio, então a música começa aqui. */
const openBtn   = document.getElementById('openBtn');
const OPENED_KEY = 'promise_opened';

// Se ela já abriu a carta antes, não precisa clicar de novo ao recarregar
if (localStorage.getItem(OPENED_KEY) === 'true') {
    document.body.classList.remove('sealed');
}

if (openBtn) {
    openBtn.addEventListener('click', function (e) {
        // Ripple
        const rect   = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size   = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width  = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top    = (e.clientY - rect.top  - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);

        startMusic();

        // Quebra o "selo": a carta passa a existir na página
        document.body.classList.remove('sealed');
        try { localStorage.setItem(OPENED_KEY, 'true'); } catch (err) {}

        // Scroll to letter (scrollIntoView já força o layout atualizado)
        const letter = document.getElementById('letter');
        if (letter) letter.scrollIntoView({ behavior: 'smooth' });
    });
}


/* ---- Botões de WhatsApp ---- */
(function initWhatsApp() {
    const numero = window.CONFIG?.WHATSAPP_NUMERO;
    if (!numero) return;

    const msg = encodeURIComponent(window.CONFIG.WHATSAPP_MENSAGEM || '❤');
    const url = `https://wa.me/${numero}?text=${msg}`;

    ['whatsapp-btn-letter', 'whatsapp-btn-victory'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.href = url;
            btn.classList.remove('hidden');
        }
    });
})();


/* ---- Scroll Reveal (IntersectionObserver) ---- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');

        // Trigger typewriter when code section enters view
        if (entry.target.id === 'typewriter-section') {
            startTypewriter();
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ---- Typewriter Effect ---- */
const TYPEWRITER_CONTENT =
    'Esse site é uma linha de código que escrevi com as minhas mãos, ' +
    'mas a história que ele guarda está sendo escrita por Deus no nosso coração. ' +
    'Estamos na fase de alinhar nossos propósitos, de aprender com os erros e de entender ' +
    'que o amor verdadeiro exige maturidade de ambos os lados para proteger o que é sagrado.';

let typewriterStarted = false;
let typewriterDone    = false;

function startTypewriter() {
    if (typewriterStarted) return;
    typewriterStarted = true;

    const target     = document.getElementById('typewriter-text');
    const typeCursor = document.getElementById('type-cursor');
    if (!target) return;

    let i = 0;
    const speed = 26; // ms per character

    function finish() {
        typewriterDone = true;
        target.textContent = TYPEWRITER_CONTENT;
        if (typeCursor) {
            setTimeout(() => { typeCursor.style.display = 'none'; }, 1500);
        }
    }

    function type() {
        if (typewriterDone) return; // completado por toque
        if (i < TYPEWRITER_CONTENT.length) {
            target.textContent += TYPEWRITER_CONTENT.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            finish();
        }
    }

    // Toque no card completa o texto na hora (são ~9s digitando)
    const card = document.querySelector('#typewriter-section .letter-card');
    if (card) {
        card.addEventListener('click', () => {
            if (!typewriterDone) finish();
        });
    }

    // Small delay for dramatic effect
    setTimeout(type, 400);
}


/* ---- Parallax: hero content fades on scroll ---- */
const heroSection  = document.getElementById('hero');
const heroContent  = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
    if (!heroContent || !heroSection) return;
    const scrollY  = window.scrollY;
    const heroH    = heroSection.offsetHeight;
    const progress = Math.min(scrollY / heroH, 1);

    heroContent.style.transform = `translateY(${scrollY * 0.28}px)`;
    heroContent.style.opacity   = (1 - progress * 1.4).toFixed(3);
}, { passive: true });


/* ---- Divider Decorative Hearts ---- */
const dividerEl = document.getElementById('divider-hearts');
if (dividerEl) {
    const items = [
        { sym: '❤', s: 1.1 }, { sym: '♥', s: 0.75 }, { sym: '❤', s: 0.9 },
        { sym: '🌹', s: 1.0 }, { sym: '❤', s: 1.3 }, { sym: '♥', s: 0.8 },
        { sym: '❤', s: 0.95 }
    ];
    items.forEach(({ sym, s }, i) => {
        const span = document.createElement('span');
        span.textContent = sym;
        const delay = (i * 0.12).toFixed(2);
        span.style.cssText = `
            font-size: ${s}rem;
            color: hsl(${345 + Math.random() * 25}deg, 70%, ${50 + Math.random() * 20}%);
            opacity: ${0.3 + Math.random() * 0.5};
            display: inline-block;
            animation: heartBeat ${1.2 + Math.random() * 0.6}s ease-in-out ${delay}s infinite;
        `;
        dividerEl.appendChild(span);
    });
}
