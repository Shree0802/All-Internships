/* ====================================================
   SHOPSPHERE - MAIN INITIALIZATION & UI INTERACTION (INR ₹)
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const formatPrice = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

  // Theme Manager (Light / Dark mode)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const currentTheme = localStorage.getItem('shopsphere_theme') || 'light';

  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('shopsphere_theme', isDark ? 'dark' : 'light');
      themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Live Search Auto-complete Header Input
  const searchInput = document.getElementById('nav-search-input');
  const suggestionsBox = document.getElementById('search-suggestions');

  if (searchInput && suggestionsBox) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();

      if (query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const data = await APIClient.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
          if (data.success && data.products.length > 0) {
            suggestionsBox.innerHTML = data.products
              .map(
                (p) => `
              <div class="search-suggestion-item" onclick="window.location.href='/product-details?id=${p._id}'">
                <img src="${p.image}" class="search-suggestion-thumb" alt="${p.name}" />
                <div>
                  <div style="font-weight:600; font-size: 0.85rem;">${p.name}</div>
                  <div style="font-size:0.75rem; color: var(--color-accent); font-weight:700;">${formatPrice(p.price * (1 - (p.discount||0)/100))}</div>
                </div>
              </div>
            `
              )
              .join('');
            suggestionsBox.style.display = 'block';
          } else {
            suggestionsBox.innerHTML = '<div style="padding:0.75rem; text-align:center; font-size:0.85rem; color:var(--color-text-muted);">No products found</div>';
            suggestionsBox.style.display = 'block';
          }
        } catch (err) {
          suggestionsBox.style.display = 'none';
        }
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  // Render User Auth Header State
  const user = Auth.getUser();
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuBtn && userDropdown) {
    if (user) {
      userDropdown.innerHTML = `
        <div class="user-dropdown-header">
          Hi, ${user.name}
          <div style="font-size:0.75rem; font-weight:normal; color:var(--color-text-muted);">${user.email}</div>
        </div>
        <div class="user-dropdown-item" onclick="window.location.href='/profile'">
          👤 My Profile & Address
        </div>
        <div class="user-dropdown-item" onclick="window.location.href='/order-history'">
          📦 My Orders
        </div>
        ${user.role === 'admin' ? '<div class="user-dropdown-item" style="color:var(--color-accent);">🛡️ Admin Portal</div>' : ''}
        <div class="user-dropdown-item" style="color:var(--color-danger); border-top:1px solid var(--color-border);" onclick="Auth.logout()">
          🚪 Logout
        </div>
      `;
    } else {
      userDropdown.innerHTML = `
        <div class="user-dropdown-item" onclick="window.location.href='/login'">
          🔑 Sign In
        </div>
        <div class="user-dropdown-item" onclick="window.location.href='/register'">
          ✨ Create Account
        </div>
      `;
    }

    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
  }

  // Initialize Cart Badge
  CartManager.getCart();
});
