/* PSİKOVİRAL — progressive navigation and local search. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = q => document.querySelector(q);
  const themeButton = $('.theme-toggle');
  function theme(value) {
    document.documentElement.dataset.theme = value;
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(value === 'light'));
      themeButton.setAttribute('aria-label', value === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç');
    }
    $('meta[name="theme-color"]').content = value === 'light' ? '#f4efe8' : '#101820';
  }
  let saved = 'dark';
  try { saved = localStorage.getItem('psikoviral-theme') || 'dark'; } catch (_) {}
  theme(saved === 'light' ? 'light' : 'dark');
  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      theme(next);
      try { localStorage.setItem('psikoviral-theme', next); } catch (_) {}
    });
  }
  const menuButton = $('.nav-toggle'), menu = $('.primary-nav');
  function closeMenu() {
    if (!menuButton || !menu) return;
    menu.removeAttribute('data-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menüyü aç');
  }
  if (menuButton && menu) {
    menuButton.hidden = false;
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menu.toggleAttribute('data-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu(); menuButton.focus();
      }
    });
    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }
  const search = $('#arama'), cards = Array.from(document.querySelectorAll('#dosyalar .story-card'));
  if (search && cards.length) {
    const buttons = Array.from(document.querySelectorAll('[data-filter]'));
    const params = new URLSearchParams(location.search);
    let category = buttons.some(b => b.dataset.filter === params.get('konu')) ? params.get('konu') : 'hepsi';
    search.value = params.get('q') || '';
    const normalize = text => text.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function filter(updateUrl = true) {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      cards.forEach(card => {
        const text = normalize(card.dataset.search || '');
        card.hidden = !((category === 'hepsi' || card.dataset.cat === category) && terms.every(term => text.includes(term)));
        if (!card.hidden) count++;
      });
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
      $('#sonuc-sayisi').textContent = count + ' dosya' + (count === cards.length ? '' : ' / ' + cards.length);
      $('#sonuc-yok').hidden = count !== 0;
      if (updateUrl) {
        const next = new URLSearchParams();
        if (category !== 'hepsi') next.set('konu', category);
        if (search.value.trim()) next.set('q', search.value.trim());
        try { history.replaceState(null, '', location.pathname + (next.size ? '?' + next : '') + location.hash); } catch (_) {}
      }
    }
    search.addEventListener('input', () => filter());
    buttons.forEach(b => b.addEventListener('click', () => { category = b.dataset.filter; filter(); }));
    $('#filtre-sifirla').addEventListener('click', () => { category = 'hepsi'; search.value = ''; filter(); search.focus(); });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault(); search.focus();
      }
    });
    filter(false);
    if (location.hash === '#arama') search.focus();
  }
  const article = $('#makale');
  if (article) {
    const toc = $('.toc');
    article.querySelectorAll('h2, .limit').forEach((heading, i) => {
      heading.id = 'bolum-' + (i + 1);
      if (toc) {
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.matches('.limit') ? heading.querySelector('.tag').textContent : heading.textContent;
        toc.appendChild(a);
      }
    });
    if (toc && toc.children.length) $('.toc-box').hidden = false;
    if ('IntersectionObserver' in window && toc) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) toc.querySelectorAll('a').forEach(a => {
            if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-15% 0px -65% 0px' });
      article.querySelectorAll('h2, .limit').forEach(h => observer.observe(h));
    }
    const progress = $('.reading-progress span');
    let queued = false;
    function updateProgress() {
      queued = false;
      if (!progress) return;
      const start = article.getBoundingClientRect().top;
      const value = Math.min(1, Math.max(0, (innerHeight * .25 - start) / Math.max(1, article.offsetHeight - innerHeight * .5)));
      progress.style.transform = 'scaleX(' + value + ')';
    }
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
    addEventListener('resize', updateProgress); updateProgress();
    const copy = $('.copy-link');
    if (copy && navigator.clipboard && isSecureContext) {
      copy.hidden = false;
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(location.href.split('#')[0]); $('.copy-status').textContent = 'Bağlantı kopyalandı.'; }
        catch (_) { $('.copy-status').textContent = 'Kopyalanamadı. Tarayıcının adres çubuğunu kullanabilirsin.'; }
      });
    }
  }
})();
