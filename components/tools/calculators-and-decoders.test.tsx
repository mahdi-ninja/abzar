import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TimestampConverter from "./timestamp-converter";
import SubnetCalculator from "./subnet-calculator";
import JwtDecoder from "./jwt-decoder";

function translate(template: string, values?: Record<string, string | number | Date>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const namespaces: Record<string, Record<string, string>> = {
      timestampConverter: {
        inputLabel: "Paste a timestamp or date string",
        inputPlaceholder: "timestamp input",
        now: "Now",
        clear: "Clear",
        parseError: "Could not parse this as a date or timestamp.",
        emptyHint: "Empty hint",
        fmtUnixSeconds: "Unix (seconds)",
        fmtUnixMs: "Unix (milliseconds)",
        fmtIso: "ISO 8601",
        fmtRfc: "RFC 2822",
        fmtLocal: "Local",
        fmtDate: "Date only",
        fmtTime: "Time only",
        fmtRelative: "Relative",
        seconds: "{count} seconds",
        minutes: "{count} minutes",
        hours: "{count} hours",
        days: "{count} days",
        months: "{count} months",
        years: "{count} years",
        ago: "{time} ago",
        inFuture: "in {time}",
      },
      subnetCalculator: {
        ipAddress: "IP Address",
        cidr: "CIDR",
        reset: "Reset",
        invalidIpOrCidr: "Invalid IP address or CIDR.",
        networkAddress: "Network Address",
        broadcastAddress: "Broadcast Address",
        subnetMask: "Subnet Mask",
        wildcardMask: "Wildcard Mask",
        firstUsableHost: "First Usable Host",
        lastUsableHost: "Last Usable Host",
        totalUsableHosts: "Total Usable Hosts",
        cidrNotation: "CIDR Notation",
      },
      jwtDecoder: {
        jwtToken: "JWT Token",
        clear: "Clear",
        placeholder: "Paste your JWT here",
        errorInvalid3Parts: "Invalid JWT: expected 3 parts separated by dots",
        errorInvalidJson: "Invalid JWT: could not parse header or payload as JSON",
        errorBase64Failed: "Invalid JWT: base64 decoding failed",
        header: "Header",
        payload: "Payload",
        signature: "Signature",
        timestamps: "Timestamps",
        issuedAt: "Issued At",
        expires: "Expires",
        notBefore: "Not Before",
        expired: "Expired",
        expiresInMinutes: "Expires in {minutes}m",
        expiresInHours: "Expires in {hours}h",
        emptyState: "Paste a JWT token to decode its header, payload, and verify expiration.",
      },
    };

    const source = namespaces[namespace] ?? {};
    return (key: string, values?: Record<string, string | number | Date>) =>
      translate(source[key] ?? key, values);
  },
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.HTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock("@/components/ui/copy-button", () => ({
  CopyButton: ({ value }: { value: string }) => <button type="button">copy {value}</button>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      aria-label="CIDR"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

function setTextInput(value: string) {
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value } });
}

describe("TimestampConverter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses Unix seconds and milliseconds", () => {
    render(<TimestampConverter />);
    setTextInput("1705320000");

    expect(screen.getByText("Unix (seconds)")).toBeInTheDocument();
    expect(screen.getByText("1705320000")).toBeInTheDocument();
    expect(screen.getByText("1705320000000")).toBeInTheDocument();
  });

  it("shows an error for invalid numeric inputs", () => {
    render(<TimestampConverter />);
    setTextInput("123");

    expect(
      screen.getByText("Could not parse this as a date or timestamp.")
    ).toBeInTheDocument();
  });

  it("accepts ISO input and formats relative future time", () => {
    render(<TimestampConverter />);
    setTextInput("2024-01-15T13:00:00Z");

    expect(screen.getByText("ISO 8601")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15T13:00:00.000Z")).toBeInTheDocument();
    expect(screen.getByText("in 1 hours")).toBeInTheDocument();
  });

  it("fills the current Unix seconds when clicking now", () => {
    render(<TimestampConverter />);
    fireEvent.click(screen.getByRole("button", { name: "Now" }));

    expect(screen.getByRole("textbox")).toHaveValue("1705320000");
  });
});

describe("SubnetCalculator", () => {
  it("calculates the default /24 subnet", () => {
    render(<SubnetCalculator />);

    expect(screen.getByText("Network Address")).toBeInTheDocument();
    expect(screen.getAllByText("192.168.1.0").length).toBeGreaterThan(0);
    expect(screen.getByText("192.168.1.255")).toBeInTheDocument();
    expect(screen.getByText("254")).toBeInTheDocument();
  });

  it("shows an error for invalid IP addresses", () => {
    render(<SubnetCalculator />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "999.1.1.1" } });

    expect(screen.getByText("Invalid IP address or CIDR.")).toBeInTheDocument();
  });

  it("handles /31 networks without subtracting usable hosts", () => {
    render(<SubnetCalculator />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "10.0.0.0" } });
    fireEvent.change(screen.getByLabelText("CIDR"), { target: { value: "31" } });

    expect(screen.getAllByText("10.0.0.0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10.0.0.1").length).toBeGreaterThan(0);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("JwtDecoder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an error when the token does not have three parts", () => {
    render(<JwtDecoder />);
    setTextInput("abc.def");

    expect(
      screen.getByText("Invalid JWT: expected 3 parts separated by dots")
    ).toBeInTheDocument();
  });

  it("shows a JSON parse error for invalid decoded content", () => {
    render(<JwtDecoder />);
    const header = Buffer.from("not-json").toString("base64url");
    const payload = Buffer.from(JSON.stringify({ sub: "123" })).toString("base64url");
    setTextInput(`${header}.${payload}.sig`);

    expect(
      screen.getByText("Invalid JWT: could not parse header or payload as JSON")
    ).toBeInTheDocument();
  });

  it("shows a base64 error for malformed token segments", () => {
    render(<JwtDecoder />);
    setTextInput("%%%.%%%.sig");

    expect(
      screen.getByText("Invalid JWT: base64 decoding failed")
    ).toBeInTheDocument();
  });

  it("renders decoded payload data and expiration status", () => {
    render(<JwtDecoder />);
    const now = Math.floor(new Date("2024-01-15T12:00:00Z").getTime() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url"
    );
    const payload = Buffer.from(
      JSON.stringify({ sub: "123", iat: now - 60, nbf: now - 60, exp: now + 30 * 60 })
    ).toString("base64url");
    setTextInput(`${header}.${payload}.signature`);

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Payload")).toBeInTheDocument();
    expect(screen.getByText("Expires in 30m")).toBeInTheDocument();
    expect(screen.getByText("Timestamps")).toBeInTheDocument();
    expect(screen.getByText("Signature")).toBeInTheDocument();
    expect(screen.getByText("signature")).toBeInTheDocument();
  });
});
