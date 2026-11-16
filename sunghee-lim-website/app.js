(() => {
  'use strict';
  const DRAFT_KEY = window.SITE_DRAFT_KEY || 'sunghee-portfolio-draft-v3';
  let data = window.SITE_CONTENT;
  const isPreview = new URLSearchParams(location.search).get('preview') === '1';
  if (isPreview) {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (draft && draft.profile && Array.isArray(draft.projects) && Array.isArray(draft.publications)) data = window.sanitizePortfolioContent(draft);
      document.getElementById('draft-notice').hidden = false;
    } catch { document.getElementById('draft-notice').hidden = false; }
  }
  if (!data || !data.profile) return;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = String(text ?? '');
    return n;
  };
  const list = value => Array.isArray(value) ? value : [];
  const link = (text, href, cls, options = {}) => {
    const n = el('a', cls, text);
    n.href = href;
    if (options.external) { n.target = '_blank'; n.rel = 'noopener noreferrer'; }
    return n;
  };
  const validUrl = (value, allowPdf = false) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    const s = value.trim();
    if (allowPdf && /^data:application\/pdf;base64,[A-Za-z0-9+/=\s]+$/.test(s)) return s;
    try { const u = new URL(s, document.baseURI); return ['https:', 'http:', 'file:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
  };
  const validPhoto = value => {
    if (typeof value !== 'string') return '';
    if (/^data:image\/(png|jpeg|webp|gif);base64,/.test(value)) return value;
    return validUrl(value);
  };
  const p = data.profile;
  document.title = `${p.name} · Education, technology & relations`;
  $('brand-name').textContent = p.name;
  document.querySelector('.brand').setAttribute('aria-label', `${p.name} home`);
  document.querySelector('.footer-name').replaceChildren(document.createTextNode(`${p.name} `), el('span', '', '✳'));
  $('hero-title').replaceChildren();
  const title = String(p.heroTitle || 'Education, technology & the relations in between.');
  const wordIndex = title.indexOf('relations');
  if (wordIndex >= 0) $('hero-title').append(document.createTextNode(title.slice(0, wordIndex)), el('span', 'accent', 'relations'), document.createTextNode(title.slice(wordIndex + 9)));
  else $('hero-title').textContent = title;
  $('hero-intro').textContent = p.intro;
  $('portrait-location').textContent = p.location;
  $('korean-name').textContent = p.koreanName;
  $('footer-affiliation').textContent = p.affiliation;
  $('status-date').textContent = p.updated;
  $('contact-copy').textContent = p.contactText;
  const cv = validUrl(p.cvUrl, true);
  document.querySelectorAll('.cv-link').forEach(n => {
    if (cv) { n.href = cv; if (cv.startsWith('data:')) { n.download = 'Sung-Hee-Lim-CV.pdf'; n.removeAttribute('target'); } }
    else n.hidden = true;
  });
  const photo = validPhoto(p.photo);
  if (photo) {
    $('portrait').src = photo;
    $('portrait').alt = p.photoAlt || `Portrait of ${p.name}`;
    $('portrait').hidden = false;
    $('portrait-placeholder').hidden = true;
    $('portrait').addEventListener('error', () => { $('portrait').hidden = true; $('portrait-placeholder').hidden = false; });
  }
  const linkedIn = validUrl(p.linkedinUrl);
  if (linkedIn) $('profile-links').append(link('in  LinkedIn ↗', linkedIn, '', {external: true}));
  const lab = validUrl(p.labUrl);
  if (lab) $('profile-links').append(link(`Current lab · ${p.labName || 'Visit'} ↗`, lab, '', {external: true}));
  const email = String(p.email || '').replace(/[\r\n]/g, '').trim();
  $('email-link').replaceChildren(document.createTextNode(email), el('span', '', '↗'));
  $('email-link').href = `mailto:${encodeURIComponent(email).replace(/%40/g, '@')}`;
  $('copy-email').addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const input = el('textarea'); input.value = email; input.style.cssText = 'position:fixed;top:-9999px'; document.body.append(input); input.select();
        const copied = document.execCommand('copy'); input.remove(); if (!copied) throw new Error('copy');
      }
      $('copy-status').textContent = 'Email address copied. Looking forward to hearing from you!';
    } catch { $('copy-status').textContent = `Please select and copy the address above: ${email}`; }
  });
  const themeSymbols = ['✳', '⌁', '↗'];
  list(data.themes).forEach((t, i) => {
    const item = el('div', 'theme'); const symbol = el('span', 'theme-symbol', themeSymbols[i % 3]); symbol.setAttribute('aria-hidden', 'true');
    const copy = el('div'); copy.append(el('h3', '', t.name), el('p', '', t.description)); item.append(symbol, copy); $('themes').append(item);
  });
  function tagList(values) { const tags = el('div', 'tags'); list(values).forEach(v => tags.append(el('span', 'tag', v))); return tags; }
  function detailButton(text, type, id, cls = 'project-button') {
    const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', () => openDetails(type, id, b)); return b;
  }
  const weaveSvg = `<svg class="weave-illustration" viewBox="0 0 320 270" aria-hidden="true"><g fill="none" stroke-linecap="round"><path d="M29 68c80-44 82 180 174 137S238 41 294 93" stroke="#a5b293" stroke-width="17"/><path d="M47 32c21 88 198 37 187 148S90 246 71 218" stroke="#f7f5ef" stroke-width="17"/><path d="M43 99c82-49 76 145 174 96S227 64 293 119" stroke="#c18b6c" stroke-width="17"/><path d="M73 24c9 92 190 49 180 153S115 267 94 231" stroke="#788b69" stroke-width="17"/><path d="M59 128c79-50 75 111 162 59S227 89 288 147" stroke="#a5b293" stroke-width="17"/><path d="M101 28c-3 89 182 51 170 150S144 272 119 242" stroke="#f7f5ef" stroke-width="17"/></g><circle cx="54" cy="99" r="4" fill="#a34e37"/><circle cx="253" cy="204" r="4" fill="#a34e37"/><path d="M280 34v24M268 46h24M272 38l16 16M272 54l16-16" stroke="#a34e37" stroke-width="1.4"/><text x="35" y="265" fill="#68765a" font-family="Lato, sans-serif" font-size="9" letter-spacing="2">MANY THREADS. SHARED INQUIRY.</text></svg>`;
  const projects = list(data.projects);
  if (projects.length) {
    const first = projects[0]; const feature = el('article', 'project-feature'); const copy = el('div', 'project-feature-copy');
    const kicker = el('div', 'project-kicker'); kicker.append(el('span', 'ongoing-dot'), el('span', '', first.status));
    copy.append(kicker, el('h3', '', first.title), el('p', 'project-subtitle', first.subtitle), el('p', 'project-summary', first.summary), tagList(list(first.methods).slice(0, 2)), detailButton('Explore the project ↗', 'project', first.id));
    const art = el('div', 'project-feature-art'); art.innerHTML = weaveSvg; feature.append(copy, art); $('projects').append(feature);
    if (projects.length > 1) {
      const grid = el('div', 'project-grid'); projects.slice(1).forEach((pr, i) => {
        const card = el('article', 'project-small'); card.append(el('span', 'project-number', pr.number || String(i + 2).padStart(2, '0')), el('h3', '', pr.title), el('p', 'project-subtitle', pr.subtitle), el('p', 'project-summary', pr.summary), el('p', 'project-period', pr.period), detailButton('Take a closer look ↗', 'project', pr.id)); grid.append(card);
      }); $('projects').append(grid);
    }
  }
  function renderPublications(filter = 'all') {
    $('publications').replaceChildren(); const pubs = list(data.publications).filter(v => filter === 'all' || v.category === filter);
    pubs.forEach(pub => {
      const row = el('article', 'publication'); const meta = el('div', 'pub-meta'); meta.append(el('span', 'pub-year', pub.year || 'In progress'), el('span', 'pub-category', pub.category));
      if (!pub.year) meta.querySelector('.pub-year').classList.toggle('undated', true);
      const content = el('div'); const pending = !['Published', 'Report'].includes(pub.status);
      content.append(el('span', `pub-status${pending ? ' pending' : ''}`, pub.status));
      const h = el('h3', 'pub-title'); h.append(detailButton(pub.title, 'publication', pub.id, '')); content.append(h);
      if (pub.authors) content.append(el('p', 'pub-authors', pub.authors));
      content.append(el('p', 'pub-venue', pub.venue), el('p', 'pub-summary', pub.summary));
      const arrow = detailButton('↗', 'publication', pub.id, 'pub-open'); arrow.setAttribute('aria-label', `Read about ${pub.title}`); row.append(meta, content, arrow); $('publications').append(row);
    });
    if (!pubs.length) $('publications').append(el('p', 'pub-summary', 'No writing in this category yet.'));
    $('publication-count').textContent = `${pubs.length} ${pubs.length === 1 ? 'item' : 'items'} shown`;
  }
  renderPublications();
  document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(other => { const active = b === other; other.classList.toggle('active', active); other.setAttribute('aria-pressed', String(active)); }); renderPublications(b.dataset.filter);
  }));
  list(data.education).forEach(e => { const item = el('article', 'education-item'); item.append(el('p', 'entry-period', e.period), el('h4', '', e.institution), el('p', 'degree', e.degree), el('p', 'entry-description', e.description)); $('education').append(item); });
  const experiences = list(data.experience);
  function experienceItem(e) { const item = el('article', 'experience-item'); item.append(el('p', 'entry-period', e.period), el('h4', '', e.title), el('p', 'organization', e.organization), el('p', 'entry-description', e.description)); return item; }
  experiences.slice(0, 4).forEach(e => $('experience').append(experienceItem(e)));
  if (experiences.length > 4) { const more = el('details', 'experience-extra'); more.append(el('summary', '', `Teaching, writing & other experience (${experiences.length - 4}) ＋`)); experiences.slice(4).forEach(e => more.append(experienceItem(e))); $('experience').append(more); }
  list(data.talks).forEach(t => { const item = el('article', 'talk-item'); const date = el('p', '', t.date); const copy = el('div'); copy.append(el('h4', '', t.title), el('p', '', `${t.event} · ${t.location}`)); if (t.status) copy.append(el('span', 'talk-status', t.status)); item.append(date, copy); $('talks').append(item); });
  $('talk-count').textContent = list(data.talks).length;
  list(data.awards).forEach(a => { const item = el('article', 'award-item'); const copy = el('div'); copy.append(el('strong', '', a.title), el('p', '', a.organization)); item.append(el('p', '', a.year), copy); $('awards').append(item); });
  $('award-count').textContent = list(data.awards).length;
  list(p.about).forEach(text => $('about-copy').append(el('p', '', text)));
  $('methods').replaceWith(Object.assign(tagList(data.methods), {id: 'methods'}));
  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema) schema.textContent = JSON.stringify({'@context':'https://schema.org','@type':'Person',name:p.name,jobTitle:p.role,affiliation:{'@type':'CollegeOrUniversity',name:p.affiliation},email:p.email});
  const dialog = $('research-dialog'); let initialOpener = null;
  function section(title, text) { if (!text) return; const block = el('section', 'dialog-section'); block.append(el('h3', '', title), el('p', '', text)); $('dialog-content').append(block); }
  function openDetails(type, id, opener) {
    const item = list(type === 'project' ? data.projects : data.publications).find(x => x.id === id); if (!item) return;
    if (!dialog.open) initialOpener = opener;
    $('dialog-label').textContent = type === 'project' ? 'RESEARCH IN PRACTICE' : item.category;
    const content = $('dialog-content'); content.replaceChildren();
    content.append(el('span', `pub-status${/progress|review|submitted/i.test(item.status) ? ' pending' : ''}`, item.status), el('h2', 'dialog-title', item.title));
    content.querySelector('h2').id = 'dialog-title';
    if (type === 'project') {
      content.append(el('p', 'dialog-meta', `${item.subtitle} · ${item.period}`), el('p', 'dialog-summary', item.summary));
      section('The inquiry', item.question); section('The project', item.description);
      if (item.context) content.append(el('p', 'dialog-context', item.context));
      section('My contribution', item.contribution); section('Research output', item.output);
    } else {
      if (item.authors) content.append(el('p', 'dialog-meta', `${item.authors}${item.year ? ` (${item.year})` : ''}`));
      content.append(el('p', 'dialog-meta', item.venue), el('p', 'dialog-summary', item.summary));
      section('About this work', item.description); section('My contribution', item.contribution); section('Recognition', item.recognition);
    }
    if (list(item.methods).length) { const block = el('section', 'dialog-section'); block.append(el('h3', '', 'Approach'), tagList(item.methods)); content.append(block); }
    if (list(item.relatedPublications).length) {
      const block = el('section', 'dialog-section'); block.append(el('h3', '', 'Related writing'));
      list(item.relatedPublications).forEach(ref => { const pub = list(data.publications).find(x => x.id === ref); if (pub) block.append(detailButton(`${pub.title} ↗`, 'publication', pub.id, 'related-button')); }); content.append(block);
    }
    const talks = list(item.relatedTalks).map(ref => list(data.talks).find(t => t.id === ref)).filter(Boolean);
    if (talks.length) { const block = el('section', 'dialog-section'); block.append(el('h3', '', 'Related presentations')); talks.forEach(t => { const talk = el('div', 'dialog-talk', t.title); talk.append(el('small', '', `${t.event} · ${t.date} · ${t.location}${t.status ? ` · ${t.status}` : ''}`)); block.append(talk); }); content.append(block); }
    const url = validUrl(item.url); if (url) content.append(link('Read the original work ↗', url, 'text-link dialog-external', {external:true}));
    if (!dialog.open) { dialog.showModal(); document.body.style.overflow = 'hidden'; }
    dialog.scrollTop = 0; $('dialog-close').focus();
  }
  $('dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; if (initialOpener && document.contains(initialOpener)) initialOpener.focus(); });
  $('menu-toggle').addEventListener('click', () => { const opened = $('navigation').classList.toggle('open'); $('menu-toggle').setAttribute('aria-expanded', String(opened)); $('menu-toggle').setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation'); });
  $('navigation').querySelectorAll('a').forEach(a => a.addEventListener('click', () => { $('navigation').classList.remove('open'); $('menu-toggle').setAttribute('aria-expanded','false'); $('menu-toggle').setAttribute('aria-label','Open navigation'); }));
})();
