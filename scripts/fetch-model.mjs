import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile('docs/model-manifest.json','utf8'));
const base='https://github.com/Janicebenita/personalized_mcq_generator_hidevs/releases/download/model-v1/';
for(const file of manifest.files){
 const path=`public/models/qg-v1/${file.path}`;let bytes;
 try{bytes=await readFile(path);}catch{}
 if(bytes&&createHash('sha256').update(bytes).digest('hex')===file.sha256){console.log(`Verified ${file.path}`);continue;}
 const url=base+file.path.replaceAll('/','__');const response=await fetch(url);
 if(!response.ok)throw new Error(`Model download failed (${response.status}): ${file.path}. Source practice still works without the model.`);
 bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.byteLength!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error(`Integrity check failed: ${file.path}`);
 await mkdir(path.slice(0,path.lastIndexOf('/')),{recursive:true});await writeFile(path,bytes);console.log(`Downloaded and verified ${file.path}`);
}
