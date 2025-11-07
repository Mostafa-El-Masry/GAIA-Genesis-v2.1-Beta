"use client";

import { FinancialMetrics, PLANS } from "../lib/wealthLevels";
import {
  principalForMonthlyPayout,
  simulateMonthsToMonthlyInterest,
} from "../lib/wealthCalculations";
import { loadSettings, saveSettings } from "../lib/persistence";
import { loadNetItems } from "../lib/store";
import { simulateUntilMonthlyTarget } from "../lib/sim";
import ProgressBarAnimated from "./ProgressBarAnimated";
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

interface PlansViewProps {
  metrics: FinancialMetrics;
}

// Helper function to format months display
function monthsDisplay(m: number | null): string {

                            <td className="p-2">{`${MONTH_NAMES[r.monthIndex]} ${r.year}`}</td>
                            <td className="p-2">{Math.floor(r.age)}</td>
                            <td className="p-2 text-right">{r.monthlyInterest.toLocaleString()}</td>
                            <td className="p-2 text-right">{r.activePrincipal.toLocaleString()}</td>
                            
                            <td className="p-2 text-right font-semibold">{r.netWorth.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default PlansView;
