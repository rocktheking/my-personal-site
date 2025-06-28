document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();


    const toc = document.getElementById('table-of-contents');
    const navLinks = toc.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');

    const onScroll = () => {
        const scrollPosition = window.scrollY;
        
        let currentSectionId = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Offset for better trigger point
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial check on load


    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const wrapper = button.parentElement;
            const pre = wrapper.querySelector('pre');
            const code = pre ? pre.querySelector('code') : null;

            if (!code) return;

            const textToCopy = code.innerText;

            try {
                await navigator.clipboard.writeText(textToCopy);
                

                const originalIcon = button.innerHTML;
                button.innerHTML = '<i data-lucide="check" class="text-green-400"></i>';
                lucide.createIcons();

                setTimeout(() => {
                    button.innerHTML = originalIcon;
                    lucide.createIcons();
                }, 2000);

            } catch (err) {
                console.error('Failed to copy text: ', err);
                

                 const originalIcon = button.innerHTML;
                button.innerHTML = '<i data-lucide="x" class="text-red-400"></i>';
                lucide.createIcons();
                setTimeout(() => {
                    button.innerHTML = originalIcon;
                    lucide.createIcons();
                }, 2000);
            }
        });
    });
});
