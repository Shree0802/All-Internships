import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/ui/Badge';

describe('Badge component', () => {
  it('renders children text correctly', () => {
    render(<Badge>NEW DROP</Badge>);
    expect(screen.getByText('NEW DROP')).toBeInTheDocument();
  });

  it('renders with play variant styles', () => {
    const { container } = render(<Badge variant="play">PLAY</Badge>);
    expect(container.firstChild).toHaveClass('bg-[#2677FF]/10');
    expect(container.firstChild).toHaveClass('text-[#2677FF]');
  });

  it('renders with campus variant styles', () => {
    const { container } = render(<Badge variant="campus">CAMPUS</Badge>);
    expect(container.firstChild).toHaveClass('bg-[#F044A5]/10');
    expect(container.firstChild).toHaveClass('text-[#F044A5]');
  });
});
