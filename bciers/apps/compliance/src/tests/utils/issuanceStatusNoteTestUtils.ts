// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from "@testing-library/react";
import { describe, expect, vi, beforeEach } from "vitest";
import React from "react";

export interface IssuanceStatusNoteTestConfig {
  component: React.ComponentType<any>;
  testDescription: string;
  expectedStyling: {
    containerClasses: string[];
  };
  expectedIcon: {
    type: "time" | "check";
    color?: string;
    width: string;
    height?: string;
  };
  expectedTextContent: RegExp[];
  expectedLink?: {
    text: RegExp;
    href: string;
    target: string;
    rel: string;
    classes: string[];
  };
}

export function setupIssuanceStatusNoteTest(
  config: IssuanceStatusNoteTestConfig,
) {
  return () => {
    describe(config.testDescription, () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it("renders the component with correct styling", () => {
        render(React.createElement(config.component));

        const noteElement = screen.getByRole("note");
        expect(noteElement).toBeVisible();

        for (const className of config.expectedStyling.containerClasses) {
          expect(noteElement.className).toContain(className);
        }
      });

      it(
        "displays the " +
          (config.expectedIcon.type === "time" ? "TimeIcon" : "Check") +
          " with correct props",
        () => {
          render(React.createElement(config.component));

          const iconLabel =
            config.expectedIcon.type === "time" ? "time icon" : "check icon";
          const icon = screen.getByLabelText(iconLabel);
          expect(icon).toBeVisible();

          if (config.expectedIcon.color) {
            expect(icon).toHaveAttribute("fill", config.expectedIcon.color);
          }

          expect(icon).toHaveAttribute("width", config.expectedIcon.width);

          if (config.expectedIcon.height) {
            expect(icon).toHaveAttribute("height", config.expectedIcon.height);
          }
        },
      );

      it("contains the correct text message", () => {
        render(React.createElement(config.component));

        for (const textPattern of config.expectedTextContent) {
          expect(screen.getByText(textPattern)).toBeVisible();
        }
      });

      if (config.expectedLink) {
        it("includes a link with correct attributes", () => {
          render(React.createElement(config.component));

          const expectedLink = config.expectedLink!;

          const link = screen.getByRole("link", { name: expectedLink.text });
          expect(link).toBeVisible();

          expect(link).toHaveAttribute("href", expectedLink.href);
          expect(link).toHaveAttribute("target", expectedLink.target);
          expect(link).toHaveAttribute("rel", expectedLink.rel);

          for (const className of expectedLink.classes) {
            expect(link.className).toContain(className);
          }
        });
      }
    });
  };
}
