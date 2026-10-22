/* PSİKOVİRAL discovery — all publications are rendered in HTML for resilience. */
(() => {
  'use strict';
  const search = document.querySelector('#catalog-search');
  if (!search) return;
  const grid = document.querySelector('#catalog-grid');
  const cards = Array.from(grid.children);
  const topicButtons = Array.from(document.querySelectorAll('[data-topic-filter]'));
  const formatButtons = Array.from(document.querySelectorAll('[data-format-filter]'));
  const sort = document.querySelector('#catalog-sort');
  const params = new URLSearchParams(location.search);
  let topic = topicButtons.some(b => b.dataset.topicFilter === params.get('konu')) ? params.get('konu') : 'hepsi';
  // Preserve old bookmarked category links.
  const oldTopics = { Duygular:'Psikoloji', 'İlişkiler':'Psikoloji', 'Yaşam':'İyi yaşam', 'İş ve yaşam':'İyi yaşam', 'Eğitim':'Çocuk ve eğitim', 'Toplum':'Bilim ve toplum' };
  if (oldTopics[params.get('konu')]) topic = oldTopics[params.get('konu')];
  let format = formatButtons.some(b => b.dataset.formatFilter === params.get('format')) ? params.get('format') : 'hepsi';
  search.value = params.get('q') || '';
  if (['newest','oldest','title'].includes(params.get('sira'))) sort.value = params.get('sira');
  const normalize = text => text.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function apply(updateURL = true) {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const text = normalize(card.dataset.search);
      card.hidden = !((topic === 'hepsi' || card.dataset.topic === topic) && (format === 'hepsi' || card.dataset.format === format) && terms.every(t => text.includes(t)));
      if (!card.hidden) count++;
    });
    topicButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.topicFilter === topic)));
    formatButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.formatFilter === format)));
    document.querySelector('#catalog-count').textContent = count + ' / ' + cards.length + ' yayın gösteriliyor';
    document.querySelector('#catalog-empty').hidden = count !== 0;
    const ordered = [...cards].sort((a,b) => sort.value === 'title' ? a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent,'tr') : (sort.value === 'oldest' ? 1 : -1) * a.dataset.date.localeCompare(b.dataset.date));
    ordered.forEach(card => grid.append(card));
    if (updateURL) {
      const next = new URLSearchParams();
      if (topic !== 'hepsi') next.set('konu',topic);
      if (format !== 'hepsi') next.set('format',format);
      if (search.value.trim()) next.set('q',search.value.trim());
      if (sort.value !== 'newest') next.set('sira',sort.value);
      try { history.replaceState(null,'',location.pathname + (next.size ? '?' + next : '') + location.hash); } catch (_) {}
    }
  }
  function reset() { topic='hepsi';format='hepsi';search.value='';sort.value='newest';apply();search.focus(); }
  search.addEventListener('input', () => apply());
  topicButtons.forEach(b => b.addEventListener('click', () => { topic=b.dataset.topicFilter;apply(); }));
  formatButtons.forEach(b => b.addEventListener('click', () => { format=b.dataset.formatFilter;apply(); }));
  sort.addEventListener('change', () => apply());
  document.querySelector('#catalog-reset').addEventListener('click',reset);
  document.querySelector('#empty-reset').addEventListener('click',reset);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault();search.focus(); }
  });
  apply(false);
  if (['#arama','#catalog-search'].includes(location.hash)) search.focus();
})();
