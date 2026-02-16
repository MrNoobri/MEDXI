import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { Activity } from 'lucide-react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  const defaultProps = {
    icon: Activity,
    label: 'Steps',
    value: '8,432',
    unit: 'steps',
    change: '+12%',
    color: 'blue',
    description: 'Daily average',
  };

  it('renders with all props', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('8,432')).toBeInTheDocument();
    expect(screen.getByText('steps')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('Daily average')).toBeInTheDocument();
  });

  it('applies correct color scheme', () => {
    const { container } = render(<StatsCard {...defaultProps} color="indigo" />);
    const iconContainer = container.querySelector('.bg-indigo-50');
    expect(iconContainer).toBeInTheDocument();
  });

  it('shows edit button when editable', () => {
    render(<StatsCard {...defaultProps} editable={true} />);
    const editButton = screen.getByLabelText('Edit Steps');
    expect(editButton).toBeInTheDocument();
  });

  it('does not show edit button when not editable', () => {
    render(<StatsCard {...defaultProps} editable={false} />);
    const editButton = screen.queryByLabelText('Edit Steps');
    expect(editButton).not.toBeInTheDocument();
  });
});
