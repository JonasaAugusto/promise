/* ================================================================
   PROMISE — game.js
   Mini-jogo: Caça aos Corações
   ================================================================ */

/* ---- As 10 Razões Reais ---- */
const REASONS = [
    "Por me fazer entender que, para mim, curtir a vida só com você já basta",
    "Pela sua resposta de oração que quebrantou o coração do meu pai",
    "Porque o meu lugar favorito no mundo é onde você estiver, sabendo que poderia estar",
    "Pelas madrugadas em que dobramos os joelhos e jejuamos pelo nosso futuro",
    "Por me curar do medo de ser segunda opção e me fazer sentir único",
    "Pela sua dedicação diária em treinar, estudar e evoluir comigo",
    "Por provar que o amor real é forte o suficiente para fazer tudo novo",
    "Pelo seu olhar que me acalma e me tira da minha zona de conforto",
    "Por escolher viver um amor com lógica, profundidade e olho no olho",
    "Porque, mesmo nas tempestades, eu nunca deixei de te amar, minha Princesa"
];

/* ---- Variação de emojis e tamanhos ---- */
const HEART_EMOJIS = ['❤', '🩷', '💗', '💕', '💖', '❤', '♥', '❤'];
const HEART_SIZES  = ['2.2rem', '2.6rem', '3rem', '3.5rem', '2rem', '2.8rem'];

/* ---- Estado do jogo ---- */
let collectedCount   = 0;
let collectedIndices = new Set(); // índices de razões já coletadas
let collectedOrder   = [];        // ordem em que foram coletadas (p/ salvar)
let inPlayIndices    = new Set(); // índices atualmente visíveis como corações
let activeHeartCount = 0;
let gameStarted      = false;
let gameFinished     = false;

const MAX_ACTIVE   = 3;
const TOTAL        = REASONS.length;
const PROGRESS_KEY = 'promise_collected';

/* ---- Elementos DOM ---- */
const gameContainer = document.getElementById('game-container');
const counterText   = document.getElementById('counter-text');
const reasonsList   = document.getElementById('reasons-list');
const reasonsEmpty  = document.getElementById('reasons-empty');
const gameHint      = document.getElementById('game-hint');

/* ================================================================
   SPAWNING
   ================================================================ */
function getAvailableIndices() {
    return REASONS
        .map((_, i) => i)
        .filter(i => !collectedIndices.has(i) && !inPlayIndices.has(i));
}

function spawnHeart() {
    if (gameFinished)                    return;
    if (activeHeartCount >= MAX_ACTIVE)  return;

    const available = getAvailableIndices();
    if (available.length === 0)          return;

    const reasonIdx = available[Math.floor(Math.random() * available.length)];
    inPlayIndices.add(reasonIdx);
    activeHeartCount++;

    const heart = document.createElement('div');
    heart.className = 'game-heart-el';
    heart.dataset.reasonIndex = reasonIdx;

    heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

    const xPos     = Math.random() * 78 + 5;          // 5% → 83%
    const duration = Math.random() * 5 + 7;            // 7s → 12s
    const fontSize = HEART_SIZES[Math.floor(Math.random() * HEART_SIZES.length)];

    heart.style.left            = `${xPos}%`;
    heart.style.fontSize        = fontSize;
    heart.style.animationDuration = `${duration}s`;

    // Interaction
    heart.addEventListener('click', (e) => collectHeart(heart, e));
    heart.addEventListener('touchstart', (e) => {
        e.preventDefault();
        collectHeart(heart, e.touches[0]);
    }, { passive: false });

    heart.addEventListener('mouseenter', () =>
        document.getElementById('cursor')?.classList.add('hovering'));
    heart.addEventListener('mouseleave', () =>
        document.getElementById('cursor')?.classList.remove('hovering'));

    // Missed heart: floated off screen
    heart.addEventListener('animationend', (ev) => {
        if (ev.animationName !== 'gameHeartRise') return;
        if (heart.dataset.collected)              return;

        inPlayIndices.delete(reasonIdx);
        activeHeartCount--;
        heart.remove();
        if (!gameFinished) setTimeout(spawnHeart, 900);
    });

    gameContainer.appendChild(heart);
}

/* ================================================================
   COLLECT
   ================================================================ */
function collectHeart(heart, event) {
    if (heart.dataset.collected) return;
    heart.dataset.collected = 'true';

    const reasonIdx = parseInt(heart.dataset.reasonIndex);

    inPlayIndices.delete(reasonIdx);
    collectedIndices.add(reasonIdx);
    collectedOrder.push(reasonIdx);
    saveProgress();
    activeHeartCount--;

    // Visual: stop float, trigger pop
    heart.style.animationPlayState = 'paused';
    heart.classList.add('heart-pop');

    // Particle burst at click/touch position
    const containerRect = gameContainer.getBoundingClientRect();
    const clientX = event?.clientX ?? event?.pageX ?? 0;
    const clientY = event?.clientY ?? event?.pageY ?? 0;
    const cx = clientX - containerRect.left;
    const cy = clientY - containerRect.top;
    createParticles(cx, cy);

    // Update counter
    collectedCount++;
    counterText.textContent = `${collectedCount} / ${TOTAL}`;
    counterText.parentElement.classList.remove('counter-pop');
    // Force reflow for re-triggering animation
    void counterText.parentElement.offsetWidth;
    counterText.parentElement.classList.add('counter-pop');

    // Hide hint
    if (gameHint) gameHint.style.opacity = '0';

    // Remove heart after pop animation
    setTimeout(() => {
        heart.remove();
        addReasonToPanel(collectedCount, REASONS[reasonIdx]);
    }, 450);

    // Win check
    if (collectedCount >= TOTAL) {
        gameFinished = true;
        setTimeout(showVictory, 1800);
        setTimeout(showReplayButton, 2500);
    } else {
        setTimeout(spawnHeart, 1100);
    }
}

