"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DownloadButton } from "@/components/ui/download-button";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function InvoiceGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [generating, setGenerating] = useState(false);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: "", quantity: 1, price: 0 },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const generatePdf = useCallback(async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(24);
      doc.text("INVOICE", 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(`Invoice #: ${invoiceNumber}`, 20, y);
      doc.text(`Date: ${date}`, 140, y);
      y += 12;

      doc.setFontSize(11);
      doc.text("From:", 20, y);
      doc.text("To:", 110, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(businessName || "Your Business", 20, y);
      doc.text(clientName || "Client Name", 110, y);
      y += 16;

      // Table header
      doc.setFillColor(245, 158, 11);
      doc.rect(20, y, 170, 8, "F");
      doc.setTextColor(0);
      doc.setFontSize(9);
      doc.text("Description", 22, y + 6);
      doc.text("Qty", 120, y + 6);
      doc.text("Price", 140, y + 6);
      doc.text("Total", 165, y + 6);
      y += 12;

      doc.setTextColor(0);
      for (const item of items) {
        doc.text(item.description || "Item", 22, y);
        doc.text(String(item.quantity), 120, y);
        doc.text(fmt(item.price), 140, y);
        doc.text(fmt(item.quantity * item.price), 165, y);
        y += 8;
      }

      y += 8;
      doc.line(20, y, 190, y);
      y += 8;
      doc.text(`Subtotal: ${fmt(subtotal)}`, 140, y);
      y += 6;
      if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%): ${fmt(tax)}`, 140, y);
        y += 6;
      }
      doc.setFontSize(12);
      doc.text(`Total: ${fmt(total)}`, 140, y);

      doc.save(`${invoiceNumber}.pdf`);
    } finally {
      setGenerating(false);
    }
  }, [businessName, clientName, invoiceNumber, date, items, subtotal, tax, total, taxRate]);

  const toMarkdown = useCallback(() => {
    const lines = [
      `# Invoice ${invoiceNumber}`,
      "",
      `**Date:** ${date}`,
      "",
      `**From:** ${businessName || "Your Business"}`,
      "",
      `**To:** ${clientName || "Client Name"}`,
      "",
      "| Description | Qty | Price | Total |",
      "|---|---|---|---|",
      ...items.map((i) => `| ${i.description || "Item"} | ${i.quantity} | ${fmt(i.price)} | ${fmt(i.quantity * i.price)} |`),
      "",
      `**Subtotal:** ${fmt(subtotal)}`,
      ...(taxRate > 0 ? [`**Tax (${taxRate}%):** ${fmt(tax)}`] : []),
      "",
      `**Total: ${fmt(total)}**`,
    ];
    return lines.join("\n");
  }, [businessName, clientName, invoiceNumber, date, items, subtotal, tax, total, taxRate]);

  const toPlainText = useCallback(() => {
    const divider = "─".repeat(50);
    const lines = [
      `INVOICE ${invoiceNumber}`,
      divider,
      `Date:   ${date}`,
      `From:   ${businessName || "Your Business"}`,
      `To:     ${clientName || "Client Name"}`,
      divider,
      ...items.map((i) =>
        `${(i.description || "Item").padEnd(30)} x${String(i.quantity).padStart(3)}  ${fmt(i.price).padStart(10)}  ${fmt(i.quantity * i.price).padStart(10)}`
      ),
      divider,
      `${"Subtotal".padEnd(46)} ${fmt(subtotal).padStart(10)}`,
      ...(taxRate > 0 ? [`${"Tax (" + taxRate + "%)".padEnd(46)} ${fmt(tax).padStart(10)}`] : []),
      `${"TOTAL".padEnd(46)} ${fmt(total).padStart(10)}`,
    ];
    return lines.join("\n");
  }, [businessName, clientName, invoiceNumber, date, items, subtotal, tax, total, taxRate]);

  const toHtml = useCallback(() => {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${invoiceNumber}</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:8px 12px;border-bottom:1px solid #ddd;text-align:left}
th{background:#f5f5f5}td:nth-child(n+2){text-align:right}th:nth-child(n+2){text-align:right}.total{font-size:1.2em;font-weight:bold}</style>
</head><body>
<h1>Invoice ${invoiceNumber}</h1>
<p><strong>Date:</strong> ${date}</p>
<p><strong>From:</strong> ${businessName || "Your Business"}<br><strong>To:</strong> ${clientName || "Client Name"}</p>
<table><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
<tbody>${items.map((i) => `<tr><td>${i.description || "Item"}</td><td>${i.quantity}</td><td>${fmt(i.price)}</td><td>${fmt(i.quantity * i.price)}</td></tr>`).join("")}</tbody></table>
<p>Subtotal: ${fmt(subtotal)}</p>
${taxRate > 0 ? `<p>Tax (${taxRate}%): ${fmt(tax)}</p>` : ""}
<p class="total">Total: ${fmt(total)}</p>
</body></html>`;
  }, [businessName, clientName, invoiceNumber, date, items, subtotal, tax, total, taxRate]);

  const toCsv = useCallback(() => {
    const header = "Description,Quantity,Unit Price,Total";
    const rows = items.map((i) =>
      `"${(i.description || "Item").replace(/"/g, '""')}",${i.quantity},${i.price},${i.quantity * i.price}`
    );
    const footer = [
      `"Subtotal",,,${subtotal}`,
      ...(taxRate > 0 ? [`"Tax (${taxRate}%)",,,${tax}`] : []),
      `"Total",,,${total}`,
    ];
    return [header, ...rows, "", ...footer].join("\n");
  }, [items, subtotal, tax, total, taxRate]);

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-sm mb-1 block">Your Business Name</Label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business" />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Client Name</Label>
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Invoice #</Label>
          <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
        <div>
          <Label className="text-sm mb-1 block">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Line Items</Label>
        {items.map((item) => (
          <div key={item.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                placeholder="Description"
                className="text-sm"
              />
            </div>
            <div className="w-20">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                className="text-sm text-center"
              />
            </div>
            <div className="w-28">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={item.price}
                onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                className="text-sm"
              />
            </div>
            <div className="w-24 text-right text-sm font-mono py-2">
              {fmt(item.quantity * item.price)}
            </div>
            {items.length > 1 && (
              <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)} className="text-muted-foreground">
                ×
              </Button>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addItem}>
          + Add Item
        </Button>
      </div>

      {/* Tax + totals */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Subtotal</span>
          <span className="font-mono text-sm">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">Tax (%)</span>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-20 text-sm text-right"
          />
        </div>
        {taxRate > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Tax</span>
            <span className="font-mono text-sm">{fmt(tax)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-sm font-semibold">Total</span>
          <span className="font-mono text-lg font-bold">{fmt(total)}</span>
        </div>
      </Card>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Export</Label>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={generatePdf} disabled={generating}>
            {generating ? "Generating..." : "PDF"}
          </Button>
          <DownloadButton data={toMarkdown()} filename={`${invoiceNumber}.md`} mimeType="text/markdown" label="Markdown" />
          <DownloadButton data={toHtml()} filename={`${invoiceNumber}.html`} mimeType="text/html" label="HTML" />
          <DownloadButton data={toPlainText()} filename={`${invoiceNumber}.txt`} mimeType="text/plain" label="Plain Text" />
          <DownloadButton data={toCsv()} filename={`${invoiceNumber}.csv`} mimeType="text/csv" label="CSV" />
        </div>
      </div>
    </div>
  );
}
