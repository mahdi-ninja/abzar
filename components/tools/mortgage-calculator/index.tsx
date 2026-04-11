"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function MortgageCalculator() {
  const [principal, setPrincipal] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
      const monthly = principal / numPayments;
      return {
        monthly,
        totalPaid: principal,
        totalInterest: 0,
        schedule: [],
      };
    }

    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPaid = monthly * numPayments;
    const totalInterest = totalPaid - principal;

    // Amortization schedule (yearly summaries)
    const schedule: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      balance: number;
    }[] = [];
    let balance = principal;
    for (let y = 1; y <= years; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interest = balance * monthlyRate;
        const princPart = monthly - interest;
        yearInterest += interest;
        yearPrincipal += princPart;
        balance -= princPart;
      }
      schedule.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        balance: Math.max(0, balance),
      });
    }

    return { monthly, totalPaid, totalInterest, schedule };
  }, [principal, rate, years]);

  // Pie chart proportions
  const principalPct =
    result.totalPaid > 0
      ? ((principal / result.totalPaid) * 100).toFixed(1)
      : "0";
  const interestPct =
    result.totalPaid > 0
      ? ((result.totalInterest / result.totalPaid) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => { setPrincipal(300000); setRate(6.5); setYears(30); }}>Reset</Button>
      </div>
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-sm mb-1 block">Loan Amount ($)</Label>
          <Input
            type="number"
            min={0}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Interest Rate (%)</Label>
          <Input
            type="number"
            min={0}
            max={30}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Term (years)</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">
            {formatCurrency(result.monthly)}
          </div>
          <div className="text-xs text-muted-foreground">Monthly Payment</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">
            {formatCurrency(result.totalPaid)}
          </div>
          <div className="text-xs text-muted-foreground">Total Paid</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold tabular-nums">
            {formatCurrency(result.totalInterest)}
          </div>
          <div className="text-xs text-muted-foreground">Total Interest</div>
        </Card>
      </div>

      {/* Visual breakdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Payment Breakdown</Label>
        <div className="flex h-6 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary transition-all"
            style={{ width: `${principalPct}%` }}
          />
          <div
            className="bg-destructive transition-all"
            style={{ width: `${interestPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            <span className="inline-block h-2 w-2 rounded-full bg-primary mr-1" />
            Principal: {principalPct}%
          </span>
          <span>
            <span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />
            Interest: {interestPct}%
          </span>
        </div>
      </div>

      {/* Amortization table */}
      {result.schedule.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Amortization Schedule</Label>
          <div className="max-h-64 overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr className="border-b">
                  <th className="px-3 py-1.5 text-left font-medium">Year</th>
                  <th className="px-3 py-1.5 text-right font-medium">Principal</th>
                  <th className="px-3 py-1.5 text-right font-medium">Interest</th>
                  <th className="px-3 py-1.5 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b last:border-0">
                    <td className="px-3 py-1.5 tabular-nums">{row.year}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatCurrency(row.principalPaid)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatCurrency(row.interestPaid)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      {formatCurrency(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