/* ================================================================
   PARTICLES
   ================================================================ */
function createParticles(cx, cy) {
    const COLORS = ['#e63950','#ff6b8a','#c9a84c','#e8c97a','#ff4d6d','#ffb3c6'];
    const count  = 12;

    for (let i = 0; i < count; i++) {
        const p     = document.createElement('span');
        p.className = 'pop-particle';
        p.textContent = '❤';

        const angle = (i / count) * 360;
        const dist  = Math.random() * 65 + 28;
        const tx    = Math.cos(angle * Math.PI / 180) * dist;
        const ty    = Math.sin(angle * Math.PI / 180) * dist;
        const size  = Math.random() * 10 + 7;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const delay = (Math.random() * 80).toFixed(0);

        p.style.cssText = `
            left: ${cx}px;
            top: ${cy}px;
            font-size: ${size}px;
            color: ${color};
            --tx: ${tx}px;
            --ty: ${ty}px;
            animation-delay: ${delay}ms;
        `;

        gameContainer.appendChild(p);
        setTimeout(() => p.remove(), 850);
    }
}

/* ================================================================
   REASONS PANEL
   ================================================================ */
function addReasonToPanel(num, text) {
    // Hide "empty" message
    if (reasonsEmpty) reasonsEmpty.style.display = 'none';

    const li = document.createElement('li');
    li.className = 'reason-item';
    li.innerHTML = `
        <span class="reason-icon">❤</span>
        <span><strong>${num}.</strong> ${text}</span>
    `;
    // Stagger animation delay based on number collected
    li.style.animationDelay = '0.05s';
    reasonsList.appendChild(li);
}

/* ================================================================
   VICTORY SCREEN
   ================================================================ */
const victoryBackBtn = document.getElementById('victory-back-btn');
if (victoryBackBtn) {
    victoryBackBtn.addEventListener('click', () => {
        const screen = document.getElementById('victory-screen');
        screen.classList.remove('visible');
        setTimeout(() => screen.classList.add('hidden'), 900);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

let victoryShownOnce = false;

function showVictory() {
    const screen = document.getElementById('victory-screen');
    if (!screen) return;

    screen.classList.remove('hidden');

    // Two rAF frames to allow display:block to apply before transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            screen.classList.add('visible');
        });
    });

    // Partículas só na primeira vez (rever a surpresa não duplica)
    if (!victoryShownOnce) {
        victoryShownOnce = true;
        spawnVictoryParticles();
    }
}

function spawnVictoryParticles() {
    const vp = document.getElementById('victory-particles');
    if (!vp) return;

    const emojis = ['❤', '🌹', '💗', '♥', '💖', '💕', '❤', '🌹'];

    for (let i = 0; i < 45; i++) {
        const p   = document.createElement('span');
        p.className = 'victory-particle';
        const dur   = Math.random() * 6 + 4;
        const delay = Math.random() * 4;
        const size  = Math.random() * 28 + 10;
        const left  = Math.random() * 100;

        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.cssText = `
            left: ${left}%;
            font-size: ${size}px;
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
            filter: drop-shadow(0 0 6px rgba(230,57,80,0.7));
        `;
        vp.appendChild(p);
    }
}

/* ================================================================
   PERSISTÊNCIA — o progresso sobrevive se a página recarregar
   (no iPhone o Safari recarrega abas em segundo plano com frequência)
   ================================================================ */
function saveProgress() {
    try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(collectedOrder));
    } catch (e) { /* modo privado: segue sem salvar */ }
}

function restoreProgress() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    } catch (e) { return; }
    if (!Array.isArray(saved) || saved.length === 0) return;

    saved.forEach(idx => {
        if (typeof idx !== 'number' || idx < 0 || idx >= TOTAL) return;
        if (collectedIndices.has(idx)) return;
        collectedIndices.add(idx);
        collectedOrder.push(idx);
        collectedCount++;
        addReasonToPanel(collectedCount, REASONS[idx]);
    });

    counterText.textContent = `${collectedCount} / ${TOTAL}`;

    if (collectedCount >= TOTAL) {
        gameFinished = true;
        if (gameHint) {
            gameHint.textContent = '✨ Você já coletou todo o meu coração ❤';
            gameHint.style.opacity = '1';
        }
        showReplayButton();
    } else if (collectedCount > 0 && gameHint) {
        gameHint.textContent = '✨ Continue de onde parou!';
    }
}

/* Botão para rever a tela final quando o jogo já foi completado */
function showReplayButton() {
    if (document.getElementById('replay-victory-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'replay-victory-btn';
    btn.className = 'victory-back-btn replay-btn';
    btn.textContent = 'Rever a surpresa ❤';
    btn.addEventListener('click', showVictory);
    gameContainer.appendChild(btn);
}

restoreProgress();

/* ================================================================
   GAME INIT — starts when section scrolls into view
   ================================================================ */
const gameSection = document.getElementById('game-section');

const gameObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting || gameStarted) return;
        gameStarted = true;
        gameObserver.disconnect();

        // Staggered initial spawn
        setTimeout(() => spawnHeart(), 600);
        setTimeout(() => spawnHeart(), 1500);
        setTimeout(() => spawnHeart(), 2400);
    });
}, { threshold: 0.25 });

if (gameSection) gameObserver.observe(gameSection);

/* ---- Continuous spawn fallback ---- */
setInterval(() => {
    if (gameStarted && !gameFinished && activeHeartCount < MAX_ACTIVE) {
        spawnHeart();
    }
}, 3200);
