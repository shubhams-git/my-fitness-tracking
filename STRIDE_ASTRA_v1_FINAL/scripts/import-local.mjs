import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { Store } from '../src/store.mjs';
import { Security } from '../src/security.mjs';
import { parseUpload,commitImport } from '../src/imports.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const store=new Store(resolve(process.env.STRIDE_DATA_DIR||resolve(root,'.stride-data'),'stride.sqlite'));
new Security(store,resolve(process.env.STRIDE_DATA_DIR||resolve(root,'.stride-data'))).checkpoint('before-local-import');
try {for(const name of ['mass-backup-2026-10-23.json','design-source-transcription.json']){const raw=await readFile(resolve(root,'private-inputs',name));const parsed=await parseUpload(name,raw);const result=commitImport(store,parsed,name,raw);console.log(`${name}: ${result.added} added, ${result.updated} updated, ${result.matched} matched, ${result.ignored} deleted source records ignored.`);}}finally{store.close();}
