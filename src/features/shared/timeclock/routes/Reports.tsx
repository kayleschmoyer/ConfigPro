import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';

const reports = [
  { id: 'pay-period', name: 'Pay period summary', description: 'Totals by employee with overtime and compliance flags.' },
  { id: 'overtime', name: 'Overtime by job', description: 'Breakdown of OT/DT minutes by job code and cost center.' },
  { id: 'exceptions', name: 'Exception log', description: 'All anomalies with resolution timestamps and actors.' },
  { id: 'geofence', name: 'Geofence violations', description: 'Punches outside approved zones or networks.' },
];

export const Reports = () => {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Reports</h2>
          <p className="text-sm text-muted-foreground">Download-ready insights with consistent filters and exports.</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="pay-period">
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </Select>
          <Input type="date" />
          <Input type="date" />
          <Button variant="outline">Export CSV</Button>
          <Button>Download PDF</Button>
        </div>
      </header>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-semibold text-white">{report.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{report.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
