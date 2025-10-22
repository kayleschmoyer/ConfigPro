import { Button } from '@/shared/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/Table';
import { formatDate } from '../lib/format';

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: number;
  url: string;
};

interface DocumentListProps {
  documents: DocumentItem[];
  onDownload?: (document: DocumentItem) => void;
}

export const DocumentList = ({ documents, onDownload }: DocumentListProps) => {
  if (!documents.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/50">
        <span className="text-sm text-muted">No documents available yet.</span>
      </div>
    );
  }

  return (
    <TableContainer>
      <Table aria-label="Documents">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Type</TableHead>
            <TableHead scope="col">Uploaded</TableHead>
            <TableHead scope="col">Size</TableHead>
            <TableHead scope="col" className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(document => (
            <TableRow key={document.id}>
              <TableCell className="font-medium text-foreground">{document.name}</TableCell>
              <TableCell>{document.type}</TableCell>
              <TableCell>{formatDate(document.uploadedAt)}</TableCell>
              <TableCell>{`${(document.size / (1024 * 1024)).toFixed(1)} MB`}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload?.(document)}
                  aria-label={`Download ${document.name}`}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
