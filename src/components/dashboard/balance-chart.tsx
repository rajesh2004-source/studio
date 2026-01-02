'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Transaction } from '@/lib/definitions';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

type BalanceChartProps = {
    transactions: Transaction[];
}

export default function BalanceChart({ transactions }: BalanceChartProps) {
    const data = useMemo(() => {
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};

        transactions.forEach(t => {
            const month = format(parseISO(t.date), 'MMM yyyy');
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        });

        return Object.keys(monthlyData).map(month => ({
            name: month,
            Income: monthlyData[month].income,
            Expense: monthlyData[month].expense,
        })).reverse(); // Show most recent months first
    }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Overview</CardTitle>
        <CardDescription>Monthly income and expense summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs. ${value}`} />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                    }}
                />
                <Bar dataKey="Income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
