/**
 * OneAtlas Blog Interactive Scripts
 * Author: Antigravity
 * Features: Dynamic Category Filtering, Newsletter Signup Validation, Theme Switcher Caching.
 */

document.addEventListener('DOMContentLoaded', () => {
  initBlogFilters();
  initNewsletter();
  initThemeBlog();
  initCardRippleBlog();
});

/**
 * Category Filtering Actions
 */
function initBlogFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const postCards = document.querySelectorAll('.post-row-card');
  const featuredCard = document.querySelector('.featured-card');

  if (!filterPills.length || !postCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const selectedCategory = pill.getAttribute('data-category');

      if (selectedCategory === 'all') {
        postCards.forEach(card => {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.4s ease';
          }, 50);
        });
        if (featuredCard) featuredCard.style.display = 'flex';
      } else {
        postCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (cardCategory === selectedCategory) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transition = 'opacity 0.4s ease';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });

        if (featuredCard) {
          featuredCard.style.display = 'none';
        }
      }
    });
  });
}

/**
 * Newsletter Form Validation and Simulation
 */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (email === '') {
      showFeedback('Please enter your email address.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    showFeedback('Awesome! You have been subscribed successfully.', 'success');
    input.value = '';
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showFeedback(message, type) {
  const existingMsg = document.querySelector('.newsletter-feedback');
  if (existingMsg) {
    existingMsg.remove();
  }

  const feedback = document.createElement('p');
  feedback.className = `newsletter-feedback ${type === 'success' ? 'text-success' : 'text-error'}`;
  feedback.textContent = message;
  
  feedback.style.fontSize = '12px';
  feedback.style.fontWeight = '600';
  feedback.style.marginTop = '8px';
  feedback.style.color = type === 'success' ? '#059669' : '#dc2626';

  const formContainer = document.getElementById('newsletter-form').parentNode;
  formContainer.appendChild(feedback);

  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.5s ease';
    setTimeout(() => feedback.remove(), 500);
  }, 4000);
}

/**
 * Light/Dark Mode Caching Sync
 */
function initThemeBlog() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIconBlog(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIconBlog(currentTheme);
  });
}

function updateThemeIconBlog(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  if (theme === 'dark') {
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6.6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    `;
  } else {
    themeToggleBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    `;
  }
}

/**
 * UI Ripple Effects on Click
 */
function initCardRippleBlog() {
  const interactiveItems = document.querySelectorAll('.post-row-card, .featured-card, .topic-widget-item');
  interactiveItems.forEach(item => {
    item.addEventListener('click', (e) => {
      createRippleBlog(e, item);
    });
  });
}

function createRippleBlog(event, element) {
  const circle = document.createElement('span');
  const diameter = Math.max(element.clientWidth, element.clientHeight);
  const radius = diameter / 2;

  const rect = element.getBoundingClientRect();
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add('ripple-wave');

  const existingRipple = element.querySelector('.ripple-wave');
  if (existingRipple) {
    existingRipple.remove();
  }

  element.appendChild(circle);
}
