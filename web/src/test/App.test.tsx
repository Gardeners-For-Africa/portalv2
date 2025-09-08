import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    // This is a basic test - you can add more specific assertions based on your App component
    expect(document.body).toBeInTheDocument();
  });
});
