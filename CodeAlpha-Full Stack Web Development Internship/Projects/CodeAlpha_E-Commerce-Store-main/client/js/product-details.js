/* ====================================================
   SHOPSPHERE - PRODUCT DETAILS PAGE MANAGER (INR ₹)
   ==================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/products';
    return;
  }

  const detailsContainer = document.getElementById('product-details-container');
  if (!detailsContainer) return;

  try {
    detailsContainer.innerHTML = '<div class="text-center" style="padding: 4rem;">Loading product details...</div>';
    const data = await APIClient.get(`/products/${productId}`);

    if (data.success && data.product) {
      const product = data.product;
      const effectivePrice = Math.round(
        product.price * (1 - (product.discount || 0) / 100)
      );
      const isWishlisted = WishlistManager.isWishlisted(product._id);

      const formatPrice = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

      detailsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: start;">
          <!-- Product Image -->
          <div style="background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 1rem; position: relative;">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-md); max-height: 480px; object-fit: cover;" />
            ${
              product.discount > 0
                ? `<span class="badge badge-discount" style="position: absolute; top: 20px; left: 20px;">-${product.discount}% OFF</span>`
                : ''
            }
          </div>

          <!-- Product Meta & Actions -->
          <div>
            <span class="badge badge-category" style="margin-bottom: 0.75rem;">${product.category}</span>
            <h1 style="font-size: 2.2rem; margin-bottom: 0.75rem;">${product.name}</h1>
            
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
              <span style="color: var(--color-warning); font-size: 1.1rem; font-weight: 700;">★ ${product.rating}</span>
              <span style="color: var(--color-text-muted);">(${product.numReviews} Reviews)</span>
              <span class="badge ${product.stock > 0 ? 'badge-stock' : 'badge-out-stock'}">
                ${product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>

            <div style="display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.5rem;">
              <span style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary); font-family: var(--font-heading);">${formatPrice(effectivePrice)}</span>
              ${
                product.discount > 0
                  ? `<span style="font-size: 1.2rem; color: var(--color-text-muted); text-decoration: line-through;">${formatPrice(product.price)}</span>`
                  : ''
              }
            </div>

            <p style="color: var(--color-text-muted); font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem;">
              ${product.description}
            </p>

            <!-- Quantity Selector & Actions -->
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
              <div style="display: flex; align-items: center; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-card-bg);">
                <button id="qty-minus" style="padding: 0.75rem 1rem; border: none; background: transparent; cursor: pointer; font-size: 1.2rem; font-weight: 700;">-</button>
                <input id="qty-input" type="number" value="1" min="1" max="${product.stock}" style="width: 50px; text-align: center; border: none; font-weight: 700; font-size: 1.1rem; -moz-appearance: textfield;" />
                <button id="qty-plus" style="padding: 0.75rem 1rem; border: none; background: transparent; cursor: pointer; font-size: 1.2rem; font-weight: 700;">+</button>
              </div>

              <button id="add-to-cart-btn" class="btn btn-primary" style="flex: 1; padding: 0.9rem 1.5rem;" ${product.stock === 0 ? 'disabled' : ''}>
                🛒 Add To Cart
              </button>
              
              <button id="wishlist-toggle-btn" class="btn btn-secondary ${isWishlisted ? 'active' : ''}" style="padding: 0.9rem 1.2rem;">
                ♥
              </button>
            </div>

            <!-- Features Highlights -->
            <div style="border-top: 1px solid var(--color-border); padding-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
              <div>⚡ <strong>Fast Shipping</strong> (2-4 Business Days)</div>
              <div>🛡️ <strong>1 Year Warranty</strong> Included</div>
              <div>🔄 <strong>30-Day Easy Returns</strong> Policy</div>
              <div>💳 <strong>Secure Checkout</strong> Encryption</div>
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      const qtyInput = document.getElementById('qty-input');
      document.getElementById('qty-minus').addEventListener('click', () => {
        if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
      });
      document.getElementById('qty-plus').addEventListener('click', () => {
        if (parseInt(qtyInput.value) < product.stock) qtyInput.value = parseInt(qtyInput.value) + 1;
      });

      document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
        const qty = parseInt(qtyInput.value) || 1;
        await CartManager.addItem(product._id, qty, product);
      });

      document.getElementById('wishlist-toggle-btn').addEventListener('click', async (e) => {
        const updatedWishlist = await WishlistManager.toggle(product._id);
        if (updatedWishlist) {
          const isNowWishlisted = WishlistManager.isWishlisted(product._id);
          e.currentTarget.classList.toggle('active', isNowWishlisted);
        }
      });
    }
  } catch (error) {
    detailsContainer.innerHTML = '<div class="text-center" style="padding: 4rem; color: var(--color-danger);">Failed to load product details. Product may not exist.</div>';
  }
});
