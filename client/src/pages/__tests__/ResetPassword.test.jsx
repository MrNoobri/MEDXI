import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import api from '../../api/axios';

jest.mock('../../api/axios');

// Mock useSearchParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('token=test-token')],
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form', () => {
    renderWithRouter(<ResetPassword />);
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const toggleButton = screen.getAllByLabelText(/show password/i)[0];

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Test short password
    await user.type(passwordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'DifferentPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    });
  });

  it('displays password strength meter', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);

    // Weak password
    await user.type(passwordInput, 'password');
    await waitFor(() => {
      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    // Strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'StrongP@ss123!');
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(passwordInput, 'NewPassword123!');
    await user.type(confirmPasswordInput, 'NewPassword123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'test-token',
        password: 'NewPassword123!',
      });
    });
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValue({ 
      response: { data: { message: 'Invalid or expired token' } } 
    });
    
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'NewPassword123!');
    await user.type(confirmPasswordInput, 'NewPassword123!');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
    });
  });

  it('requires all password strength criteria', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ResetPassword />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Missing uppercase
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/must contain at least one uppercase letter/i)).toBeInTheDocument();
    });

    // Missing number
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Password');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/must contain at least one number/i)).toBeInTheDocument();
    });

    // Missing lowercase
    await user.clear(passwordInput);
    await user.type(passwordInput, 'PASSWORD123');
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/must contain at least one lowercase letter/i)).toBeInTheDocument();
    });
  });
});
