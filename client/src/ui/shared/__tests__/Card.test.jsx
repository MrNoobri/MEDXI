import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

describe('Card', () => {
  it('renders correctly', () => {
    const { container } = render(<Card>Test Card</Card>);
    expect(container.firstChild).toHaveClass('rounded-xl', 'border', 'bg-white');
  });

  it('renders with header and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
