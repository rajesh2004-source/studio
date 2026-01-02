import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
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
            <Card>
                <CardHeader>
                    <CardTitle>Reporting Tools</CardTitle>
                    <CardDescription>Feature coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is where the reporting filters, data visualization, and AI summary tools will be.</p>
                </CardContent>
            </Card>
        </div>
    );
}
