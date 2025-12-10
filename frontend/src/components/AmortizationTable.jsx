import { useMemo } from "react";

function formatCurrency(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AmortizationTable({
  loanAmount,
  interestRate,
  termYears,
  monthlyPI,
}) {
  const schedule = useMemo(() => {
    if (!loanAmount || !interestRate || !termYears || !monthlyPI) {
      return [];
    }

    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    let remainingBalance = loanAmount;
    const scheduleData = [];

    for (let i = 1; i <= totalPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPI - interestPayment;
      remainingBalance -= principalPayment;

      // Ensure balance doesn't go negative due to floating point math
      if (remainingBalance < 0) {
        remainingBalance = 0;
      }

      scheduleData.push({
        month: i,
        interest: interestPayment,
        principal: principalPayment,
        balance: remainingBalance,
      });
    }

    return scheduleData;
  }, [loanAmount, interestRate, termYears, monthlyPI]);

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/50 backdrop-blur">
      <h2 className="mb-4 text-lg font-semibold text-emerald-200">
        Amortization Schedule
      </h2>
      <div className="max-h-[400px] overflow-y-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3 text-right">Interest</th>
              <th className="px-4 py-3 text-right">Principal</th>
              <th className="px-4 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {schedule.map((row) => (
              <tr key={row.month} className="hover:bg-slate-800/50">
                <td className="px-4 py-2 font-medium">{row.month}</td>
                <td className="px-4 py-2 text-right font-mono text-red-300">
                  {formatCurrency(row.interest)}
                </td>
                <td className="px-4 py-2 text-right font-mono text-emerald-300">
                  {formatCurrency(row.principal)}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
