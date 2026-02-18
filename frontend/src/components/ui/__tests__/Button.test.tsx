import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, IconButton } from '../Button';
import { Camera } from '@phosphor-icons/react';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-terracotta');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-sage');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-terracotta');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders with left icon', () => {
    render(<Button iconLeft={<Camera data-testid="icon" />}>With Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    render(<Button iconRight={<Camera data-testid="icon" />}>With Icon</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies fullWidth styles', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('applies size styles', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });
});

describe('IconButton', () => {
  it('renders with icon and label', () => {
    render(<IconButton icon={<Camera />} label="Take photo" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Take photo');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <IconButton
        icon={<Camera />}
        label="Take photo"
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<IconButton icon={<Camera />} label="Primary" variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-terracotta');
  });

  it('applies size styles', () => {
    render(<IconButton icon={<Camera />} label="Large" size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('w-12', 'h-12');
  });
});
