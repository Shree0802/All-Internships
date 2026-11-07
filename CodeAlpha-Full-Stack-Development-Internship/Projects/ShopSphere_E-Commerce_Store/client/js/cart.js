/* ====================================================
   SHOPSPHERE - SHOPPING CART MANAGER
   ==================================================== */

class CartManager {
  static getLocalCart() {
    const cartStr = localStorage.getItem('shopsphere_guest_cart');
    return cartStr ? JSON.parse(cartStr) : { items: [], totalPrice: 0 };
  }

  static saveLocalCart(cart) {
    localStorage.setItem('shopsphere_guest_cart', JSON.stringify(cart));
    this.updateCartBadge(cart.items.reduce((sum, item) => sum + item.quantity, 0));
  }

  static updateCartBadge(count) {
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach((b) => {
      b.textContent = count || 0;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  static async getCart() {
    if (Auth.isLoggedIn()) {
      try {
        const data = await APIClient.get('/cart');
        if (data.success) {
          const totalQty = data.cart.items.reduce((sum, i) => sum + i.quantity, 0);
          this.updateCartBadge(totalQty);
          return data.cart;
        }
      } catch (error) {
        console.error('Fetch server cart error:', error);
      }
    }
    const local = this.getLocalCart();
    this.updateCartBadge(local.items.reduce((sum, i) => sum + i.quantity, 0));
    return local;
  }

  static async addItem(productId, quantity = 1, productDetails = null) {
    if (Auth.isLoggedIn()) {
      try {
        const data = await APIClient.post('/cart', { productId, quantity });
        if (data.success) {
          Toast.success('Product added to your cart!');
          const totalQty = data.cart.items.reduce((sum, i) => sum + i.quantity, 0);
          this.updateCartBadge(totalQty);
          return data.cart;
        }
      } catch (error) {
        Toast.error(error.message || 'Failed to add product to cart');
        return null;
      }
    }

    // Guest Cart Fallback
    const local = this.getLocalCart();
    const existingIndex = local.items.findIndex(
      (item) => item.product._id === productId || item.product === productId
    );

    const price = productDetails
      ? productDetails.price * (1 - (productDetails.discount || 0) / 100)
      : 50;

    if (existingIndex > -1) {
      local.items[existingIndex].quantity += quantity;
    } else {
      local.items.push({
        product: productDetails || { _id: productId, name: 'Product', price },
        quantity,
        price,
      });
    }

    local.totalPrice = local.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.saveLocalCart(local);
    Toast.success('Product added to your cart!');
    return local;
  }

  static async updateQuantity(productId, quantity) {
    if (Auth.isLoggedIn()) {
      try {
        const data = await APIClient.put('/cart/item', { productId, quantity });
        if (data.success) {
          const totalQty = data.cart.items.reduce((sum, i) => sum + i.quantity, 0);
          this.updateCartBadge(totalQty);
          return data.cart;
        }
      } catch (error) {
        Toast.error(error.message || 'Failed to update quantity');
      }
    }

    const local = this.getLocalCart();
    const item = local.items.find(
      (i) => i.product._id === productId || i.product === productId
    );
    if (item) {
      item.quantity = parseInt(quantity, 10);
      local.totalPrice = local.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      this.saveLocalCart(local);
    }
    return local;
  }

  static async removeItem(productId) {
    if (Auth.isLoggedIn()) {
      try {
        const data = await APIClient.delete(`/cart/item/${productId}`);
        if (data.success) {
          Toast.success('Item removed from cart');
          const totalQty = data.cart.items.reduce((sum, i) => sum + i.quantity, 0);
          this.updateCartBadge(totalQty);
          return data.cart;
        }
      } catch (error) {
        Toast.error(error.message || 'Failed to remove item');
      }
    }

    const local = this.getLocalCart();
    local.items = local.items.filter(
      (i) => i.product._id !== productId && i.product !== productId
    );
    local.totalPrice = local.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    this.saveLocalCart(local);
    Toast.success('Item removed from cart');
    return local;
  }
}
