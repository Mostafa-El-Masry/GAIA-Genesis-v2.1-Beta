"use client";

import { loadNetItems } from '../lib/store';
import { loadSettings } from '../lib/persistence';

function fmt(n: number) {
  return n.toLocaleString('en-EG', { maximumFractionDigits: 0 });
}

export default function WealthTopSummary() {
  const settings = loadSettings();
  const items = loadNetItems();

  // assume net item amounts are in EGP
  const certTotal = items.filter(i => i.isCertificate).reduce((s, i) => s + i.amount, 0);
  const liquidTotal = items.filter(i => !i.isCertificate).reduce((s, i) => s + i.amount, 0);
  const netWorth = certTotal + liquidTotal;

  const monthlyExpensesKD = settings.expenses.reduce((s, e) => s + e.amountKD, 0);
  const monthlyExpensesEGP = monthlyExpensesKD * settings.fxEgpPerKd;
  const monthlySurplusKD = Math.max(0, settings.monthlyIncomeKD - monthlyExpensesKD);
  const monthlySurplusEGP = monthlySurplusKD * settings.fxEgpPerKd;

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg border gaia-border bg-card">
        <div className="text-xs text-muted-foreground">Liquid savings</div>
        <div className="text-xl font-extrabold">{fmt(liquidTotal)} EGP</div>
      </div>

      <div className="p-4 rounded-lg border gaia-border bg-card">
        <div className="text-xs text-muted-foreground">Certificates (principal)</div>
        <div className="text-xl font-extrabold">{fmt(certTotal)} EGP</div>
      </div>

      <div className="p-4 rounded-lg border gaia-border bg-card">
        <div className="text-xs text-muted-foreground">Net worth</div>
        <div className="text-xl font-extrabold">{fmt(netWorth)} EGP</div>
      </div>

      <div className="p-4 rounded-lg border gaia-border bg-card">
        <div className="text-xs text-muted-foreground">Monthly surplus (EGP)</div>
        <div className="text-xl font-extrabold">{fmt(monthlySurplusEGP)} EGP</div>
        <div className="text-xs text-muted-foreground mt-1">Expenses: {fmt(monthlyExpensesEGP)} EGP</div>
      </div>
    </div>
  );
}
