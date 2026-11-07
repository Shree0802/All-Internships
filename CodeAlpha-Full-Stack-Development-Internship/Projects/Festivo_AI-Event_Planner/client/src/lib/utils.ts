import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  
  try {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Date TBD';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getDaysUntil(dateString: string): { days: number; text: string; isPast: boolean } {
  if (!dateString) return { days: 0, text: 'No date set', isPast: false };
  try {
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return { days: 0, text: 'Happening Today!', isPast: false };
    } else if (days < 0) {
      return { days: Math.abs(days), text: `${Math.abs(days)} days ago`, isPast: true };
    } else if (days === 1) {
      return { days: 1, text: 'Tomorrow!', isPast: false };
    } else {
      return { days, text: `${days} days away`, isPast: false };
    }
  } catch {
    return { days: 0, text: 'Date TBD', isPast: false };
  }
}

export function triggerCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F25C3B', '#DE3E1B', '#BA6595', '#C9AF43', '#4A1D36'],
    });
  } catch (e) {
    // Graceful fallback if canvas is unavailable
  }
}
