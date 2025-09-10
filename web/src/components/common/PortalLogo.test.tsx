import { render, screen } from "@testing-library/react";
import { PortalLogo } from "./PortalLogo";

describe("PortalLogo", () => {
  it("renders with default props", () => {
    render(<PortalLogo />);
    const logo = screen.getByRole("img");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "Portal Logo");
  });

  it("renders with custom size", () => {
    render(<PortalLogo size={48} />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveAttribute("width", "48px");
    expect(logo).toHaveAttribute("height", "48px");
  });

  it("renders with custom width and height", () => {
    render(<PortalLogo width={64} height={32} />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveAttribute("width", "64px");
    expect(logo).toHaveAttribute("height", "32px");
  });

  it("renders with custom className", () => {
    render(<PortalLogo className="custom-class" />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveClass("custom-class");
  });

  it("renders with aria-label", () => {
    render(<PortalLogo aria-label="Custom Logo" />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveAttribute("alt", "Custom Logo");
    expect(logo).toHaveAttribute("aria-label", "Custom Logo");
  });

  it("renders with color prop", () => {
    render(<PortalLogo color="blue" />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveStyle({
      filter: "hue-rotate(240deg) saturate(1.2) brightness(1.1)",
    });
  });

  it("forwards additional props", () => {
    render(<PortalLogo data-testid="portal-logo" />);
    const logo = screen.getByTestId("portal-logo");
    expect(logo).toBeInTheDocument();
  });
});
