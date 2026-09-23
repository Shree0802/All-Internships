/* ====================================================
   SHOPSPHERE - CHECKOUT PAGE LOGIC (INR ₹)
   ==================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const checkoutSummaryContainer = document.getElementById('checkout-summary');
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutSummaryContainer || !checkoutForm) return;

  const formatPrice = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

  // Pre-fill user profile address if available
  const user = Auth.getUser();
  if (user && user.address) {
    if (document.getElementById('street')) document.getElementById('street').value = user.address.street || '';
    if (document.getElementById('city')) document.getElementById('city').value = user.address.city || '';
    if (document.getElementById('state')) document.getElementById('state').value = user.address.state || '';
    if (document.getElementById('zipCode')) document.getElementById('zipCode').value = user.address.zipCode || '';
    if (document.getElementById('country')) document.getElementById('country').value = user.address.country || 'India';
  }

  // Load Cart Data
  const cart = await CartManager.getCart();

  if (!cart || !cart.items || cart.items.length === 0) {
    Toast.warning('Your shopping cart is empty');
    window.location.href = '/products';
    return;
  }

  const itemsPrice = cart.items.reduce(
    (sum, item) => sum + (item.price || item.product.price) * item.quantity,
    0
  );
  const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST in India
  const shippingPrice = itemsPrice > 1000 ? 0 : 99; // Free shipping over ₹1,000
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Render Order Summary
  checkoutSummaryContainer.innerHTML = `
    <h3 style="margin-bottom: 1.25rem;">Order Summary (${cart.items.length} items)</h3>
    <div style="max-height: 250px; overflow-y: auto; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;">
      ${cart.items
        .map(
          (item) => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${item.product.image}" style="width: 45px; height: 45px; object-fit: cover; border-radius: var(--radius-sm);" />
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">${item.product.name}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">Qty: ${item.quantity}</div>
            </div>
          </div>
          <div style="font-weight: 700;">${formatPrice((item.price || item.product.price) * item.quantity)}</div>
        </div>
      `
        )
        .join('')}
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
      <span>Subtotal</span>
      <span>${formatPrice(itemsPrice)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
      <span>GST (18%)</span>
      <span>${formatPrice(taxPrice)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem;">
      <span>Shipping</span>
      <span>${shippingPrice === 0 ? '<strong style="color: var(--color-success);">FREE</strong>' : formatPrice(shippingPrice)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; border-top: 1.5px solid var(--color-border); padding-top: 1rem; margin-bottom: 1.5rem;">
      <span>Total Amount</span>
      <span style="color: var(--color-accent); font-family: var(--font-heading);">${formatPrice(totalPrice)}</span>
    </div>
  `;

  // Submit Order Form
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = checkoutForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Order...';

    const orderData = {
      orderItems: cart.items.map((item) => ({
        product: item.product._id || item.product,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price || item.product.price,
        image: item.product.image,
      })),
      shippingAddress: {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
      },
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'UPI / Credit Card',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    try {
      const response = await APIClient.post('/orders', orderData);
      if (response.success && response.order) {
        // Clear local guest cart if present
        localStorage.removeItem('shopsphere_guest_cart');
        CartManager.updateCartBadge(0);
        Toast.success('Order placed successfully!');
        window.location.href = `/order-success?id=${response.order._id}`;
      }
    } catch (error) {
      Toast.error(error.message || 'Failed to place order. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  });
});
