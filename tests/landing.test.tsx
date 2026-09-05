import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

import Home from "@/app/page";

describe("Landing", () => {
  it("shows the proposition and accessible authentication entry points", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Understand first\.\s*Modernize safely\./,
    );
    expect(screen.getAllByRole("link", { name: "Iniciar sesión" })[0]).toHaveAttribute(
      "href",
      "/auth/login",
    );
    expect(screen.getAllByRole("link", { name: "Comenzar" })[0]).toHaveAttribute(
      "href",
      "/auth/register",
    );
  });

  it("shows the modernization flow in order and the platform capabilities", () => {
    render(<Home />);

    const [flow] = screen.getAllByRole("list", {
      name: "Flujo principal de LegacyLift",
    });
    expect(flow).toHaveTextContent(
      /DISCOVER[\s\S]*UNDERSTAND[\s\S]*PLAN[\s\S]*MODERNIZE[\s\S]*VERIFY/,
    );

    for (const capability of [
      "Legacy Discovery",
      "System Knowledge",
      "Technical Debt Assessment",
      "Modernization Planning",
      "AI-Assisted Modernization",
      "Behavior Verification",
    ]) {
      expect(screen.getAllByText(capability)[0]).toBeVisible();
    }
  });
});
