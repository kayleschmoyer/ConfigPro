import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { useToast } from '../../shared/ui/Toast';
import { useAccountsReceivable } from './context';
import { ReportIcon } from './components/Icons';

const reportCatalog = [
  {
    id: 'aging-summary',
    name: 'AR Aging Summary',
    description: 'Bucketed totals with risk segmentation and trend lines.'
  },
  {
    id: 'aging-detail',
    name: 'AR Aging Detail',
    description: 'Invoice-level aging, contact info, and collector ownership.'
  },
  {
    id: 'collections-effectiveness',
    name: 'Collections Effectiveness Index',
    description: 'Measure CEI over time, highlighting improvements in DSO.'
  },
  {
    id: 'dso-trend',
    name: 'DSO Trend',
    description: 'Day sales outstanding with moving averages and goals.'
  },
  {
    id: 'cash-receipts',
    name: 'Cash Receipts',
    description: 'Deposits, payment methods, and unapplied cash over time.'
  }
];

export const ARReports = () => {
  useAccountsReceivable();
  const { showToast } = useToast();
  const [timeframe, setTimeframe] = useState('30');
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [search, setSearch] = useState('');

  const filteredReports = reportCatalog.filter((report) =>
    report.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportReport = (reportId: string) => {
    showToast({
      variant: 'info',
      title: 'Report export queued',
      description: `${reportId} will be delivered as ${format}.`
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <ReportIcon className="h-4 w-4 text-primary" />
          Reporting & insights
        </span>
        <h2 className="text-3xl font-semibold">Turn AR data into action</h2>
        <p className="text-sm text-muted">
          Consistent filters across all reports — export to share with finance and leadership.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Select label="Timeframe" value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 12 months</option>
        </Select>
        <Select label="Format" value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
          <option value="PDF">PDF</option>
          <option value="CSV">CSV</option>
        </Select>
        <Input
          label="Filter by name"
          placeholder="Search reports"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredReports.map((report) => (
          <Card key={report.id} className="bg-background/80">
            <CardHeader>
              <CardTitle>{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted">
              {timeframe === '7' && 'Snapshot of week-to-week movement.'}
              {timeframe === '30' && 'Monthly cadence with quarter-to-date comparisons.'}
              {timeframe === '90' && 'Quarterly analysis with rolling averages.'}
              {timeframe === '365' && 'Year-over-year trends and seasonality insights.'}
            </CardContent>
            <CardContent className="text-xs text-muted">
              Audience: finance, CFO, collections leadership
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => showToast({
                  variant: 'info',
                  title: 'Report opened',
                  description: `${report.name} loaded with live filters.`
                })}
              >
                View online
              </Button>
              <Button onClick={() => exportReport(report.id)}>Export {format}</Button>
            </CardFooter>
          </Card>
        ))}
        {filteredReports.length === 0 && (
          <Card className="bg-background/80 p-10 text-center text-sm text-muted">
            No reports matched your search.
          </Card>
        )}
      </div>
    </div>
  );
};
