// Set JS support flag
document.documentElement.classList.add('js');

// ==========================================================================
// 1. Navigation Scrollspy & Frosted Navbar
// ==========================================================================
(() => {
  const nav = document.getElementById('mainNav');
  const sections = document.querySelectorAll('header[id], section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!nav) return;

  const onScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Frosted glass effect on scroll
    if (scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link highlighting
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
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
// 2. Weekly Experience Filtering & Quick Jump
// ==========================================================================
(() => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.entry-card');
  const jumpPills = document.querySelectorAll('.jump-pill');

  if (!cards.length) return;

  // Category Filtering
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

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

  // Quick Jump with card highlight animation
  jumpPills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      const targetId = pill.getAttribute('href')?.replace('#', '');
      const targetCard = document.getElementById(targetId);
      if (targetCard) {
        // If target card is currently hidden by filter, reset to all
        if (targetCard.classList.contains('hidden')) {
          const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
          if (allBtn) allBtn.click();
        }

        // Trigger brief visual highlight
        targetCard.classList.remove('jump-highlight');
        void targetCard.offsetWidth; // Force reflow
        targetCard.classList.add('jump-highlight');
        setTimeout(() => {
          targetCard.classList.remove('jump-highlight');
        }, 1600);
      }
    });
  });
})();

// ==========================================================================
// 3. Documentation Gallery: Dual View (Carousel + Grid Wall)
// ==========================================================================
(() => {
  // View Switcher
  const carouselBtn = document.getElementById('viewCarouselBtn');
  const gridBtn = document.getElementById('viewGridBtn');
  const carouselWrap = document.getElementById('carouselWrapper');
  const gridWrap = document.getElementById('gridWallWrapper');

  if (carouselBtn && gridBtn && carouselWrap && gridWrap) {
    carouselBtn.addEventListener('click', () => {
      carouselBtn.classList.add('active');
      carouselBtn.setAttribute('aria-selected', 'true');
      gridBtn.classList.remove('active');
      gridBtn.setAttribute('aria-selected', 'false');

      carouselWrap.style.display = 'block';
      gridWrap.style.display = 'none';
    });

    gridBtn.addEventListener('click', () => {
      gridBtn.classList.add('active');
      gridBtn.setAttribute('aria-selected', 'true');
      carouselBtn.classList.remove('active');
      carouselBtn.setAttribute('aria-selected', 'false');

      carouselWrap.style.display = 'none';
      gridWrap.style.display = 'grid';
    });
  }

  // Carousel Slider Logic
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

  // Attach to weekly entry images
  document.querySelectorAll('.entry-img-container').forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.dataset.src || el.querySelector('img')?.getAttribute('src');
      const caption = el.dataset.caption || el.querySelector('img')?.getAttribute('alt');
      if (src) openLightbox(src, caption);
    });
  });

  // Attach to staff spotlight
  document.querySelectorAll('.staff-img-container').forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.dataset.src || el.querySelector('img')?.getAttribute('src');
      const caption = el.dataset.caption || 'Aquila Softwares Corporation Team & Interns';
      if (src) openLightbox(src, caption);
    });
  });

  // Attach to gallery carousel slides
  document.querySelectorAll('.slide').forEach((slide) => {
    slide.addEventListener('click', () => {
      const src = slide.dataset.src || slide.querySelector('img')?.getAttribute('src');
      const caption = slide.dataset.caption || slide.querySelector('.slide-caption')?.textContent;
      if (src) openLightbox(src, caption);
    });
  });

  // Attach to gallery grid items
  document.querySelectorAll('.grid-wall-item').forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.dataset.src || item.querySelector('img')?.getAttribute('src');
      const caption = item.dataset.caption || item.querySelector('h4')?.textContent;
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
// 5. Copy Official Address Button with Toast Feedback
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
    const textToCopy = copyBtn.dataset.copy || 'Aquila Softwares Corporation, ENM Building, Sampaloc St corner, 212 Dao, Matina Crossing, Davao City, 8000 Davao del Sur, Philippines';
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
      showToast('Copied official company address to clipboard!');
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
      const week = img.getAttribute('src')?.match(/week(\d)/)?.[1] || '';
      const theme = img.dataset.theme || 'Frontend Engineering Activity';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.15"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#0A0F1D"/>
        <rect x="24" y="24" width="752" height="552" rx="16" fill="url(#grad)" stroke="#1E293B" stroke-width="2" stroke-dasharray="10 10"/>
        <circle cx="400" cy="220" r="44" fill="#00F2FE" fill-opacity="0.15" stroke="#00F2FE" stroke-width="2"/>
        <polyline points="386,220 398,232 418,208" fill="none" stroke="#00F2FE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="400" y="300" fill="#F8FAFC" font-family="'Outfit', sans-serif" font-weight="700" font-size="32" text-anchor="middle">Week ${week} Documentation</text>
        <text x="400" y="340" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" text-anchor="middle">${theme}</text>
        <text x="400" y="385" fill="#00F2FE" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" text-anchor="middle">Aquila Softwares Corporation</text>
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
        <rect width="${w}" height="${h}" fill="#0A0F1D"/>
        <rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="12" fill="none" stroke="#1E293B" stroke-dasharray="8 8"/>
        <text x="${w / 2}" y="${h / 2 - 8}" fill="#F8FAFC" font-family="'Outfit', sans-serif" font-weight="600" font-size="22" text-anchor="middle">${label}</text>
        <text x="${w / 2}" y="${h / 2 + 24}" fill="#00F2FE" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" text-anchor="middle">${file}</text>
      </svg>`;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  });
})();
