import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import api from '../../api/axios';

jest.mock('../../api/axios');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form', () => {
    renderWithRouter(<ForgotPassword />);
    
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('requires email field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ForgotPassword />);

    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('displays success state after submission', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent password reset instructions/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValue({ response: { data: { message: 'Failed to send email' } } });
    
    renderWithRouter(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument();
    });
  });

  it('has back to login links', () => {
    renderWithRouter(<ForgotPassword />);
    
    const links = screen.getAllByText(/back to login/i);
    expect(links).toHaveLength(2); // One in form, one in header
  });
});
