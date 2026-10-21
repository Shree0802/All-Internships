import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/layout/Header';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../hooks/useCart';
import { WishlistProvider } from '../context/WishlistContext';

// Mock api calls to avoid unhandled network requests in jsdom
vi.mock('../services/api', () => ({
  get: vi.fn().mockImplementation((url) => {
    if (url === '/auth/me') return Promise.resolve({ data: { user: null } });
    if (url === '/cart') return Promise.resolve({ data: { items: [] } });
    return Promise.resolve({ data: {} });
  }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  del: vi.fn().mockResolvedValue({ data: {} }),
  default: {},
}));

describe('Header component', () => {
  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders DYPULSE brand logo and badge', () => {
    renderHeader();
    expect(screen.getByText('DY')).toBeInTheDocument();
    expect(screen.getByText('PULSE')).toBeInTheDocument();
  });

  it('renders the two department links DYPULSE PLAY and DYPULSE CAMPUS', () => {
    renderHeader();
    const playLinks = screen.getAllByText(/PLAY/i);
    expect(playLinks.length).toBeGreaterThan(0);

    const campusLinks = screen.getAllByText(/CAMPUS/i);
    expect(campusLinks.length).toBeGreaterThan(0);
  });

  it('renders search and cart buttons', () => {
    renderHeader();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cart/i)).toBeInTheDocument();
  });
});
