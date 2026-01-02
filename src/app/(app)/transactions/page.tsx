import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Transactions
                </h1>
                <p className="text-muted-foreground">
                    Manage your income and expenses.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>Feature coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is where the transaction data table and management tools will be.</p>
                </CardContent>
            </Card>
        </div>
    );
}
