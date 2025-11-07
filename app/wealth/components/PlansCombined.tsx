"use client";

import { useState } from "react";
import { Plan, FinancialMetrics, PLANS } from "../lib/wealthLevels";
import { MonthRow } from "../lib/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
import { loadSettings } from "../lib/persistence";
import { TabNav } from "./TabNav";
import {
  determineWealthLevel,
  determineActivePlan,
  calculatePlanProgress,
  principalForMonthlyPayout,
  simulateMonthsToMonthlyInterest,
} from "../lib/wealthCalculations";
import { simulateUntilMonthlyTarget } from "../lib/sim";
import { loadNetItems, addInvestment, saveNetItems } from "../lib/store";
import ResetSettings from "./ResetSettings";
import ProgressBarAnimated from "./ProgressBarAnimated";

interface PlansTabViewProps {
  metrics: FinancialMetrics;
}

export function PlansTabView({ metrics }: PlansTabViewProps) {
  const settings = loadSettings();
  const [selectedPlan, setSelectedPlan] = useState<"D" | "C" | "B" | "A">("D");
  const [, setTick] = useState(0);

  const monthlyExpensesKD = settings.expenses.reduce(
    (s, e) => s + e.amountKD,
    0
  );
  const monthlySurplusKD = Math.max(
    0,
    settings.monthlyIncomeKD - monthlyExpensesKD
  );
  const monthlyEgpContribution = 25000; // Fixed monthly deposit

  const aprSchedule = settings.aprSchedule;
  const currentAprPercent =
    aprSchedule[0]?.aprPercent ??
    aprSchedule[aprSchedule.length - 1]?.aprPercent ??
    0;
  const currentAprDecimal = currentAprPercent / 100;

  const inferredPrincipalFromNet = (() => {
    try {
      const items = loadNetItems();
      const re = /cert|certificate|cd|cdu|deposit/i;
      return items
        .filter((i) => i.amount > 0 && re.test(i.name))
        .reduce((s, i) => s + i.amount, 0);
    } catch (e) {
      return 0;
    }
  })();

  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [invName, setInvName] = useState("New Investment");
  const [invPrincipal, setInvPrincipal] = useState<number | "">(100000);
  const [invStartDate, setInvStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [invEndDate, setInvEndDate] = useState<string>("");
  const [invApr, setInvApr] = useState<number>(
    settings.aprSchedule?.[0]?.aprPercent ?? 17
  );
  const [invMonthlyRev, setInvMonthlyRev] = useState<number | null>(null);

  const handleAddInvestment = () => {
    setShowInvestmentForm(true);
    setInvName("New Investment");
    setInvPrincipal(100000);
    setInvStartDate(new Date().toISOString().slice(0, 10));
    setInvEndDate("");
    setInvApr(settings.aprSchedule?.[0]?.aprPercent ?? 17);
    setInvMonthlyRev(null);
  };

  const saveInvestmentFromForm = () => {
    try {
      const principal = Number(invPrincipal);
      if (!principal || principal <= 0) {
        alert("Enter valid principal");
        return;
      }
      const aprPercent = Number(invApr) || 0;
      addInvestment({
        name: invName,
        principal,
        annualRatePercent: aprPercent,
        startDate: invStartDate || undefined,
        endDate: invEndDate || undefined,
      });
      setTick((t) => t + 1);
      setShowInvestmentForm(false);
    } catch (e) {
      console.error(e);
      alert("Failed to add investment");
    }
  };

  const certificatePrincipal = (() => {
    try {
      const items = loadNetItems();
      return items
        .filter((i) => i.isCertificate && i.amount > 0)
        .reduce((s, i) => s + i.amount, 0);
    } catch (e) {
      return 0;
    }
  })();

  const investments = (() => {
    try {
      return loadNetItems().filter((i) => i.isCertificate);
    } catch (e) {
      return [] as any[];
    }
  })();

  const removeInvestment = (id: string) => {
    try {
      const items = loadNetItems().filter((i) => i.id !== id);
      saveNetItems(items);
      setTick((t) => t + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to remove investment");
    }
  };

  const startPrincipalEGP =
    settings.startingPrincipalEgp && settings.startingPrincipalEgp > 0
      ? settings.startingPrincipalEgp
      : inferredPrincipalFromNet;
  const reinvestFraction = settings.reinvest
    ? (settings.reinvestPercent ?? 100) / 100
    : 0;

  const planCalculations = {
    D: {
      title: "Catching my Breath",
      objective: PLANS.D.objective,
      targetEGP: settings.planDTargetMonthlyEgp,
      get targetPrincipalEGP() {
        return principalForMonthlyPayout(this.targetEGP, currentAprDecimal);
      },
      get currentMonthlyInterest() {
        const items = loadNetItems();
        return items
          .filter((i) => i.isCertificate && i.monthlyRevenue)
          .reduce((sum, i) => sum + (i.monthlyRevenue || 0), 0);
      },
      get progressPct() {
        return Math.min(
          100,
          (this.currentMonthlyInterest / this.targetEGP) * 100
        );
      },
      get simulation() {
        const currentPrincipal = (() => {
          try {
            return loadNetItems()
              .filter((i) => i.isCertificate && i.amount > 0)
              .reduce((sum, i) => sum + i.amount, 0);
          } catch (e) {
            return startPrincipalEGP;
          }
        })();
        const currentMonthlyInterest = this.currentMonthlyInterest;
        if (currentMonthlyInterest >= this.targetEGP) {
          return {
            months: 0,
            principal: currentPrincipal,
            monthlyInterest: currentMonthlyInterest,
          };
        }
        return simulateMonthsToMonthlyInterest(
          currentPrincipal,
          monthlyEgpContribution,
          currentAprDecimal,
          this.targetEGP,
          reinvestFraction
        );
      },
      get isComplete() {
        return this.currentMonthlyInterest >= this.targetEGP;
      },
    },
    C: {
      title: "Stabilize",
      objective: PLANS.C.objective,
      targetEGP: settings.planCTargetMonthlyEgp ?? 10000,
      get targetPrincipalEGP() {
        return principalForMonthlyPayout(this.targetEGP, currentAprDecimal);
      },
      get currentMonthlyInterest() {
        return startPrincipalEGP * (currentAprDecimal / 12);
      },
      get progressPct() {
        return Math.min(
          100,
          (this.currentMonthlyInterest / this.targetEGP) * 100
        );
      },
      get simulation() {
        return simulateMonthsToMonthlyInterest(
          startPrincipalEGP,
          monthlyEgpContribution,
          currentAprDecimal,
          this.targetEGP,
          reinvestFraction
        );
      },
      get isComplete() {
        return this.currentMonthlyInterest >= this.targetEGP;
      },
    },
    B: {
      title: "Secure",
      objective: PLANS.B.objective,
      targetEGP: Math.max(
        1,
        Math.round(monthlyExpensesKD * settings.fxEgpPerKd)
      ),
      get targetPrincipalEGP() {
        return principalForMonthlyPayout(this.targetEGP, currentAprDecimal);
      },
      get currentMonthlyInterest() {
        return startPrincipalEGP * (currentAprDecimal / 12);
      },
      get progressPct() {
        return Math.min(
          100,
          (this.currentMonthlyInterest / this.targetEGP) * 100
        );
      },
      get simulation() {
        return simulateMonthsToMonthlyInterest(
          startPrincipalEGP,
          monthlyEgpContribution,
          currentAprDecimal,
          this.targetEGP,
          reinvestFraction
        );
      },
      get isComplete() {
        return this.currentMonthlyInterest >= this.targetEGP;
      },
    },
    A: {
      title: "Grow",
      objective: PLANS.A.objective,
      targetEGP: 1.5 * monthlyExpensesKD * settings.fxEgpPerKd,
      get targetPrincipalEGP() {
        return principalForMonthlyPayout(this.targetEGP, currentAprDecimal);
      },
      get currentMonthlyInterest() {
        return startPrincipalEGP * (currentAprDecimal / 12);
      },
      get progressPct() {
        return Math.min(
          100,
          (this.currentMonthlyInterest / this.targetEGP) * 100
        );
      },
      get simulation() {
        return simulateMonthsToMonthlyInterest(
          startPrincipalEGP,
          monthlyEgpContribution,
          currentAprDecimal,
          this.targetEGP,
          reinvestFraction
        );
      },
      get isComplete() {
        return this.currentMonthlyInterest >= this.targetEGP;
      },
    },
  } as const;

  const activePlan = settings.activePlan ?? "D";
  const planKeys = ["D", "C", "B", "A"] as const;
  const selectedPlanData = planCalculations[selectedPlan];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2 w-full">
        {planKeys.map((planKey) => (
          <TabNav
            key={planKey}
            tabKey={planKey}
            title={`Plan ${planKey}`}
            isSelected={selectedPlan === planKey}
            isActive={planKey === activePlan}
            isComplete={planCalculations[planKey].isComplete}
            onClick={() => setSelectedPlan(planKey)}
          />
        ))}
      </div>

      <div
        className={`p-6 rounded-lg border transition-all duration-300 ${
          activePlan === selectedPlan
            ? "border-primary bg-primary/8 scale-[1.01] ring-2 ring-primary/30 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            : selectedPlanData.isComplete
            ? "border-green-300 bg-green-50/70 shadow-sm hover:shadow hover:scale-[1.01]"
            : "border-muted bg-card hover:border-muted/80 hover:shadow-sm"
        }`}
      >
        {selectedPlan !== "D" && (
          <div className="mb-3 text-xs text-muted-foreground">
            Your savings from Plan D continue to carry forward into this plan.
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">{`Plan ${selectedPlan} · ${selectedPlanData.title}`}</h3>
            {activePlan === selectedPlan && (
              <div className="mt-1 text-sm px-3 py-1 rounded-full bg-primary text-primary-foreground inline-block shadow-sm">
                Active plan
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPlanData.objective}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedPlanData.isComplete && (
              <div className="text-green-600 flex items-center gap-1">
                <span>✓</span>
                <span className="text-sm font-medium">Complete</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm"
                onClick={handleAddInvestment}
                title="Add an investment that produces revenue"
              >
                Add Investment
              </button>
              <ResetSettings />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-sm font-medium">
              {Math.round(selectedPlanData.progressPct)}%
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <ProgressBarAnimated
              percent={Math.min(100, selectedPlanData.progressPct)}
              isComplete={selectedPlanData.isComplete}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">
              Target monthly (EGP):{" "}
            </span>
            <span className="font-medium">
              {Math.round(selectedPlanData.targetEGP).toLocaleString()} EGP
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">
              Target principal (EGP):{" "}
            </span>
            <span className="font-medium">
              {Math.round(selectedPlanData.targetPrincipalEGP).toLocaleString()}{" "}
              EGP
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">
              Current monthly interest (EGP):{" "}
            </span>
            <span className="font-medium">
              {Math.round(
                selectedPlanData.currentMonthlyInterest
              ).toLocaleString()}{" "}
              EGP
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Monthly deposit</div>
            <div className="font-medium">
              {Math.round(monthlyEgpContribution).toLocaleString()} EGP
            </div>
          </div>
        </div>

        {showInvestmentForm && (
          <div className="mt-4 p-3 border rounded bg-muted/5">
            <h4 className="text-sm font-medium mb-2">New Investment</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Principal (EGP)
                </label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  type="number"
                  value={String(invPrincipal)}
                  onChange={(e) =>
                    setInvPrincipal(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Start date
                </label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  type="date"
                  value={invStartDate}
                  onChange={(e) => setInvStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  End date
                </label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  type="date"
                  value={invEndDate}
                  onChange={(e) => setInvEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">APR (%)</label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  type="number"
                  step="0.1"
                  value={invApr}
                  onChange={(e) => {
                    setInvApr(Number(e.target.value));
                    setInvMonthlyRev(null);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Monthly revenue (EGP)
                </label>
                <input
                  className="w-full p-1 rounded border gaia-border"
                  type="number"
                  step="0.01"
                  value={
                    invMonthlyRev ??
                    Math.round(
                      ((Number(invPrincipal) || 0) * (Number(invApr) / 100)) /
                        12
                    )
                  }
                  onChange={(e) =>
                    setInvMonthlyRev(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={saveInvestmentFromForm}
              >
                Save
              </button>
              <button
                className="px-3 py-1 rounded border gaia-border"
                onClick={() => setShowInvestmentForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {investments.length > 0 && selectedPlan === activePlan && (
          <div className="mt-4 p-3 border rounded bg-muted/5">
            <h4 className="text-sm font-medium mb-2">Investments</h4>
            <div className="space-y-2">
              {investments.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-2 p-2 rounded border gaia-border bg-card"
                >
                  <div className="text-sm">
                    <div className="font-medium">{inv.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Principal: {Math.round(inv.amount || 0).toLocaleString()}{" "}
                      EGP · APR: {inv.aprPercent ?? "—"}% · Monthly:{" "}
                      {Math.round(
                        inv.monthlyRevenue ??
                          ((inv.amount || 0) * ((inv.aprPercent || 0) / 100)) /
                            12
                      ).toLocaleString()}{" "}
                      EGP
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inv.startDate
                        ? `Start: ${new Date(
                            inv.startDate
                          ).toLocaleDateString()}`
                        : ""}
                      {inv.endDate
                        ? ` · End: ${new Date(
                            inv.endDate
                          ).toLocaleDateString()}`
                        : ""}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => removeInvestment(inv.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                      title="Remove investment"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPlan === activePlan && (
          <div className="mt-4 p-3 border rounded bg-muted/5">
            <h4 className="text-sm font-medium mb-2">Savings trajectory</h4>
            <div className="overflow-auto rounded-lg">
              <table className="w-full text-sm">
                <thead className="gaia-panel-soft">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-left">Age</th>
                    <th className="p-2 text-right">Deposited (month)</th>
                    <th className="p-2 text-right">Monthly Interest</th>
                    <th className="p-2 text-right">Active Principal</th>
                    <th className="p-2 text-right">Net Worth</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const simRes = simulateUntilMonthlyTarget(
                      selectedPlanData.title,
                      {
                        startYear: 2025,
                        startMonthIndex: 11,
                        yearsOfDeposits: 7, // Limit to 7 years of deposits
                        baseMonthlyDeposit: 25000,
                        minReinvest: 1,
                      },
                      selectedPlanData.targetEGP
                    );
                    return (simRes.rows as MonthRow[]).map((r) => (
                      <tr key={`${r.month}`} className="border-t gaia-border">
                        <td className="p-2">{`${MONTH_NAMES[r.monthIndex]} ${
                          r.year
                        }`}</td>
                        <td className="p-2">{Math.floor(r.age)}</td>
                        <td className="p-2 text-right">
                          {r.depositsThisMonth.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {r.monthlyInterest.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {r.activePrincipal.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {r.netWorth.toLocaleString()}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            {/* If simulator returned continuationYears, show reinvest-only yearly trajectory to age 60 */}
            {(() => {
              const simRes = simulateUntilMonthlyTarget(
                selectedPlanData.title,
                {
                  startYear: 2025,
                  startMonthIndex: 11,
                  yearsOfDeposits: 7,
                  baseMonthlyDeposit: 25000,
                  minReinvest: 1,
                },
                selectedPlanData.targetEGP
              );
              if (
                !simRes.continuationYears ||
                simRes.continuationYears.length === 0
              )
                return null;
              return (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">
                    Post‑target trajectory (reinvest-only to age 60 — annual dec
                    snapshots)
                  </h5>
                  <div className="overflow-auto rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="gaia-panel-soft">
                        <tr>
                          <th className="p-2 text-left">Year</th>
                          <th className="p-2 text-left">Age</th>
                          <th className="p-2 text-right">
                            Monthly Interest (Dec)
                          </th>
                          <th className="p-2 text-right">
                            Active Principal (Dec)
                          </th>
                          <th className="p-2 text-right">Net Worth (Dec)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simRes.continuationYears.map((r) => (
                          <tr
                            key={`yr-${r.year}-cont`}
                            className="border-t gaia-border"
                          >
                            <td className="p-2">{r.year}</td>
                            <td className="p-2">{Math.floor(r.age)}</td>
                            <td className="p-2 text-right">
                              {r.monthlyInterestDec.toLocaleString()}
                            </td>
                            <td className="p-2 text-right">
                              {r.activePrincipalEnd.toLocaleString()}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              {r.netWorthEnd.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlansTabView;
