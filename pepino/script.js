// Set JS support flag
document.documentElement.classList.add('js');

// ==========================================================================
// 1. Navigation Scrollspy & Active Link Indicator
// ==========================================================================
(() => {
  const nav = document.getElementById('mainNav');
  const sections = document.querySelectorAll('header[id], section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!nav) return;

  const onScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Highlight active section link
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ==========================================================================
// 2. Weekly Experience Filtering
// ==========================================================================
(() => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.entry-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button active state
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      cards.forEach((card) => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

// ==========================================================================
// 3. Documentation Carousel & Navigation Dots
// ==========================================================================
(() => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const currentCounter = document.getElementById('current-slide');
  const totalCounter = document.getElementById('total-slides');
  const dotsContainer = document.getElementById('carouselDots');

  if (totalCounter) {
    totalCounter.textContent = slides.length;
  }

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to photo ${idx + 1}`);
      dot.addEventListener('click', () => {
        const step = slides[0].getBoundingClientRect().width;
        track.scrollTo({ left: idx * step, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    });
  }

  const getStep = () => slides[0].getBoundingClientRect().width;
  const getIndex = () => Math.round(track.scrollLeft / getStep());

  const updateControls = () => {
    const idx = Math.min(Math.max(getIndex(), 0), slides.length - 1);
    if (currentCounter) currentCounter.textContent = idx + 1;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === slides.length - 1;

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
      });
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  }

  track.addEventListener('scroll', () => requestAnimationFrame(updateControls), { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: getStep(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -getStep(), behavior: 'smooth' }); }
  });

  window.addEventListener('resize', updateControls);
  updateControls();
})();

// ==========================================================================
// 4. Lightbox Modal for Photo Zoom
// ==========================================================================
(() => {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const backdrop = document.getElementById('lightboxBackdrop');

  if (!modal || !modalImg) return;

  const openLightbox = (src, caption) => {
    modalImg.src = src;
    modalCaption.textContent = caption || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalImg.src = '';
      modalCaption.textContent = '';
    }, 300);
  };

  // Attach to weekly entry image containers
  document.querySelectorAll('.entry-img-container').forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.dataset.src || el.querySelector('img')?.getAttribute('src');
      const caption = el.dataset.caption || el.querySelector('img')?.getAttribute('alt');
      if (src) openLightbox(src, caption);
    });
  });

  // Attach to gallery slides
  document.querySelectorAll('.slide').forEach((slide) => {
    slide.addEventListener('click', () => {
      const src = slide.dataset.src || slide.querySelector('img')?.getAttribute('src');
      const caption = slide.dataset.caption || slide.querySelector('.slide-caption')?.textContent;
      if (src) openLightbox(src, caption);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });
})();

// ==========================================================================
// 5. Copy Contact Button with Toast Feedback
// ==========================================================================
(() => {
  const copyBtn = document.getElementById('copyContactBtn');
  const toast = document.getElementById('siteToast');

  if (!copyBtn || !toast) return;

  let toastTimer = null;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  copyBtn.addEventListener('click', async () => {
    const textToCopy = copyBtn.dataset.copy || 'D4 G/F Yolanda Bldg. Sobrecarey St, Corner Iñigo St, Bo. Obrero, Davao City, 8000 Davao del Sur, Philippines';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const input = document.createElement('input');
        input.value = textToCopy;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Copied studio address to clipboard!');
    } catch (err) {
      showToast(`Address: ${textToCopy}`);
    }
  });
})();

// ==========================================================================
// 6. Graceful Image Error Placeholders
// ==========================================================================
(() => {
  // Weekly entries fallback
  document.querySelectorAll('.entry-card img').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      const week = img.getAttribute('src').match(/week-(\d)/)?.[1] || '';
      const theme = img.dataset.theme || 'Technical Training Activity';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C6F135" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.15"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#071510"/>
        <rect x="24" y="24" width="752" height="552" rx="16" fill="url(#grad)" stroke="#1E4937" stroke-width="2" stroke-dasharray="10 10"/>
        <circle cx="400" cy="220" r="44" fill="#C6F135" fill-opacity="0.15" stroke="#C6F135" stroke-width="2"/>
        <path d="M386 220 L400 234 L418 206" fill="none" stroke="#C6F135" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="400" y="300" fill="#F0F5F2" font-family="Outfit, sans-serif" font-weight="700" font-size="32" text-anchor="middle">Week ${week} Documentation</text>
        <text x="400" y="340" fill="#8FA79B" font-family="Plus Jakarta Sans, sans-serif" font-size="20" text-anchor="middle">${theme}</text>
        <text x="400" y="385" fill="#C6F135" font-family="Plus Jakarta Sans, sans-serif" font-size="16" text-anchor="middle">Replace with images/week-${week}.jpg</text>
      </svg>`;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  });

  // Logo & Staff photo fallback
  document.querySelectorAll('img[data-placeholder]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      const w = img.getAttribute('width') || 800;
      const h = img.getAttribute('height') || 500;
      const label = img.dataset.placeholder || 'Image Placeholder';
      const file = img.dataset.file || '';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect width="${w}" height="${h}" fill="#071510"/>
        <rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="12" fill="none" stroke="#1E4937" stroke-dasharray="8 8"/>
        <text x="${w / 2}" y="${h / 2 - 8}" fill="#F0F5F2" font-family="Outfit, sans-serif" font-weight="600" font-size="22" text-anchor="middle">${label}</text>
        <text x="${w / 2}" y="${h / 2 + 24}" fill="#C6F135" font-family="Plus Jakarta Sans, sans-serif" font-size="15" text-anchor="middle">${file}</text>
      </svg>`;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  });
})();
