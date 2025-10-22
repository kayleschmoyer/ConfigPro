import { useMemo } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import type { FieldMapping } from '../lib/types';
import { describeDomain, evaluateTransform } from '../lib/mapping';
import { formatNumber } from '../lib/format';

interface MappingEditorProps {
  mappings: FieldMapping[];
  domains: FieldMapping['domain'][];
  onChange: (mappings: FieldMapping[]) => void;
}

export function MappingEditor({ mappings, domains, onChange }: MappingEditorProps) {
  const preview = useMemo(
    () =>
      mappings.map((mapping) => ({
        mapping,
        evaluation: evaluateTransform(mapping, mapping.sample ?? { value: 'Sample' })
      })),
    [mappings]
  );

  const updateMapping = (id: string, patch: Partial<FieldMapping>) => {
    onChange(mappings.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addMapping = () => {
    const next: FieldMapping = {
      id: `map-${Date.now()}`,
      domain: domains[0] ?? 'CUSTOMERS',
      sourceField: '',
      targetField: '',
      transform: '',
      required: false
    };
    onChange([...mappings, next]);
  };

  const removeMapping = (id: string) => {
    onChange(mappings.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Field Mapping</h4>
        <Button variant="outline" size="sm" onClick={addMapping}>
          Add Mapping
        </Button>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Source Field</TableHead>
              <TableHead>Target Field</TableHead>
              <TableHead>Transform</TableHead>
              <TableHead className="text-right">Preview</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map(({ mapping, evaluation }, index) => (
              <TableRow key={mapping.id} className="align-top">
                <TableCell className="w-48 align-middle">
                  <Select
                    value={mapping.domain}
                    onChange={(event) => updateMapping(mapping.id, { domain: event.target.value as FieldMapping['domain'] })}
                    aria-label="Select domain"
                  >
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {describeDomain(domain)}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={mapping.sourceField}
                    onChange={(event) => updateMapping(mapping.id, { sourceField: event.target.value })}
                    placeholder="source_field"
                    aria-label="Source field"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={mapping.targetField}
                    onChange={(event) => updateMapping(mapping.id, { targetField: event.target.value })}
                    placeholder="target_field"
                    aria-label="Target field"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={mapping.transform ?? ''}
                    onChange={(event) => updateMapping(mapping.id, { transform: event.target.value })}
                    placeholder="value?.toString()"
                    aria-label="Transform expression"
                  />
                  <p className="mt-1 text-xs text-muted">value =&gt; expression (optional)</p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-xs text-muted">Row {formatNumber(index + 1)}</div>
                  <pre className="mt-2 max-h-16 overflow-hidden text-xs text-foreground/80">
                    {JSON.stringify(evaluation.output, null, 2)}
                  </pre>
                  {evaluation.error && <p className="mt-1 text-xs text-red-400">{evaluation.error}</p>}
                </TableCell>
                <TableCell className="w-24 text-right">
                  <Button variant="ghost" size="sm" onClick={() => removeMapping(mapping.id)} aria-label="Remove mapping">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {mappings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">
                  No mappings configured yet. Add your first mapping to start syncing data with context-aware transforms.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
