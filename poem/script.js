document.addEventListener('DOMContentLoaded', function() {
    // 导航菜单切换
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // 点击导航外区域关闭菜单
    document.addEventListener('click', function(event) {
        const isClickInside = navMenu.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInside && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
        }
    });

    // 分类筛选功能
    const filterLinks = document.querySelectorAll('#nav-menu a');
    const poemCards = document.querySelectorAll('.poem-card');

    filterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            filterLinks.forEach(item => item.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // 筛选诗词卡片
            poemCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    const categories = card.getAttribute('data-categories').split(',');
                    if (categories.includes(filter)) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });

    // 诗词卡片悬停效果增强
    poemCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.poem-image img').style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', function() {
            this.querySelector('.poem-image img').style.transform = 'scale(1)';
        });
    });

    // 滚动时导航栏效果
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // 向下滚动
            nav.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // 添加诗词卡片点击展开详情功能
    poemCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是卡片内部链接，不触发展开
            if (e.target.tagName === 'A') return;
            
            // 切换展开状态类
            this.classList.toggle('expanded');
            
            // 如果展开，滚动到卡片位置
            if (this.classList.contains('expanded')) {
                const offset = this.offsetTop - 100;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 页面加载完成后的动画
    document.body.classList.add('loaded');
});

// 添加页面加载进度指示器
window.addEventListener('load', function() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-inner"></div>';
    document.body.appendChild(loader);
    
    setTimeout(function() {
        loader.style.opacity = '0';
        setTimeout(function() {
            loader.remove();
        }, 500);
    }, 500);
});

// 添加返回顶部按钮
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const backToTop = document.querySelector('.back-to-top');
    
    if (!backToTop) {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '↑';
        button.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        document.body.appendChild(button);
    }
    
    if (scrollTop > 300) {
        document.querySelector('.back-to-top').style.display = 'block';
        setTimeout(function() {
            document.querySelector('.back-to-top').style.opacity = '1';
        }, 10);
    } else {
        document.querySelector('.back-to-top').style.opacity = '0';
        setTimeout(function() {
            document.querySelector('.back-to-top').style.display = 'none';
        }, 300);
    }
});

// 添加页面加载进度和返回顶部按钮的样式
const style = document.createElement('style');
style.textContent = `
    .page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    }
    
    .loader-inner {
        width: 50px;
        height: 50px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #8b0000;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .back-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: #8b0000;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 99;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .back-to-top:hover {
        background-color: #a52a2a;
    }
    
    body.loaded .poem-card {
        animation-play-state: running;
    }
    
    .poem-card.expanded {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 2rem;
    }
    
    .poem-card.expanded .poem-image {
        height: 100%;
    }
    
    @media (max-width: 768px) {
        .poem-card.expanded {
            grid-template-columns: 1fr;
        }
        
        .poem-card.expanded .poem-image {
            height: 200px;
        }
        
        .back-to-top {
            width: 40px;
            height: 40px;
            font-size: 20px;
            bottom: 20px;
            right: 20px;
        }
    }
`;

document.head.appendChild(style);