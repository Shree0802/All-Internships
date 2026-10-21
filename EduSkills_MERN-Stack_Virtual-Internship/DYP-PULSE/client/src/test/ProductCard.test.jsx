import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../context/WishlistContext';

vi.mock('../services/api', () => ({
  get: vi.fn().mockImplementation((url) => {
    if (url === '/cart') return Promise.resolve({ data: { items: [] } });
    return Promise.resolve({ data: {} });
  }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  del: vi.fn().mockResolvedValue({ data: {} }),
  default: {},
}));

describe('ProductCard component', () => {
  const mockProduct = {
    _id: 'prod-123',
    name: 'DYPULSE Varsity Cricket Bat',
    slug: 'dypulse-varsity-cricket-bat',
    department: 'PLAY',
    category: 'Cricket',
    brand: 'DYPULSE PLAY',
    price: 2499,
    compareAtPrice: 3499,
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/bat.jpg', alt: 'Bat' }],
    ratings: { average: 4.9, count: 18 },
  };

  const renderCard = (product = mockProduct) => {
    return render(
      <BrowserRouter>
        <WishlistProvider>
          <CartProvider>
            <ProductCard product={product} />
          </CartProvider>
        </WishlistProvider>
      </BrowserRouter>
    );
  };

  it('renders product title, brand, and department badge', () => {
    renderCard();
    expect(screen.getByText('DYPULSE Varsity Cricket Bat')).toBeInTheDocument();
    expect(screen.getByText('DYPULSE PLAY')).toBeInTheDocument();
    expect(screen.getByText('PLAY')).toBeInTheDocument();
  });

  it('renders prices and discount percentage', () => {
    renderCard();
    expect(screen.getByText('₹2,499')).toBeInTheDocument();
    expect(screen.getByText('₹3,499')).toBeInTheDocument();
    expect(screen.getByText(/29% OFF/i)).toBeInTheDocument();
  });

  it('renders wishlist and quick add buttons', () => {
    renderCard();
    expect(screen.getByLabelText(/wishlist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quick add/i)).toBeInTheDocument();
  });

  it('handles out of stock products accurately', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderCard(outOfStockProduct);
    expect(screen.getByText('SOLD OUT')).toBeInTheDocument();
  });
});
