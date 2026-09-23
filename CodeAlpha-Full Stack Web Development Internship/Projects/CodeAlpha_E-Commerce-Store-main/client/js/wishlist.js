/* ====================================================
   SHOPSPHERE - WISHLIST MANAGER
   ==================================================== */

class WishlistManager {
  static async toggle(productId) {
    if (!Auth.isLoggedIn()) {
      Toast.warning('Please log in to save items to your wishlist');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    try {
      const data = await APIClient.post(`/auth/wishlist/${productId}`, {});
      if (data.success) {
        Toast.success(data.message);
        // Refresh local user storage with updated wishlist
        const user = Auth.getUser();
        if (user) {
          user.wishlist = data.wishlist;
          localStorage.setItem('shopsphere_user', JSON.stringify(user));
        }
        return data.wishlist;
      }
    } catch (error) {
      Toast.error(error.message || 'Could not update wishlist');
    }
  }

  static isWishlisted(productId) {
    const user = Auth.getUser();
    if (!user || !user.wishlist) return false;
    return user.wishlist.some(
      (item) => (typeof item === 'string' ? item : item._id) === productId
    );
  }
}
