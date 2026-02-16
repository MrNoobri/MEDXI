import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerificationBanner from '../VerificationBanner';
import api from '../../api/axios';

jest.mock('../../api/axios');

describe('VerificationBanner', () => {
  const mockUser = {
    email: 'test@example.com',
    emailVerified: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when user is null', () => {
    const { container } = render(<VerificationBanner user={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when email is verified', () => {
    const verifiedUser = { ...mockUser, emailVerified: true };
    const { container } = render(<VerificationBanner user={verifiedUser} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders banner for unverified email', () => {
    render(<VerificationBanner user={mockUser} />);
    
    expect(screen.getByText(/verify your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend/i })).toBeInTheDocument();
  });

  it('calls resend API when button is clicked', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    render(<VerificationBanner user={mockUser} />);

    const resendButton = screen.getByRole('button', { name: /resend/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/resend-verification');
    });
  });

  it('displays success message after resending', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    render(<VerificationBanner user={mockUser} />);

    const resendButton = screen.getByRole('button', { name: /resend/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText(/verification email sent!/i)).toBeInTheDocument();
    });
  });

  it('disables resend button during API call', async () => {
    const user = userEvent.setup();
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<VerificationBanner user={mockUser} />);

    const resendButton = screen.getByRole('button', { name: /resend/i });
    await user.click(resendButton);

    expect(screen.getByText(/sending.../i)).toBeInTheDocument();
    expect(resendButton).toBeDisabled();
  });

  it('disables resend button after success', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    render(<VerificationBanner user={mockUser} />);

    const resendButton = screen.getByRole('button', { name: /resend/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(resendButton).toBeDisabled();
    });
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    
    render(<VerificationBanner user={mockUser} onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText(/dismiss banner/i);
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<VerificationBanner user={mockUser} />);
    
    expect(screen.queryByLabelText(/dismiss banner/i)).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<VerificationBanner user={mockUser} />);
    
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });
});
