import { getTransactions, getVendors, getCategories } from '@/lib/data';
import TransactionsTable from '@/components/transactions/transactions-table';
import { CreateTransactionButton } from '@/components/transactions/buttons';

export default function TransactionsPage() {
    const transactions = getTransactions();
    const vendors = getVendors();
    const categories = getCategories();

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Transactions
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your income and expenses.
                    </p>
                </div>
                <CreateTransactionButton vendors={vendors} categories={categories} />
            </div>
            <TransactionsTable transactions={transactions} vendors={vendors} categories={categories} />
        </div>
    );
}
