import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "@jest/globals";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../Navbar";
import { ThemeProvider } from "../../shared/ThemeProvider";

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </BrowserRouter>,
  );
};

describe("Navbar", () => {
  it("renders with user name", () => {
    renderWithProviders(<Navbar userName="John Doe" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays unread count badge", () => {
    renderWithProviders(<Navbar userName="John" unreadCount={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onLogoClick when logo is clicked", () => {
    const handleLogoClick = vi.fn();
    renderWithProviders(
      <Navbar userName="John" onLogoClick={handleLogoClick} />,
    );

    const logo = screen.getByText(/MEDXI/);
    fireEvent.click(logo);
    expect(handleLogoClick).toHaveBeenCalledTimes(1);
  });

  it("shows MED and XI with correct colors", () => {
    const { container } = renderWithProviders(<Navbar userName="John" />);
    const medText = screen.getByText("MED");
    const xiText = screen.getByText("XI");

    expect(medText).toHaveClass("text-indigo-600");
    expect(xiText).toHaveClass("text-blue-500");
  });
});
