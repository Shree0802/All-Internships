/* ====================================================
   SHOPSPHERE - PRODUCTS RENDERER & FILTERS (INR ₹)
   ==================================================== */

class ProductsUI {
  static formatPrice(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  }

  static renderProductCard(product) {
    const effectivePrice = Math.round(
      product.price * (1 - (product.discount || 0) / 100)
    );
    const hasDiscount = product.discount && product.discount > 0;
    const isWishlisted = WishlistManager.isWishlisted(product._id);

    return `
      <div class="product-card" data-id="${product._id}">
        <div class="product-card-img-wrapper">
          ${
            hasDiscount
              ? `<span class="badge badge-discount product-card-badge">-${product.discount}% OFF</span>`
              : ''
          }
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); ProductsUI.handleWishlistClick('${product._id}', this)">
            ♥
          </button>
          <img src="${product.image}" alt="${product.name}" class="product-card-img" loading="lazy" />
        </div>
        <div class="product-card-body">
          <span class="product-category-name">${product.category}</span>
          <h3 class="product-title" title="${product.name}">${product.name}</h3>
          <div class="product-rating">
            <span>★ ${product.rating || 4.5}</span>
            <span style="color: var(--color-text-muted);">(${product.numReviews || 12})</span>
          </div>
          <div class="product-price-row">
            <span class="product-current-price">${this.formatPrice(effectivePrice)}</span>
            ${
              hasDiscount
                ? `<span class="product-old-price">${this.formatPrice(product.price)}</span>`
                : ''
            }
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="event.stopPropagation(); ProductsUI.handleAddToCart('${product._id}')">
              Add To Cart
            </button>
            <button class="btn btn-secondary btn-sm" style="padding: 0.5rem;" onclick="event.stopPropagation(); window.location.href='/product-details?id=${product._id}'">
              View
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static async handleAddToCart(productId) {
    try {
      const product = await APIClient.get(`/products/${productId}`);
      if (product.success) {
        await CartManager.addItem(productId, 1, product.product);
      }
    } catch (e) {
      await CartManager.addItem(productId, 1);
    }
  }

  static async handleWishlistClick(productId, btnElement) {
    const updatedWishlist = await WishlistManager.toggle(productId);
    if (updatedWishlist) {
      const isNowWishlisted = WishlistManager.isWishlisted(productId);
      btnElement.classList.toggle('active', isNowWishlisted);
    }
  }
}
