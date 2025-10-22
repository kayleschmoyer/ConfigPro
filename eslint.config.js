import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const configPath = path.join(__dirname, '.eslintrc.js');
const code = fs.readFileSync(configPath, 'utf8');
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(code, sandbox, { filename: configPath, dirname: __dirname });
const legacyConfig = sandbox.module.exports;

export default compat.config(legacyConfig);
