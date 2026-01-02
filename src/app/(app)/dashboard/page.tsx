import BalanceChart from "@/components/dashboard/balance-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import StatCards from "@/components/dashboard/stat-cards";
import { getTransactions, getInitialBalance } from "@/lib/data";

export default async function DashboardPage() {
    const transactions = await getTransactions();
    const initialBalance = getInitialBalance();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Here&apos;s a quick overview of your petty cash.
                </p>
            </div>

            <StatCards transactions={transactions} initialBalance={initialBalance} />
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <BalanceChart transactions={transactions} />
                </div>
                <div className="lg:col-span-3">
                    <RecentTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    );
}
