import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Transaction } from '@/lib/definitions';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

type StatCardsProps = {
  transactions: Transaction[];
  initialBalance: number;
};

export default function StatCards({ transactions, initialBalance }: StatCardsProps) {
  const totalInflow = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = initialBalance + totalInflow - totalOutflow;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Based on all transactions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(totalInflow)}</div>
          <p className="text-xs text-muted-foreground">
            Total cash received
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-muted-foreground text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(totalOutflow)}</div>
          <p className="text-xs text-muted-foreground">
            Total cash spent
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
