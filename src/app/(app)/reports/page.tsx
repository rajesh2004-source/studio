import { getTransactions, getCategories, getVendors } from "@/lib/data";
import ReportGenerator from "@/components/reports/report-generator";

export default function ReportsPage() {
    const transactions = getTransactions();
    const categories = getCategories();
    const vendors = getVendors();

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
