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
import { loadSettings, saveSettings } from "../lib/persistence";
import ResetSettings from "./ResetSettings";
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
import ProgressBarAnimated from "./ProgressBarAnimated";

interface PlansTabViewProps {
  metrics: FinancialMetrics;
}

export function PlansTabView({ metrics }: PlansTabViewProps) {
  const settings = loadSettings();
  const [selectedPlan, setSelectedPlan] = useState<"D" | "C" | "B" | "A">("D");
  // simple tick to force re-render when store changes (e.g., after addInvestment)
  const [, setTick] = useState(0);

  // Calculate metrics (same calculations as PlansView)
  const monthlyExpensesKD = settings.expenses.reduce(
    (s, e) => s + e.amountKD,
    0
  );
  const monthlySurplusKD = Math.max(
    0,
    settings.monthlyIncomeKD - monthlyExpensesKD
  );
  const monthlyEgpContribution = monthlySurplusKD * settings.fxEgpPerKd;

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

  // handler to add investment from the Plan card UI
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
    // show the inline form
    setShowInvestmentForm(true);
    // initialize values
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
      const monthlyRevenue =
        invMonthlyRev !== null
          ? Number(invMonthlyRev)
          : (principal * (aprPercent / 100)) / 12;
      addInvestment({
        name: invName,
        principal,
        annualRatePercent: aprPercent,
        startDate: invStartDate || undefined,
        endDate: invEndDate || undefined,
      });
      // force update and hide form
      setTick((t) => t + 1);
      setShowInvestmentForm(false);
    } catch (e) {
      console.error(e);
      alert("Failed to add investment");
    }
  };

  // Sum explicit certificate-like net items (new investments use isCertificate=true)
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

  // list of investments for display
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

  // Calculate plan metrics
  const planCalculations = {
    D: {
      title: "Catching my Breath",
      objective: PLANS.D.objective,
      targetEGP: settings.planDTargetMonthlyEgp,
      get targetPrincipalEGP() {
        return principalForMonthlyPayout(this.targetEGP, currentAprDecimal);
      },
      get currentMonthlyInterest() {
        // Sum monthly revenue from each certificate
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
        // Use the actual current certificate principal
        const currentPrincipal = (() => {
          try {
            return loadNetItems()
              .filter((i) => i.isCertificate && i.amount > 0)
              .reduce((sum, i) => sum + i.amount, 0);
          } catch (e) {
            return startPrincipalEGP;
          }
        })();

        // Get current monthly interest
        const currentMonthlyInterest = this.currentMonthlyInterest;

        // If we're already at target, return 0 months
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
  };

  const activePlan = settings.activePlan ?? "D";
  const planKeys = ["D", "C", "B", "A"] as const;
  const selectedPlanData = planCalculations[selectedPlan];

  return (
    <div className="space-y-6">
      {/* Plan selection tabs */}
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

      {/* Selected plan display */}
      <div
        className={`p-6 rounded-lg border transition-all duration-300 ${
          activePlan === selectedPlan
            ? "border-primary bg-primary/8 scale-[1.03] ring-2 ring-primary/30 shadow-lg hover:shadow-xl hover:scale-[1.04]"
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
            <h3 className="text-lg font-medium flex items-center gap-2">
              {`Plan ${selectedPlan} · ${selectedPlanData.title}`}
            </h3>
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
          <div>
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
          {/* removed estimated months display */}
        </div>

        {/* Simulation Stats */}
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Monthly deposit</div>
            <div className="font-medium">
              {Math.round(monthlyEgpContribution).toLocaleString()} EGP
            </div>
          </div>
        </div>
        {/* Inline Investment Form (appears when Add Investment clicked) */}
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
        {/* Existing investments for the current plan */}
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
        {/* Savings trajectory for the active plan (stops deposits when target met) */}
        {selectedPlan === activePlan && (
          <div className="mt-4 p-3 border rounded bg-muted/5">
            <h4 className="text-sm font-medium mb-2">
              Savings trajectory (to age 60)
            </h4>
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
                        yearsOfDeposits: 100,
                        baseMonthlyDeposit: 25000,
                        minReinvest: 1000,
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
            {(() => {
              const simRes = simulateUntilMonthlyTarget(
                selectedPlanData.title,
                {
                  startYear: 2025,
                  startMonthIndex: 11,
                  yearsOfDeposits: 100,
                  baseMonthlyDeposit: 25000,
                  minReinvest: 1000,
                },
                selectedPlanData.targetEGP
              );
              if (
                !simRes.continuationRows ||
                simRes.continuationRows.length === 0
              )
                return null;
              return (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">
                    Post‑target trajectory (reinvest-only to age 60)
                  </h5>
                  <div className="overflow-auto rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="gaia-panel-soft">
                        <tr>
                          <th className="p-2 text-left">Month</th>
                          <th className="p-2 text-left">Age</th>
                          <th className="p-2 text-right">Monthly Interest</th>
                          <th className="p-2 text-right">Active Principal</th>
                          <th className="p-2 text-right">Cash</th>
                          <th className="p-2 text-right">Net Worth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simRes.continuationRows.map((r) => (
                          <tr
                            key={`${r.month}-cont`}
                            className="border-t gaia-border"
                          >
                            <td className="p-2">{`${
                              MONTH_NAMES[r.monthIndex]
                            } ${r.year}`}</td>
                            <td className="p-2">{Math.floor(r.age)}</td>
                            <td className="p-2 text-right">
                              {r.monthlyInterest.toLocaleString()}
                            </td>
                            <td className="p-2 text-right">
                              {r.activePrincipal.toLocaleString()}
                            </td>
                            <td className="p-2 text-right">
                              {r.cash.toLocaleString()}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              {r.netWorth.toLocaleString()}
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
