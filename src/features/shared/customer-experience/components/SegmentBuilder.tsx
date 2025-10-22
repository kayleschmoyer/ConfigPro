import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import type { Segment, SegmentExpression, SegmentField, SegmentLeaf, SegmentOperator } from '../lib/types';

interface SegmentBuilderProps {
  fields: SegmentField[];
  segment: Segment;
  onChange: (expression: SegmentExpression) => void;
}

const operators: SegmentOperator[] = ['EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'INCLUDES', 'NOT_INCLUDES', 'EXISTS', 'NOT_EXISTS'];

const isLeaf = (node: SegmentExpression): node is SegmentLeaf => node.type === 'LEAF';

export const SegmentBuilder = ({ fields, segment, onChange }: SegmentBuilderProps) => {
  const addRule = () => {
    const firstField = fields[0];
    if (!firstField) return;
    const newLeaf: SegmentLeaf = { type: 'LEAF', field: firstField.key, operator: 'EQ', value: '' };
    const next: SegmentExpression = {
      type: 'GROUP',
      condition: 'AND',
      children: [...(segment.rules.type === 'GROUP' ? segment.rules.children : [segment.rules]), newLeaf]
    };
    onChange(next);
  };

  const updateLeaf = (index: number, updates: Partial<SegmentLeaf>) => {
    if (segment.rules.type !== 'GROUP') return;
    const updatedChildren = segment.rules.children.map((child, childIndex) =>
      childIndex === index ? { ...child, ...updates } : child
    );
    onChange({ ...segment.rules, children: updatedChildren });
  };

  const removeLeaf = (index: number) => {
    if (segment.rules.type !== 'GROUP') return;
    const updatedChildren = segment.rules.children.filter((_, childIndex) => childIndex !== index);
    onChange({ ...segment.rules, children: updatedChildren });
  };

  const leaves = segment.rules.type === 'GROUP' ? segment.rules.children.filter(isLeaf) : [segment.rules];

  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Segment rules</h3>
          <p className="text-sm text-muted/80">Define the customers included in “{segment.name}”.</p>
        </div>
        <Button variant="outline" onClick={addRule}>
          Add rule
        </Button>
      </header>

      <ul className="space-y-3">
        {leaves.map((leaf, index) => (
          <li
            key={`${leaf.field}-${index}`}
            className="grid gap-3 rounded-2xl border border-border/50 bg-surface/70 p-4 md:grid-cols-[2fr,1.5fr,1fr,auto]"
          >
            <Select
              value={leaf.field}
              onChange={event => updateLeaf(index, { field: event.target.value })}
            >
              {fields.map(field => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </Select>
            <Select
              value={leaf.operator}
              onChange={event => updateLeaf(index, { operator: event.target.value as SegmentOperator })}
            >
              {operators.map(operator => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </Select>
            {leaf.operator === 'EXISTS' || leaf.operator === 'NOT_EXISTS' ? (
              <div className="flex items-center text-sm text-muted">—</div>
            ) : (
              <Input
                value={(leaf.value as string) ?? ''}
                onChange={event => updateLeaf(index, { value: event.target.value })}
              />
            )}
            <Button variant="ghost" onClick={() => removeLeaf(index)}>
              Remove
            </Button>
          </li>
        ))}
        {!leaves.length && (
          <li className="rounded-2xl border border-dashed border-border/60 bg-surface/60 p-4 text-sm text-muted">
            Start by adding your first rule.
          </li>
        )}
      </ul>
    </section>
  );
};
