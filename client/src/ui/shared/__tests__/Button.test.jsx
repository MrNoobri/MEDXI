import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-red-600");
  });

  it("applies size classes correctly", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("h-8");
  });

  it("can be disabled", () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });
});
