(() => {
  const data = window.SEARCH_DATA || [];
  const total = data.length;

  const pageImage = document.getElementById('pageImage');
  const imageLink = document.getElementById('imageLink');
  const pageInput = document.getElementById('pageInput');
  const pageCount = document.getElementById('pageCount');
  const pageLabel = document.getElementById('pageLabel');
  const pane = document.getElementById('resultsPane');
  const searchInput = document.getElementById('searchInput');

  pageCount.textContent = total;
  let current = 1;

  const normalize = s => (s || '').normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // pdfimages naming from our setup:
  // page 1 -> pages/page-000.jpg
  // page 2 -> pages/page-001.jpg
  function imagePath(pageNumber) {
    return `pages/page-${String(pageNumber - 1).padStart(3, '0')}.jpg`;
  }

  function showPage(p, updateHash=true) {
    p = Math.max(1, Math.min(total, Number(p) || 1));
    current = p;

    const src = imagePath(p);
    pageInput.value = p;
    pageLabel.textContent = `Page ${p}`;
    pageImage.src = src;
    pageImage.alt = `Korean Directory of Oregon page ${p}`;
    imageLink.href = src;

    if (updateHash) history.replaceState(null, '', `#page=${p}`);
  }

  pageImage.addEventListener('click', () => {
    window.open(imagePath(current), '_blank', 'noopener');
  });

  pageImage.addEventListener('error', () => {
    pageImage.alt = `Page ${current} image not found`;
    pageLabel.textContent = `Page ${current} — image not found`;
  });

  function snippet(text, q) {
    const low = normalize(text), nq = normalize(q);
    const pos = low.indexOf(nq);
    if (pos < 0) return esc(text.slice(0,220));

    const start = Math.max(0, pos - 90);
    const end = Math.min(text.length, pos + nq.length + 130);
    let s = text.slice(start, end);
    const rawIdx = s.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());

    if (rawIdx >= 0) {
      s = esc(s.slice(0,rawIdx)) +
          '<mark>' + esc(s.slice(rawIdx, rawIdx + q.length)) + '</mark>' +
          esc(s.slice(rawIdx + q.length));
    } else {
      s = esc(s);
    }

    return (start ? '…' : '') + s + (end < text.length ? '…' : '');
  }

  function search(q) {
    q = q.trim();

    if (!q) {
      pane.innerHTML = '<div class="welcome"><h2>Search the directory</h2><p>Type a Korean or English name, business, category, address, phone number, or other term.</p><p class="ko">한국어나 영어로 이름, 업소명, 업종, 주소, 전화번호 등을 검색할 수 있습니다.</p></div>';
      return;
    }

    const nq = normalize(q);
    const hits = data.filter(x => normalize(x.t).includes(nq));

    pane.innerHTML =
      `<div class="result-count">${hits.length} page${hits.length === 1 ? '' : 's'} found for “${esc(q)}”</div>` +
      hits.slice(0,150).map(h =>
        `<button class="result" data-page="${h.p}">
          <div class="result-page">Page ${h.p}</div>
          <div class="snippet">${snippet(h.t,q)}</div>
        </button>`
      ).join('') +
      (hits.length > 150 ? '<div class="result-count">Showing first 150 matching pages.</div>' : '');

    pane.querySelectorAll('.result').forEach(
      b => b.addEventListener('click', () => showPage(b.dataset.page))
    );
  }

  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    search(searchInput.value);
  });

  document.getElementById('prevBtn').addEventListener('click', () => showPage(current - 1));
  document.getElementById('nextBtn').addEventListener('click', () => showPage(current + 1));

  pageInput.addEventListener('change', () => showPage(pageInput.value));
  pageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      showPage(pageInput.value);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowLeft') showPage(current - 1);
    if (e.key === 'ArrowRight') showPage(current + 1);
  });

  const m = location.hash.match(/page=(\d+)/);
  showPage(m ? m[1] : 1, false);
})();
