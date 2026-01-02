import { getTransactions, getCategories, getVendors } from "@/lib/data";
import ReportGenerator from "@/components/reports/report-generator";

export default async function ReportsPage() {
    const transactions = await getTransactions();
    const categories = await getCategories();
    const vendors = await getVendors();

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Reports
                </h1>
                <p className="text-muted-foreground">
                    Generate reports and get AI-powered insights.
                </p>
            </div>
            <ReportGenerator transactions={transactions} categories={categories} vendors={vendors} />
        </div>
    );
}
