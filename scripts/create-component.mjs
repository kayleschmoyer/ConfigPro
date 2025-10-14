#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , rawName, rawScope] = process.argv;

if (!rawName) {
  console.error('Usage: pnpm create:component <Name> [ui|layout|elements]');
  process.exit(1);
}

const componentName = rawName.replace(/[^a-zA-Z0-9]/g, '');
const scope =
  rawScope && ['ui', 'layout', 'elements'].includes(rawScope)
    ? rawScope
    : 'elements';
const targetDir = join(process.cwd(), 'src', 'components', scope);
const filePath = join(targetDir, `${componentName}.tsx`);

if (!componentName) {
  console.error('Component name must contain alphanumeric characters.');
  process.exit(1);
}

if (existsSync(filePath)) {
  console.error(`Component ${componentName} already exists in ${scope}.`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

const template = `import { cn } from '../../lib/cn';

export interface ${componentName}Props extends React.HTMLAttributes<HTMLDivElement> {}

export const ${componentName} = ({ className, ...props }: ${componentName}Props) => (
  <div className={cn('rounded-card border border-surface/40 bg-surface/60 p-4', className)} {...props}>
    ${componentName} content
  </div>
);
`;

writeFileSync(filePath, template);
console.log(`Created ${componentName} in src/components/${scope}`);
