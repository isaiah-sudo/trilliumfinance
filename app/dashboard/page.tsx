'use client';

import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data for initial rendering
  const portfolioData = {
    balance: 125430.50,
    change: +5.2,
    holdings: [
      { name: 'Bitcoin', symbol: 'BTC', amount: '0.45', value: 28450.00 },
      { name: 'Ethereum', symbol: 'ETH', amount: '12.5', value: 24320.00 },
      { name: 'Apple Inc.', symbol: 'AAPL', amount: '45', value: 8120.45 },
    ]
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, {user?.displayName || user?.email}
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Balance
            </h3>
            <p className="mt-2 text-4xl font-extrabold tracking-tight font-num">
              ${portfolioData.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm font-bold text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {portfolioData.change}%
              <span className="font-medium text-slate-400 ml-1">last 24h</span>
            </div>
          </Card>
        </motion.div>

        {/* Placeholder cards for other stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Holdings
            </h3>
            <p className="mt-2 text-4xl font-extrabold tracking-tight font-num">
              {portfolioData.holdings.length}
            </p>
            <p className="mt-2 text-sm text-slate-400">Diversified across 3 assets</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              XP Progress
            </h3>
            <p className="mt-2 text-4xl font-extrabold tracking-tight font-num">
              1,240 XP
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full bg-blue-600 transition-all" style={{ width: '65%' }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">360 XP to next level</p>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-0 sm:p-0">
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h3 className="text-lg font-bold">Recent Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {portfolioData.holdings.map((holding) => (
                  <tr key={holding.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{holding.name}</div>
                      <div className="text-xs text-slate-500">{holding.symbol}</div>
                    </td>
                    <td className="px-6 py-4 font-num font-medium">{holding.amount}</td>
                    <td className="px-6 py-4 text-right font-num font-bold">
                      ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
