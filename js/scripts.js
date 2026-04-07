// ── Hamburger / mobile nav ──────────────────────────────────────
const mobileButton = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

if (mobileButton && menu) {
    mobileButton.addEventListener('click', () => {
        const isActive = mobileButton.classList.toggle('is-active');
        menu.classList.toggle('toggled', isActive);
    });

    // Close on nav link tap (mobile)
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileButton.classList.remove('is-active');
            menu.classList.remove('toggled');
        });
    });
}

// ── Back to top ─────────────────────────────────────────────────
const topBtn = document.getElementById('To-Top');
const header = document.getElementById('header');

if (topBtn) {
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Scroll: back-to-top visibility + parallax ───────────────────
window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Back-to-top button
    if (topBtn && header) {
        topBtn.classList.toggle('visible', y > header.offsetHeight);
    }

    // Background parallax
    document.body.style.backgroundPositionY = (y * 0.35) + 'px';
}, { passive: true });

// ── Featured Carousel ───────────────────────────────────────────
const featuredTrack = document.getElementById('featuredTrack');
const featuredDots  = document.getElementById('featuredDots');

if (featuredTrack) {
    const DURATION = 750; // ms — must match CSS transition
    const INTERVAL = 7500;

    const realSlides = Array.from(featuredTrack.children);
    const realCount  = realSlides.length;

    // Clone first slide and append so forward wrap plays in the correct direction
    const firstClone = realSlides[0].cloneNode(true);
    firstClone.classList.remove('active');
    featuredTrack.appendChild(firstClone);

    let current   = 0;
    let animating = false;
    let autoTimer;

    function allSlides() { return Array.from(featuredTrack.children); }

    function setTransition(on) {
        featuredTrack.style.transition = on
            ? `transform ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none';
    }

    function activateSlide(trackIdx) {
        allSlides().forEach(s => s.classList.remove('active'));
        requestAnimationFrame(() => featuredTrack.children[trackIdx].classList.add('active'));
    }

    function updateDots(idx) {
        featuredDots?.querySelectorAll('.featured-carousel__dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx);
        });
    }

    function goTo(next) {
        if (animating) return;
        const newCurrent = ((next % realCount) + realCount) % realCount;
        const forwardWrap = current === realCount - 1 && newCurrent === 0;

        animating = true;

        // Clear active content on all slides immediately
        allSlides().forEach(s => s.classList.remove('active'));

        if (forwardWrap) {
            // Animate to the clone of slide 0 at position realCount
            setTransition(true);
            featuredTrack.style.transform = `translateX(-${realCount * 100}%)`;

            setTimeout(() => {
                // Instantly teleport back to the real slide 0
                setTransition(false);
                featuredTrack.style.transform = 'translateX(0)';

                // Two rAFs: one to let the repaint happen, one to re-enable transition
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    setTransition(true);
                    current = 0;
                    updateDots(0);
                    activateSlide(0);
                    animating = false;
                }));
            }, DURATION);
        } else {
            setTransition(true);
            featuredTrack.style.transform = `translateX(-${newCurrent * 100}%)`;
            current = newCurrent;
            updateDots(current);
            activateSlide(current);
            setTimeout(() => { animating = false; }, DURATION);
        }
    }

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), INTERVAL); }
    function resetAuto()  { clearInterval(autoTimer); startAuto(); }

    document.getElementById('featuredPrev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    document.getElementById('featuredNext')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
    featuredDots?.querySelectorAll('.featured-carousel__dot').forEach(dot => {
        dot.addEventListener('click', () => { goTo(+dot.dataset.index); resetAuto(); });
    });

    // Initialise
    activateSlide(0);
    updateDots(0);
    startAuto();
}

// ── Filter tabs (worlds / games pages) ─────────────────────────
const filterTabs = document.getElementById('filterTabs');
const worldsGrid = document.getElementById('worldsGrid');

if (filterTabs && worldsGrid) {
    filterTabs.addEventListener('click', e => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;
        const cards = Array.from(worldsGrid.querySelectorAll('.game-card'));

        // Snap all cards to their hidden reveal state (no transition flash)
        cards.forEach(card => {
            card.style.transition = 'none';
            card.style.transitionDelay = '';
            card.classList.remove('visible');
        });

        // Partition into matching / hidden
        const matching = cards.filter(c => filter === 'all' || c.dataset.category === filter);
        const hiding   = cards.filter(c => filter !== 'all' && c.dataset.category !== filter);

        hiding.forEach(c => { c.style.display = 'none'; });
        matching.forEach(c => { c.style.display = ''; });

        // Force a reflow so the browser registers the hidden state, then animate in
        worldsGrid.offsetHeight;

        matching.forEach((card, i) => {
            card.style.transition = '';
            card.style.transitionDelay = `${i * 60}ms`;
            card.classList.add('visible');
        });
    });
}

// ── Custom Select ─────────────────────────────────────────────────
document.querySelectorAll('.custom-select').forEach(select => {
    const valueEl   = select.querySelector('.custom-select__value');
    const options   = select.querySelectorAll('.custom-select__option');
    const hiddenInput = document.getElementById('reasonInput');
    let focusedIdx  = -1;

    function open() {
        select.classList.add('custom-select--open');
        select.setAttribute('aria-expanded', 'true');
        focusedIdx = [...options].findIndex(o => o.classList.contains('custom-select__option--selected'));
        if (focusedIdx >= 0) setFocus(focusedIdx);
    }
    function close() {
        select.classList.remove('custom-select--open');
        select.setAttribute('aria-expanded', 'false');
        options.forEach(o => o.classList.remove('custom-select__option--focused'));
    }
    function choose(opt) {
        options.forEach(o => o.classList.remove('custom-select__option--selected'));
        opt.classList.add('custom-select__option--selected');
        valueEl.textContent = opt.dataset.value;
        valueEl.classList.remove('custom-select__placeholder');
        if (hiddenInput) hiddenInput.value = opt.dataset.value;
        close();
    }
    function setFocus(idx) {
        options.forEach(o => o.classList.remove('custom-select__option--focused'));
        if (idx >= 0 && idx < options.length) {
            options[idx].classList.add('custom-select__option--focused');
            focusedIdx = idx;
        }
    }

    select.addEventListener('click', () =>
        select.classList.contains('custom-select--open') ? close() : open()
    );
    select.addEventListener('keydown', (e) => {
        const isOpen = select.classList.contains('custom-select--open');
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            isOpen && focusedIdx >= 0 ? choose(options[focusedIdx]) : open();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) { open(); return; }
            setFocus(Math.min(focusedIdx + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocus(Math.max(focusedIdx - 1, 0));
        } else if (e.key === 'Escape') {
            close();
        }
    });
    options.forEach(opt => opt.addEventListener('click', (e) => {
        e.stopPropagation();
        choose(opt);
    }));
    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) close();
    });
});

// ── Contact Form ─────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const status = document.getElementById('form-status');
    const reasonInput = document.getElementById('reasonInput');
    const customSelect = contactForm.querySelector('.custom-select');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (reasonInput && !reasonInput.value) {
            customSelect.focus();
            customSelect.classList.add('custom-select--open');
            customSelect.setAttribute('aria-expanded', 'true');
            return;
        }
        const btn = contactForm.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                contactForm.reset();
                contactForm.hidden = true;
                status.textContent = "Message sent! I'll get back to you soon.";
                status.className = 'form-status form-status--success';
                status.hidden = false;
            } else {
                throw new Error();
            }
        } catch {
            status.textContent = 'Something went wrong. Please try again or email contact@ostinyo.com directly.';
            status.className = 'form-status form-status--error';
            status.hidden = false;
            btn.disabled = false;
            btn.textContent = 'Send Message';
        }
    });
}

// ── Scroll-in reveal (IntersectionObserver) ─────────────────────
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    reveals.forEach(el => observer.observe(el));
}
