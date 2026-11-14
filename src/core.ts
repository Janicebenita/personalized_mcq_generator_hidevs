export type Level = 1|2|3;
export type Fact = {id:string;term:string;definition:string;source:string;line:number;topic:string};
export type Item = {id:string;factId:string;topic:string;level:Level;stem:string;options:string[];answer:string;source:string;line:number;origin:'source'|'ai';rationale:string;distractors:{option:string;why:string}[]};
export type Response = {item:Item;selected:string;correct:boolean;confidence:string;seconds:number;before:Level;after:Level;reason:string};
export type Session = {level:Level;streak:number;target:number;responses:Response[];seen:string[]};
export const levelNames:Record<Level,string>={1:'Recall',2:'Connect',3:'Challenge'};
export function normalize(s:string){return s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
export function hash(s:string){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619);}return (h>>>0).toString(36);}
export function escapeHTML(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function parseContent(input:string):{facts:Fact[];warnings:string[]} {
 if(new TextEncoder().encode(input).length>50000) throw new Error('Keep your notes below 50 KB. Try one chapter at a time.');
 if(!input.trim()) throw new Error('Add some study notes first.');
 const facts:Fact[]=[];const warnings:string[]=[];let topic='General';const byTerm=new Map<string,Fact>();const conflicts=new Set<string>();
 input.replace(/\r\n?/g,'\n').split('\n').forEach((raw,i)=>{
  const line=raw.trim().replace(/^[-*•]\s+/, '');
  if(!line)return;
  if(/^#{1,3}\s+/.test(line)){topic=line.replace(/^#+\s*/,'').slice(0,80);return;}
  // Bounded definition extraction: explicit glossary entries or declarative definitions.
  const match=line.match(/^(.{2,65}?)\s*(?:::|\s+is\s+|\s+are\s+|\s+refers to\s+|\s+means\s+)(.{15,400}?)\s*$/i);
  if(!match){warnings.push(`Line ${i+1}: no clear definition found; skipped.`);return;}
  const term=match[1].trim().replace(/^(?:a|an|the)\s+/i,'');const definition=match[2].trim().replace(/[.!?]$/,'');
  const key=normalize(term);if(!key||term.split(/\s+/).length>7||/[<>]|https?:|ignore\s+(?:previous|all|instructions)|system\s+prompt/i.test(line)){warnings.push(`Line ${i+1}: unsuitable definition; skipped.`);return;}
  if(normalize(definition).includes(key)){warnings.push(`Line ${i+1}: definition repeats its answer; skipped.`);return;}
  const prev=byTerm.get(key);
  if(prev){if(normalize(prev.definition)!==normalize(definition))conflicts.add(key);return;}
  const fact={id:hash(`${key}|${definition}`),term,definition,source:line,line:i+1,topic};byTerm.set(key,fact);facts.push(fact);
 });
 for(const key of conflicts)warnings.push(`Conflicting definitions for “${byTerm.get(key)!.term}” were excluded. Resolve them before generating.`);
 const safe=facts.filter(f=>!conflicts.has(normalize(f.term)));
 const unique=safe.filter(f=>!safe.some(g=>g.id!==f.id&&normalize(g.definition)===normalize(f.definition)));
 if(unique.length!==safe.length)warnings.push('Terms sharing the same definition were excluded to avoid ambiguous answers.');
 if(unique.length<4)throw new Error('We need at least 4 distinct definitions. Use “Term is a definition” or “Term :: definition”, one per line. Add # headings for topics.');
 const eligible=unique.filter(f=>unique.filter(g=>g.topic===f.topic).length>=4);
 if(eligible.length<4)throw new Error('Add at least 4 definitions under the same topic so distractors stay relevant.');
 if(eligible.length<unique.length)warnings.push('Topics with fewer than 4 definitions were skipped; add related concepts for stronger distractors.');
 if(eligible.length>24)warnings.push('Using the first 24 definitions for a focused practice session.');
 return {facts:eligible.slice(0,24),warnings};
}
function similarity(a:string,b:string){const x=new Set(normalize(a).split(' ')),y=new Set(normalize(b).split(' '));return [...x].filter(w=>y.has(w)).length/new Set([...x,...y]).size;}
export function shuffle<T>(items:T[],seed:string):T[]{const a=[...items];let n=parseInt(hash(seed),36);for(let i=a.length-1;i>0;i--){n=(Math.imul(1664525,n)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function validateStem(stem:string,fact:Fact):string|null {
 const s=stem.trim().replace(/^question:\s*/i,'');
 if(s.length<18||s.length>240||!s.endsWith('?')||/[<>]|https?:/i.test(s))return null;
 const n=normalize(s);if(n.includes(normalize(fact.term)))return null;
 const meaningful=normalize(fact.definition).split(' ').filter(w=>w.length>3&&!['that','with','from','into','which','this','their','using'].includes(w));
 const retained=meaningful.filter(w=>n.split(' ').includes(w)).length;
 if(retained<Math.min(3,meaningful.length)||retained/meaningful.length<0.8)return null;
 if(['not','without','before','after','immutable','mutable','ordered','unordered','unique'].some(w=>normalize(fact.definition).split(' ').includes(w)&&!n.split(' ').includes(w)))return null;
 // Conservatively require every content word to be in source or a neutral question frame.
 const allowed=new Set(normalize(fact.source+' what which how does do is are a an the of in to for by process structure collection term describes best identifies according notes').split(' '));
 if(n.split(' ').some(w=>!allowed.has(w)))return null;
 return s;
}
export function buildItem(fact:Fact,facts:Fact[],level:Level,seed:string,generated?:string):Item {
 const peers=facts.filter(f=>f.id!==fact.id&&f.topic===fact.topic&&normalize(f.term)!==normalize(fact.term)&&normalize(f.definition)!==normalize(fact.definition));
 if(peers.length<3)throw new Error('Not enough distinct concepts in this topic.');
 const ranked=shuffle(peers,seed).sort((a,b)=>similarity(fact.definition,b.definition)-similarity(fact.definition,a.definition));
 const chosen=level===1?[...ranked].reverse().slice(0,3):ranked.slice(0,3);
 const answer=level===1?fact.definition:level===2?fact.term:`${fact.term} — ${fact.definition}`;
 const ai=level===2&&generated?validateStem(generated,fact):null;
 const stem=level===1?`Which description matches ${fact.term}?`:level===3?'Which term–description pairing agrees with the study notes?':ai??`Which term matches this description: “${fact.definition}”?`;
 const distractors=chosen.map((g,i)=>({option:level===1?g.definition:level===2?g.term:`${g.term} — ${chosen[(i+1)%chosen.length].definition}`,why:level===3?`The notes define ${g.term} as ${g.definition}; the pairing uses another concept’s definition.`:`${g.term}: ${g.definition}. This describes a different concept in the same topic.`}));
 const options=shuffle([answer,...distractors.map(d=>d.option)],seed+fact.id+level);
 return {id:`${fact.id}-${level}`,factId:fact.id,topic:fact.topic,level,stem,options,answer,source:fact.source,line:fact.line,origin:ai?'ai':'source',rationale:`${fact.term} matches because the notes state: “${fact.source}”`,distractors};
}
export function newSession(target:number):Session {return {level:2,streak:0,target:Math.max(1,Math.min(24,Math.floor(target))),responses:[],seen:[]};}
export function chooseFact(session:Session,facts:Fact[]):Fact|null {
 if(session.responses.length>=session.target)return null;
 const unseen=facts.filter(f=>!session.seen.includes(f.id));
 const score=(topic:string)=>{const rs=session.responses.filter(r=>r.item.topic===topic);return rs.length?(rs.filter(r=>r.correct).length+1)/(rs.length+2):0.5;};
 return shuffle(unseen,String(session.responses.length)).sort((a,b)=>score(a.topic)-score(b.topic))[0]??null;
}
export function grade(session:Session,item:Item,selected:string,confidence:string,seconds:number):Session {
 if(session.seen.includes(item.factId)||session.responses.length>=session.target)throw new Error('This question has already been answered or the session is complete.');
 if(!item.options.includes(selected)||item.level!==session.level)throw new Error('Choose a valid answer for the current question.');
 const correct=selected===item.answer;const streak=correct?session.streak+1:0;
 const after:Level=correct?(streak>=2?Math.min(3,session.level+1):session.level) as Level:Math.max(1,session.level-1) as Level;
 const reason=!correct?(after===session.level?'Stay at Recall to rebuild the foundation.':'A missed answer lowers the next question by one level.'):
  streak>=2?(after===session.level?'Two correct answers; stay at the highest practice level.':'Two correct answers in a row raise the next question by one level.'):'One correct answer; keep this level to confirm understanding.';
 return {...session,level:after,streak:streak>=2?0:streak,seen:[...session.seen,item.factId],responses:[...session.responses,{item,selected,correct,confidence,seconds:Number.isFinite(seconds)?Math.max(0,Math.min(3600,seconds)):0,before:session.level,after,reason}]};
}
export function analytics(responses:Response[]){
 const total=responses.length,correct=responses.filter(r=>r.correct).length;
 const topics=[...new Set(responses.map(r=>r.item.topic))].map(topic=>{const rs=responses.filter(r=>r.item.topic===topic);return {topic,total:rs.length,correct:rs.filter(r=>r.correct).length};});
 const p=total?correct/total:0,z=1.96,den=1+z*z/(total||1),center=(p+z*z/(2*(total||1)))/den,margin=z*Math.sqrt((p*(1-p)+z*z/(4*(total||1)))/(total||1))/den;
 return {total,correct,accuracy:total?Math.round(100*correct/total):0,topics,seconds:Math.round(responses.reduce((n,r)=>n+r.seconds,0)),confidentMisses:responses.filter(r=>r.confidence==='Sure'&&!r.correct).length,interval:total?[Math.round(100*(center-margin)),Math.round(100*(center+margin))]:[0,100]};
}
export function toCSV(responses:Response[]){const cell=(x:unknown)=>`"${String(x).replace(/"/g,'""').replace(/^[=+@\-\t\r]/,"'$&")}"`;return [['Topic','Level','Question','Selected','Answer','Correct','Confidence','Seconds','Next level','Reason'],...responses.map(r=>[r.item.topic,r.before,r.item.stem,r.selected,r.item.answer,r.correct,r.confidence,Math.round(r.seconds),r.after,r.reason])].map(row=>row.map(cell).join(',')).join('\r\n');}
