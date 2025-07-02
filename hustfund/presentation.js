document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('presentation-container');
    const slides = Array.from(document.querySelectorAll('.presentation-slide'));
    const prevButton = document.getElementById('presentation-prev-slide');
    const nextButton = document.getElementById('presentation-next-slide');
    const dotsContainer = document.getElementById('presentation-dots');

    let currentSlide = 0;
    let isAnimating = false;
    let autoPlayTimeout = null;
    const AUTO_PLAY_DELAY = 10000;

    if (!container || slides.length === 0) {
        return;
    }

    function createDots() {
        if (!dotsContainer) return;
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('w-2', 'h-2', 'rounded-full', 'transition-colors', 'duration-300', 'bg-white/30');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }

    function updateUI() {
        dotsContainer?.querySelectorAll('button').forEach((dot, index) => {
            dot.classList.toggle('bg-white/80', index === currentSlide);
            dot.classList.toggle('bg-white/30', index !== currentSlide);
        });

        if (prevButton) prevButton.disabled = currentSlide === 0;
        if (nextButton) nextButton.disabled = currentSlide === slides.length - 1;
        
        slides.forEach((slide, index) => {
            const zIndex = slides.length - Math.abs(currentSlide - index);
            slide.style.zIndex = zIndex;
        });
    }

    function animateSlide(slide, show) {
        const elementsToAnimate = slide.querySelectorAll('[data-animate]');
        if (show) {
            gsap.to(elementsToAnimate, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.3
            });
        } else {
            gsap.set(elementsToAnimate, { opacity: 0, y: 20 });
        }
    }

    function goToSlide(slideIndex, direction = 'next') {
        if (isAnimating || slideIndex < 0 || slideIndex >= slides.length) return;
        isAnimating = true;

        const oldSlide = slides[currentSlide];
        const newSlide = slides[slideIndex];
        
        animateSlide(oldSlide, false);

        oldSlide.style.pointerEvents = 'none';
        newSlide.style.pointerEvents = 'auto';
        newSlide.style.visibility = 'visible';
        
        const moveY = direction === 'next' ? '-100%' : '100%';
        const fromY = direction === 'next' ? '100%' : '-100%';

        gsap.fromTo(newSlide, 
            { y: fromY, opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.8, ease: 'cubic-bezier(0.25, 1, 0.5, 1)' }
        );
        
        gsap.to(oldSlide, {
            y: moveY,
            opacity: 0,
            duration: 0.8,
            ease: 'cubic-bezier(0.25, 1, 0.5, 1)',
            onComplete: () => {
                oldSlide.style.visibility = 'hidden';
                oldSlide.style.transform = '';
                isAnimating = false;
            }
        });

        currentSlide = slideIndex;
        updateUI();
        animateSlide(newSlide, true);
    }

    function next() {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1, 'next');
        }
    }

    function prev() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1, 'prev');
        }
    }
    
    let wheelTimeout;
    window.addEventListener('wheel', (e) => {
        if (isAnimating) return;
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            if (e.deltaY > 50) {
                next();
            } else if (e.deltaY < -50) {
                prev();
            }
        }, 50); 
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    });

    prevButton?.addEventListener('click', prev);
    nextButton?.addEventListener('click', next);

    createDots();
    updateUI();
    animateSlide(slides[currentSlide], true);
});
