// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navMenu.contains(event.target) || hamburger.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background on Scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Active Navigation Link Highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.project-card, .achievement-card, .about-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Loading Animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Typing Effect for Hero Title - Looping with highlight support
function typeWriterWithHighlightLoop(element, typeSpeed = 80, deleteSpeed = 40, pauseAfterType = 1200) {
    // Simple text without special characters - let HTML handle the line break
    const fullText = "Hi, I'm Rares Anghel";
    const highlightText = 'Rares Anghel';
    const highlightStart = fullText.indexOf(highlightText);
    const highlightEnd = highlightStart + highlightText.length;

    let i = 0;
    let direction = 1; // 1 = typing, -1 = deleting

    // Store the original HTML structure
    const originalHTML = element.innerHTML;

    function frame() {
        const currentText = fullText.substring(0, i);
        
        if (i <= highlightStart) {
            // Before highlight - just show the text with line break
            element.innerHTML = currentText.replace("Hi, I'm", "Hi, I'm<br>");
        } else if (i > highlightStart && i <= highlightEnd) {
            // During highlight - partial highlight
            const beforeHighlight = fullText.substring(0, highlightStart);
            const partialHighlight = fullText.substring(highlightStart, i);
            element.innerHTML = beforeHighlight.replace("Hi, I'm", "Hi, I'm<br>") + '<span class="highlight">' + partialHighlight + '</span>';
        } else {
            // After highlight - complete
            const beforeHighlight = fullText.substring(0, highlightStart);
            const afterHighlight = fullText.substring(highlightEnd, i);
            element.innerHTML = beforeHighlight.replace("Hi, I'm", "Hi, I'm<br>") + '<span class="highlight">' + highlightText + '</span>' + afterHighlight;
        }

        if (direction === 1) {
            if (i < fullText.length) {
                i++;
                setTimeout(frame, typeSpeed);
            } else {
                setTimeout(() => { direction = -1; setTimeout(frame, deleteSpeed); }, pauseAfterType);
            }
        } else {
            if (i > 0) {
                i--;
                setTimeout(frame, deleteSpeed);
            } else {
                direction = 1;
                setTimeout(frame, typeSpeed);
            }
        }
    }

    frame();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setTimeout(() => {
            typeWriterWithHighlightLoop(heroTitle, 80, 40, 1200);
        }, 500);
    }
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Skill Tags Animation
document.addEventListener('DOMContentLoaded', function() {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
        tag.classList.add('animate-in');
    });
});

// Project Cards Hover Effect
// Project Cards Hover Effect - use class toggle for smoother transitions
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.classList.add('project-hover');
    });
    
    card.addEventListener('mouseleave', function() {
        this.classList.remove('project-hover');
    });
});

// Achievement Cards Hover Effect - Updated for specific transformations
document.querySelectorAll('.achievement-card').forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        const img = this.querySelector('.achievement-image img');
        if (img) {
            // Apply specific hover transforms based on card position
            switch(index) {
                case 0: // InfoEducație Competition
                    img.style.transform = 'scale(1.05)';
                    img.style.objectPosition = 'center 25%';
                    break;
                case 1: // InfoEducație Medal
                    img.style.transform = 'scale(1.5)';
                    break;
                case 2: // OJTI
                    // No hover effect for OJTI (handled in CSS)
                    break;
                case 3: // ONTI
                    // No hover effect for ONTI (handled in CSS)
                    break;
                default: // Project Presentation
                    img.style.transform = 'scale(1.1)';
            }
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const img = this.querySelector('.achievement-image img');
        if (img) {
            // Restore original transforms based on card position
            switch(index) {
                case 0: // InfoEducație Competition
                    img.style.transform = 'scale(1)';
                    img.style.objectPosition = 'center 30%';
                    break;
                case 1: // InfoEducație Medal
                    img.style.transform = 'scale(1.4)';
                    break;
                case 2: // OJTI
                    // keep original transform
                    img.style.transform = 'rotate(90deg) scale(1.8)';
                    break;
                case 3: // ONTI
                    // keep original transform
                    img.style.transform = 'rotate(90deg) scale(1.8)';
                    break;
                default: // Project Presentation
                    img.style.transform = 'scale(1)';
            }
        }
    });
});

// Contact Links Animation
document.querySelectorAll('.contact-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Copy Email to Clipboard
document.addEventListener('DOMContentLoaded', function() {
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        emailLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(email).then(() => {
                    showNotification('Email copied to clipboard!');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Email copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy email');
                }
                document.body.removeChild(textArea);
            }
        });
    }
});

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #3498db;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Back to Top Button
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    `;
    
    document.body.appendChild(backToTopButton);
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    // Scroll to top functionality
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopButton.addEventListener('mouseenter', function() {
        this.style.background = '#2980b9';
        this.style.transform = 'translateY(-3px)';
    });
    
    backToTopButton.addEventListener('mouseleave', function() {
        this.style.background = '#3498db';
        this.style.transform = 'translateY(0)';
    });
});

// CV Modal: open/close and load PDF
document.addEventListener('DOMContentLoaded', function() {
    const viewBtn = document.getElementById('view-cv-btn');
    const modal = document.getElementById('cv-modal');
    const backdrop = document.getElementById('cv-modal-backdrop');
    const closeBtn = document.getElementById('cv-modal-close');
    const iframe = document.getElementById('cv-iframe');

    if (!modal || !viewBtn) return;

    function openModal() {
        iframe.src = 'cv.pdf#zoom=75';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        iframe.src = '';
        document.body.style.overflow = '';
    }

    viewBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
});

// Performance: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Error handling for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn(`Failed to load image: ${this.src}`);
        });
    });
});
