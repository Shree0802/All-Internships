/* ====================================================
   SHOPSPHERE - USER PROFILE & ORDER HISTORY LOGIC (INR ₹)
   ==================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const profileContainer = document.getElementById('profile-content');
  const ordersContainer = document.getElementById('orders-content');
  const wishlistContainer = document.getElementById('wishlist-content');

  const formatPrice = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

  // Load User Info
  const user = await Auth.fetchProfile();
  if (!user) return;

  if (profileContainer) {
    document.getElementById('user-name-header').textContent = user.name;
    document.getElementById('user-email-header').textContent = user.email;

    document.getElementById('name-input').value = user.name || '';
    document.getElementById('phone-input').value = user.phone || '';
    document.getElementById('street-input').value = user.address?.street || '';
    document.getElementById('city-input').value = user.address?.city || '';
    document.getElementById('state-input').value = user.address?.state || '';
    document.getElementById('zip-input').value = user.address?.zipCode || '';
    document.getElementById('country-input').value = user.address?.country || 'India';

    // Handle Profile Form Submit
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const updateData = {
          name: document.getElementById('name-input').value,
          phone: document.getElementById('phone-input').value,
          address: {
            street: document.getElementById('street-input').value,
            city: document.getElementById('city-input').value,
            state: document.getElementById('state-input').value,
            zipCode: document.getElementById('zip-input').value,
            country: document.getElementById('country-input').value,
          },
        };
        const response = await APIClient.put('/auth/profile', updateData);
        if (response.success) {
          Toast.success('Profile and address updated successfully!');
          Auth.setUser(response.user);
        }
      } catch (err) {
        Toast.error(err.message || 'Failed to update profile');
      }
    });
  }

  // Load Order History
  if (ordersContainer) {
    try {
      ordersContainer.innerHTML = '<div>Loading orders...</div>';
      const data = await APIClient.get('/orders');
      if (data.success && data.orders.length > 0) {
        ordersContainer.innerHTML = data.orders
          .map(
            (order) => `
          <div style="background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="font-size: 0.85rem; color: var(--color-text-muted);">ORDER # ${order._id}</div>
                <div style="font-size: 0.9rem; font-weight: 600;">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <span class="badge badge-stock" style="text-transform: uppercase;">${order.status}</span>
                <span style="font-weight: 800; font-size: 1.1rem; margin-left: 1rem; color: var(--color-accent);">${formatPrice(order.totalPrice)}</span>
              </div>
            </div>
            
            <div>
              ${order.orderItems
                .map(
                  (item) => `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);" />
                    <div>
                      <div style="font-weight: 600;">${item.name}</div>
                      <div style="font-size: 0.85rem; color: var(--color-text-muted);">Qty: ${item.quantity} × ${formatPrice(item.price)}</div>
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('');
      } else {
        ordersContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">You have not placed any orders yet.</div>';
      }
    } catch (err) {
      ordersContainer.innerHTML = '<div style="color: var(--color-danger);">Failed to load order history.</div>';
    }
  }

  // Load Wishlist
  if (wishlistContainer && user.wishlist) {
    if (user.wishlist.length > 0) {
      wishlistContainer.innerHTML = `<div class="product-grid">${user.wishlist.map(p => ProductsUI.renderProductCard(p)).join('')}</div>`;
    } else {
      wishlistContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">Your wishlist is empty.</div>';
    }
  }
});
