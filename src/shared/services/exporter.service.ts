export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumn<TRecord extends Record<string, unknown> = Record<string, unknown>> {
  readonly key: keyof TRecord | string;
  readonly label?: string;
  readonly width?: number;
  readonly formatter?: (value: unknown, record: TRecord) => string | number | boolean | null | undefined;
}

export interface ExportOptions<TRecord extends Record<string, unknown> = Record<string, unknown>> {
  readonly format: ExportFormat;
  readonly filename: string;
  readonly columns: Array<ExportColumn<TRecord>>;
  readonly records: TRecord[];
  readonly includeHeader?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface ExportResult {
  readonly uri?: string;
  readonly blob?: Blob;
  readonly size?: number;
  readonly metadata?: Record<string, unknown>;
}

export interface ExporterService {
  canExport(format: ExportFormat): boolean;

  exportDataset<TRecord extends Record<string, unknown> = Record<string, unknown>>(
    options: ExportOptions<TRecord>,
  ): Promise<ExportResult>;
}
