document.addEventListener('DOMContentLoaded', () => {
    // ============= DETECT MOBILE =============
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const heartInterval = isMobile ? 700 : 400;
  const maxFloatingHearts = isMobile ? 8 : 15;

  // ============= FLOATING HEARTS =============
  const heartEmojis = ['❤️','💕','💗','💖','💝','🩷','🌹','✨'];
  const heartsBg = document.getElementById('heartsBg');
  function createFloatingHeart() {
    // Limit total hearts on screen for mobile performance
    if (heartsBg.children.length > (isMobile ? 20 : 40)) return;
    const h = document.createElement('div');
    h.className = 'floating-heart';
    h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = (15 + Math.random() * 25) + 'px';
    h.style.animationDuration = (6 + Math.random() * 8) + 's';
    h.style.animationDelay = Math.random() * 2 + 's';
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), 16000);
  }
  setInterval(createFloatingHeart, heartInterval);
  for (let i = 0; i < maxFloatingHearts; i++) setTimeout(createFloatingHeart, i * 200);

  // ============= NO BUTTON — transform-based, never leaves flow =============
  const btnNo = document.getElementById('btnNo');
  const btnYes = document.getElementById('btnYes');
  let noClickable = true;
  let flyCount = 0;
  let translateX = 0, translateY = 0;
  const noTexts = ['Ні 🙃', 'Точно ні? 🥺', 'Подумай ще... 😢', 'Серйозно?! 💔', 'Ну будь ласка! 🥹', 'Останній шанс! 😭'];

  function flyNoButton(cursorX, cursorY) {
    if (!noClickable) return;

    const rect = btnNo.getBoundingClientRect();
    const btnCX = rect.left + rect.width / 2;
    const btnCY = rect.top + rect.height / 2;
    const dist = Math.hypot(cursorX - btnCX, cursorY - btnCY);

    // Bigger detection zone on mobile (fingers are less precise)
    const detectRadius = isMobile ? 90 : 120;

    if (dist < detectRadius) {
      flyCount++;

      // Gentle flee away from cursor
      const angle = Math.atan2(btnCY - cursorY, btnCX - cursorX);
      const spread = (Math.random() - 0.5) * Math.PI * 0.5;
      const fleeDist = isMobile ? (50 + Math.random() * 60) : (60 + Math.random() * 70);

      let newTX = translateX + Math.cos(angle + spread) * fleeDist;
      let newTY = translateY + Math.sin(angle + spread) * fleeDist;

      // Clamp: stay within radius of origin
      const maxRadius = isMobile ? 180 : 250;
      const currentDist = Math.hypot(newTX, newTY);
      if (currentDist > maxRadius) {
        newTX = (newTX / currentDist) * maxRadius;
        newTY = (newTY / currentDist) * maxRadius;
      }

      // Keep within viewport
      const origCX = rect.left + rect.width / 2 - translateX;
      const origCY = rect.top + rect.height / 2 - translateY;
      const pad = 10;
      newTX = Math.max(-origCX + pad, Math.min(window.innerWidth - origCX - rect.width + pad, newTX));
      newTY = Math.max(-origCY + pad, Math.min(window.innerHeight - origCY - rect.height + pad, newTY));

      translateX = newTX;
      translateY = newTY;
      btnNo.style.transform = `translate(${translateX}px, ${translateY}px)`;

      if (flyCount < noTexts.length) {
        btnNo.textContent = noTexts[flyCount];
      }

      // Grow Yes slightly
      const scale = 1 + flyCount * 0.05;
      btnYes.style.transform = `scale(${Math.min(scale, 1.35)})`;
    }
  }

  document.addEventListener('mousemove', e => flyNoButton(e.clientX, e.clientY));

  // Mobile: flee on both touchstart (finger lands near) and touchmove (finger slides near)
  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    flyNoButton(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    flyNoButton(t.clientX, t.clientY);
  }, { passive: true });

  // ============= YES =============
  function handleYes() {
    autoStartMusic();
    triggerHeartBurst();
    setTimeout(() => {
      document.getElementById('screen-question').classList.add('hide');
      setTimeout(() => {
        document.getElementById('screen-stars').classList.add('show');
        initStarfield();
        startQuoteSequence();
        launchShootingStars();
      }, 400);
    }, 600);
  }

  // ============= NO =============
  function handleNo() {
    autoStartMusic();
    noClickable = false;
    const sadScreen = document.getElementById('screen-sad');
    document.getElementById('screen-question').classList.add('hide');
    const rainCount = isMobile ? 25 : 50;
    for (let i = 0; i < rainCount; i++) {
      const d = document.createElement('div');
      d.className = 'rain-drop';
      d.style.left = Math.random() * 100 + '%';
      d.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
      d.style.animationDelay = Math.random() * 2 + 's';
      sadScreen.appendChild(d);
    }
    setTimeout(() => {
      sadScreen.classList.add('show');
      setTimeout(() => { sadScreen.style.opacity = '1'; }, 50);
    }, 400);
  }

  function goBack() {
    const s = document.getElementById('screen-sad');
    s.style.opacity = '0';
    setTimeout(() => {
      s.classList.remove('show');
      s.querySelectorAll('.rain-drop').forEach(d => d.remove());
      document.getElementById('screen-question').classList.remove('hide');
      noClickable = true;
      translateX = 0; translateY = 0;
      btnNo.style.transform = 'translate(0,0)';
      flyCount = 0;
      btnNo.textContent = noTexts[0];
      btnYes.style.transform = 'scale(1)';
    }, 600);
  }

  // ============= HEART BURST =============
  function triggerHeartBurst() {
    const burst = document.getElementById('heartBurst');
    burst.classList.add('active');
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const hearts = ['❤️','💖','💗','💕','💝','🩷','✨','💫','🌟'];
    const burstCount = isMobile ? 24 : 40;
    for (let i = 0; i < burstCount; i++) {
      const h = document.createElement('div');
      h.className = 'burst-heart';
      h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      h.style.left = cx + 'px'; h.style.top = cy + 'px';
      h.style.fontSize = (16 + Math.random() * 30) + 'px';
      const a = (Math.PI * 2 / burstCount) * i + Math.random() * 0.3;
      const d = (isMobile ? 60 : 100) + Math.random() * (isMobile ? 180 : 300);
      h.animate([
        { transform: 'translate(0,0) scale(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(1.5) rotate(${Math.random()*360}deg)`, opacity: 0 }
      ], { duration: 1200 + Math.random() * 500, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' });
      burst.appendChild(h);
    }
    setTimeout(() => { burst.innerHTML = ''; burst.classList.remove('active'); }, 2000);
  }

  // ============= QUOTE SEQUENCE =============
  const quotes = [
    { emoji: '🌟', text: 'Ти — та єдина, хто змушує моє серце битися швидше' },
    { emoji: '🦋', text: 'З тобою кожна мить — як перший подих весни' },
    { emoji: '🔥', text: 'Твоя усмішка — найтепліший вогонь у холодну ніч' },
    { emoji: '🌙', text: 'Ти — місяць, що освітлює мій найтемніший шлях' },
    { emoji: '💫', text: 'Серед усіх зірок я обрав би тебе знову і знову' },
    { emoji: '🌹', text: 'Ти унікальна. Ти неповторна. Ти — моя.' },
  ];

  function startQuoteSequence() {
    const emojiEl = document.getElementById('quoteEmoji');
    const textEl = document.getElementById('quoteText');
    const quoteDisplay = document.getElementById('quoteDisplay');
    const dotsContainer = document.getElementById('quoteDots');

    // Create dots
    quotes.forEach(() => {
      const dot = document.createElement('div');
      dot.className = 'quote-dot';
      dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.quote-dot');

    // Click/tap emoji for pop effect
    emojiEl.addEventListener('click', () => {
      emojiEl.classList.remove('pop');
      void emojiEl.offsetWidth;
      emojiEl.classList.add('pop');
      spawnMiniHearts(emojiEl);
    });

    let index = 0;

    function showQuote() {
      if (index >= quotes.length) {
        quoteDisplay.style.transition = 'opacity 0.8s ease';
        quoteDisplay.style.opacity = '0';
        setTimeout(() => {
          quoteDisplay.style.display = 'none';
          const fb = document.getElementById('finalBlock');
          fb.style.display = '';
          requestAnimationFrame(() => requestAnimationFrame(() => fb.classList.add('visible')));
        }, 900);
        return;
      }

      const q = quotes[index];
      emojiEl.textContent = q.emoji;
      textEl.textContent = q.text;

      // Update dots
      dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i < index) d.classList.add('done');
        if (i === index) d.classList.add('active');
      });

      // Reset
      emojiEl.className = 'quote-emoji';
      textEl.className = 'quote-text';
      void emojiEl.offsetWidth;

      // Fade in
      requestAnimationFrame(() => {
        emojiEl.classList.add('show');
        textEl.classList.add('show');
      });

      // Fade out
      setTimeout(() => {
        emojiEl.classList.remove('show');
        emojiEl.classList.add('hide');
        textEl.classList.remove('show');
        textEl.classList.add('hide');
      }, 3800);

      index++;
      setTimeout(showQuote, 5000);
    }

    setTimeout(showQuote, 1200);
  }

  // Spawn mini hearts around an element
  function spawnMiniHearts(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = ['💖','❤️','💗','✨','🩷'];
    const miniCount = isMobile ? 5 : 8;
    for (let i = 0; i < miniCount; i++) {
      const m = document.createElement('div');
      m.className = 'mini-heart';
      m.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      m.style.left = cx + 'px';
      m.style.top = cy + 'px';
      m.style.fontSize = (14 + Math.random() * 16) + 'px';
      document.body.appendChild(m);
      const a = (Math.PI * 2 / miniCount) * i;
      const d = 40 + Math.random() * 80;
      m.animate([
        { transform: 'translate(-50%,-50%) scale(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d}px)) scale(1.2)`, opacity: 0 }
      ], { duration: 700, easing: 'ease-out', fill: 'forwards' });
      setTimeout(() => m.remove(), 800);
    }
  }

  // Final heart interactive
  function popFinalHeart(el) {
    el.classList.remove('explode');
    void el.offsetWidth;
    el.classList.add('explode');
    spawnMiniHearts(el);
    setTimeout(() => el.classList.remove('explode'), 600);
  }

  // ============= STARFIELD =============
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const starCount = isMobile ? 200 : 400;
    const colorStarCount = isMobile ? 30 : 60;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        size: Math.random()*2.5, speed: 0.1+Math.random()*0.4,
        opacity: Math.random(), twinkleSpeed: 0.005+Math.random()*0.02, twinkleDir: 1 });
    }
    for (let i = 0; i < colorStarCount; i++) {
      stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        size: 1+Math.random()*2.2, speed: 0.05+Math.random()*0.2,
        opacity: 0.5+Math.random()*0.5, twinkleSpeed: 0.008+Math.random()*0.015,
        twinkleDir: 1, color: `hsl(${340+Math.random()*40}, 80%, ${60+Math.random()*30}%)` });
    }

    function animate() {
      ctx.fillStyle = 'rgba(26,26,26,0.15)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      stars.forEach(s => {
        s.opacity += s.twinkleSpeed * s.twinkleDir;
        if (s.opacity >= 1) { s.opacity = 1; s.twinkleDir = -1; }
        if (s.opacity <= 0.1) { s.opacity = 0.1; s.twinkleDir = 1; }
        s.y -= s.speed * 0.3;
        if (s.y < -5) { s.y = canvas.height + 5; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        if (s.color) { ctx.globalAlpha = s.opacity; ctx.fillStyle = s.color; }
        else { ctx.fillStyle = `rgba(255,255,255,${s.opacity})`; }
        ctx.fill(); ctx.globalAlpha = 1;
        if (s.size > 1.5) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size*3, 0, Math.PI*2);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size*3);
          g.addColorStop(0, s.color
            ? s.color.replace('hsl','hsla').replace(')',`, ${s.opacity*0.3})`)
            : `rgba(255,255,255,${s.opacity*0.2})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.fill();
        }
      });
      requestAnimationFrame(animate);
    }
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    animate();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
  }

  // ============= SHOOTING STARS =============
  function launchShootingStars() {
    function create() {
      const s = document.createElement('div');
      s.className = 'shooting-star';
      s.style.left = Math.random()*60+'%';
      s.style.top = Math.random()*40+'%';
      s.style.width = (60+Math.random()*100)+'px';
      s.style.transform = `rotate(${20+Math.random()*30}deg)`;
      s.style.animationDuration = (0.6+Math.random()*0.5)+'s';
      document.getElementById('screen-stars').appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
    setInterval(create, 3000+Math.random()*4000);
    setTimeout(create, 2000);
    setTimeout(create, 5000);
  }
  // ============= MUSIC: SadSvit — Останній день =============
  const audio = document.getElementById('bgMusic');
  let musicPlaying = false;
  let fadeInterval = null;

  function fadeAudio(targetVol, duration) {
    clearInterval(fadeInterval);
    const step = 30; // ms per tick
    const ticks = duration / step;
    const diff = (targetVol - audio.volume) / ticks;
    let tick = 0;
    fadeInterval = setInterval(() => {
      tick++;
      audio.volume = Math.max(0, Math.min(1, audio.volume + diff));
      if (tick >= ticks) {
        clearInterval(fadeInterval);
        audio.volume = targetVol;
        if (targetVol === 0) audio.pause();
      }
    }, step);
  }

  function toggleMusic() {
    const btn = document.getElementById('musicBtn');
    const label = document.getElementById('songLabel');

    if (musicPlaying) {
      musicPlaying = false;
      fadeAudio(0, 1000);
      btn.classList.add('muted');
      btn.classList.remove('playing');
      label.classList.remove('show');
    } else {
      musicPlaying = true;
      audio.volume = 0;
      audio.play().then(() => {
        fadeAudio(0.6, 2000);
      }).catch(() => {});
      btn.classList.remove('muted');
      btn.classList.add('playing');
      label.classList.add('show');
      // Hide label after 5s
      setTimeout(() => label.classList.remove('show'), 5000);
    }
  }

  // Auto-start on first interaction
  let musicAutoStarted = false;
 function autoStartMusic() {
    if (musicAutoStarted) return;
    musicAutoStarted = true;
    if (!musicPlaying) {
      toggleMusic();
    }
  } 
});
