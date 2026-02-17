import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyAccount from "../MyAccount";
import api from "../../api/axios";

jest.mock("../../api/axios");

describe("MyAccount", () => {
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    avatar: "/uploads/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful GET request for user data
    api.get = jest.fn().mockResolvedValue({ data: { data: mockUser } });
  });

  it("renders profile form with user data", async () => {
    render(<MyAccount />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("john.doe@example.com"),
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<MyAccount />);

    await waitFor(() => screen.getByDisplayValue("John"));

    const firstNameInput = screen.getByLabelText(/first name/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    await user.clear(firstNameInput);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it("validates minimum field length", async () => {
    const user = userEvent.setup();
    render(<MyAccount />);

    await waitFor(() => screen.getByDisplayValue("John"));

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "J");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/must be at least 2 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<MyAccount />);

    await waitFor(() => screen.getByDisplayValue("John"));

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    render(<MyAccount />);

    await waitFor(() => screen.getByDisplayValue("John"));

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, "invalid-phone");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });
  });

  it("handles avatar file selection with size limit", async () => {
    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    const fileInput = screen.getByLabelText(/change avatar/i);

    // Create mock file larger than 5MB
    const largeFile = new File(["a".repeat(6 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    await fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/image size must be less than 5mb/i),
      ).toBeInTheDocument();
    });
  });

  it("submits profile update successfully", async () => {
    const user = userEvent.setup();
    api.put = jest.fn().mockResolvedValue({
      data: { data: { ...mockUser, firstName: "Jane" } },
    });

    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/users/me",
        expect.objectContaining({
          firstName: "Jane",
        }),
      );
      expect(
        screen.getByText(/profile updated successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("shows email verification notice on email change", async () => {
    const user = userEvent.setup();
    api.put = jest.fn().mockResolvedValue({
      data: { data: { ...mockUser, email: "newemail@example.com" } },
    });

    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("john.doe@example.com"));

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, "newemail@example.com");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  it("handles API errors", async () => {
    const user = userEvent.setup();
    api.put = jest.fn().mockRejectedValue({
      response: { data: { message: "Update failed" } },
    });

    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    // Modify the form to make it dirty (no longer pristine)
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "Modified");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it("disables save button when form is pristine", async () => {
    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button when form has changes", async () => {
    const user = userEvent.setup();
    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "Modified");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeEnabled();
  });

  it("displays loading state during submission", async () => {
    const user = userEvent.setup();
    api.put = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      );

    render(<MyAccount />);
    await waitFor(() => screen.getByDisplayValue("John"));

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, "Test");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText(/saving.../i)).toBeInTheDocument();
  });
});
