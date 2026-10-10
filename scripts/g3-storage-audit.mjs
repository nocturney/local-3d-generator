/** Local read-only job storage audit; writes a sanitized summary ONLY to runtime/qa. */
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { auditJobStorage } from '../server/storage-audit.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const jobsDir=path.join(root,'runtime','data-g2-manual','jobs');
const output=path.join(root,'runtime','qa','g3','storage-audit.json');
const report=await auditJobStorage({jobsDir});
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'w'});
console.log('G3_STORAGE_AUDIT_ONLY '+JSON.stringify(report));
