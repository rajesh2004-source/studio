import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Transaction } from '@/lib/definitions';
import { getVendors } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

type RecentTransactionsProps = {
    transactions: Transaction[];
}

export default async function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const vendors = await getVendors();

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const formatCurrency = (amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const getVendorInitial = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name.charAt(0).toUpperCase() : '?';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Transactions</CardTitle>
        <CardDescription>
          You have made {transactions.length} transactions in total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
            <div className="space-y-6">
            {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={`/avatars/${transaction.vendorId}.png`} alt="Avatar" />
                    <AvatarFallback>{getVendorInitial(transaction.vendorId)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{vendors.find(v => v.id === transaction.vendorId)?.name}</p>
                </div>
                <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {formatCurrency(transaction.amount, transaction.type)}
                </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
