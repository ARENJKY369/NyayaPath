export const sample=`RESIDENTIAL RENTAL AGREEMENT — FICTIONAL SAMPLE

1. Parties and premises
Asha Mehra (Landlord) and Riya Kapoor (Tenant) agree to the rental of an apartment in Chandigarh. Educational demonstration only, not a legal template.

2. Term
The tenancy is for 11 months, from 1 October 2026 to 31 August 2027.

3. Rent and payment
The Tenant shall pay INR 15,000 monthly rent by the fifth day of each month, plus INR 1,500 monthly maintenance.

4. Security deposit
The Tenant shall pay a refundable deposit of INR 30,000. The Landlord may deduct repair charges as determined solely by the Landlord before returning the balance.

5. Notice and termination
The Tenant must give 60 days written notice before vacating. The Landlord may terminate with 30 days written notice.

6. Early departure
If the Tenant vacates within the first six months, the entire deposit shall be forfeited.

7. Repairs
The Tenant is responsible for minor repairs. The Landlord is responsible for structural repairs. Minor repairs are not defined.

8. Handover
The Tenant shall return all keys and leave the premises in the condition recorded at move-in, allowing for ordinary wear and tear.`;
export const alternative=sample.replace('60 days','30 days').replace('as determined solely by the Landlord','supported by itemised invoices').replace('the entire deposit shall be forfeited','a charge of one month of rent applies').replace('before returning the balance.','before returning the balance within 30 days of handover.');
export const paragraphs=(t:string)=>t.split(/\n\s*\n|\f/).map(p=>p.trim()).filter(Boolean);
export function review(t:string){const ps=paragraphs(t);return [
{pattern:/forfeit|penalt|early departure/i,title:'Leaving early could cost you',level:'attention',explanation:'This passage describes a potential cost for leaving early. Check the trigger, amount and exceptions. Enforceability needs professional review.',question:'When does the early-exit charge apply, and are there exceptions?'},
{pattern:/solely|sole discretion|unilateral/i,title:'One party controls the decision',level:'attention',explanation:'This wording gives one party discretion. Ask for objective criteria and supporting records before agreeing.',question:'Can deductions require itemised receipts and an agreed process?'},
{pattern:/notice/i,title:'Check the notice periods',level:'clarify',explanation:'Check how much notice each party must give and how it must be delivered. Different periods are not automatically unlawful.',question:'What notice must each party give, and how should it be delivered?'},
{pattern:/not defined|minor repairs/i,title:'A responsibility needs clearer wording',level:'clarify',explanation:'Broad or undefined terms can make responsibilities hard to understand. Ask for examples and limits.',question:'Can this responsibility be defined with examples and a cost limit?'},
{pattern:/monthly|per month/i,title:'Check the full recurring cost',level:'info',explanation:'Review recurring payments, extra charges and due dates together. This topic flag does not establish that the terms are safe.',question:'What additional charges can be added, and when are payments due?'}
].flatMap(r=>{const i=ps.findIndex(p=>r.pattern.test(p));return i<0?[]:[{title:r.title,level:r.level,explanation:r.explanation,question:r.question,quote:ps[i],source:`Passage ${i+1}`}];});}
export function search(t:string,q:string){const words=(q.toLowerCase().match(/[a-z]{3,}/g)||[]).filter(w=>!['what','does','this','the','are','can','happens'].includes(w)).flatMap(w=>w==='leave'?['vacat','departure','notice']:[w]);const hits=paragraphs(t).map((p,i)=>({p,i,n:words.reduce((n,w)=>n+Number(p.toLowerCase().includes(w)),0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,2);return hits.length?'Matching original wording (keyword search, not AI interpretation):\n\n'+hits.map(x=>`Passage ${x.i+1}: ${x.p}`).join('\n\n')+'\n\nThis does not establish enforceability or a legal outcome.':'No matching passage found. This does not mean the document answers this question. Try a specific term or ask a legal professional.';}
