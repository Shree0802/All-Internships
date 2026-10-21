import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../components/ui/EmptyState';

describe('EmptyState component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Products Found"
        description="Try adjusting your filters to find campus gear."
      />
    );
    expect(screen.getByText('No Products Found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters to find campus gear.')
    ).toBeInTheDocument();
  });

  it('triggers onAction callback when action button is clicked', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Gear"
        description="Nothing here"
        actionText="Reset Filters"
        onAction={handleAction}
      />
    );
    const button = screen.getByText('Reset Filters');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
