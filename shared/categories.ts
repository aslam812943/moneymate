import type { Category, State, Transaction } from './schema';

export const categoryKinds = ['spending', 'debt', 'saving', 'transfer', 'review'] as const;
export const kindLabels = { spending: 'Everyday spending', debt: 'Debt repayments', saving: 'Savings & investments', transfer: 'Transfers & money lent', review: 'Needs review' };
export const normalName = (name:string) => name.trim().toLowerCase().replace(/\s+/g, ' ');
const definitions = [
 ['cat-0','Home & Bills','Rent, electricity, water, cooking gas, mobile and internet bills.','spending',['Rent','Utilities','electricity bill','Mobile & Internet']],
 ['cat-1','Food','Groceries, vegetables, meals, restaurants and food delivery.','spending',['Groceries','Food & Dining']],
 ['cat-3','Transport','Everyday bus, taxi, train, petrol, parking and vehicle repairs. Holiday transport goes in Travel.','spending',['Transport','Fuel','vehicle repair and maintenance']],
 ['cat-7','Personal & Lifestyle','Clothes, shopping, haircuts, personal care, cinema and entertainment subscriptions.','spending',['Shopping','Personal Care','Entertainment']],
 ['cat-9','Health & Insurance','Doctor visits, medicines, tests and insurance premiums.','spending',['Health','Insurance']],
 ['cat-10','Education','School fees, books, tuition and learning courses.','spending',['Education']],
 ['cat-11','Travel','Flights, hotels, holiday meals and transport during trips.','spending',['Travel']],
 ['cat-14','Gifts & Support','Gifts, donations and general financial support with no repayment expected.','spending',['No return Fund']],
 ['cat-16','Other','Temporary home for spending that does not fit elsewhere. Review these entries each month.','spending',['Miscellaneous']],
 ['emi','Debt Repayments','EMIs and loan payments. Use Loans for tracked EMIs and People & Loans for personal loan repayments; do not enter the same payment twice.','debt',['EMI','Loan Repayment']],
 ['cat-15','Savings & Investments','Money set aside in savings, deposits or investments. Excluded from everyday spending, but still reduces available cash.','saving',['Investments']],
 ['transfers','Transfers & Money Lent','Outgoing transfers or money lent. For loans with a person and repayments, use People & Loans instead and avoid duplicate entries.','transfer',[]],
] as const;

export function simpleCategories():Category[]{return definitions.map(([id,name,description,kind],i)=>({id,name,description,kind,color:['#7666d5','#48b5a0','#74a5e6','#f3ac65'][i%4],icon:'Wallet',type:'variable'}));}
export function categoryHelp(c?:Category){return c?.description||'Add a short explanation in Settings so you know what belongs here.';}
export function spendingEntries(s:State):Transaction[]{return s.expenses.filter(e=>{const kind=s.categories.find(c=>c.id===e.category_id)?.kind;return !kind||kind==='spending'||kind==='review';});}
export function movementTotal(s:State,month:string,kind:string){return s.expenses.filter(e=>e.date.startsWith(month)&&s.categories.find(c=>c.id===e.category_id)?.kind===kind).reduce((n,e)=>n+e.amount,0);}

// Only known legacy names are combined. Unrecognised categories retain their IDs.
export function organizeCategories(state:State):State{
 const s=structuredClone(state), redirects=new Map<string,string>(), originals=new Map(s.categories.map(c=>[c.id,c.name]));
 const categories:Category[]=[];
 for(const original of s.categories){
  const definition=original.kind?undefined:definitions.find(d=>[d[1],...d[4]].some(n=>normalName(n)===normalName(original.name)));
  let c:Category=definition?{...original,id:definition[0],name:definition[1],description:definition[2],kind:definition[3]}:{...original};
  if(!c.kind){c.kind='review';c.description=c.description||'Choose what this category means using Edit. Existing entries stay here until you review them.';}
  const existing=categories.find(x=>normalName(x.name)===normalName(c.name)&&x.kind===c.kind);
  if(existing)c={...existing};
  // Never take an ID belonging to a custom category with a different meaning.
  else if(categories.some(x=>x.id===c.id)||s.categories.some(x=>x.id===c.id&&x.id!==original.id&&
   !(definition&&[definition[1],...definition[4]].some(n=>normalName(n)===normalName(x.name)))))c.id=original.id;
  redirects.set(original.id,c.id);
  if(!existing)categories.push(c);
 }
 if(state.categories.some(c=>!c.kind))for(const c of simpleCategories()){
  if(categories.length>=200)break;
  if(categories.some(x=>normalName(x.name)===normalName(c.name)))continue;
  while(categories.some(x=>x.id===c.id))c.id='group-'+c.id;
  categories.push(c);
 }
 s.categories=categories;
 for(const e of s.expenses){e.amount_type??=state.categories.find(c=>c.id===e.category_id)?.type||'variable';const target=redirects.get(e.category_id!);if(target){const oldName=originals.get(e.category_id!);if(oldName!==categories.find(c=>c.id===target)?.name)e.original_category??=oldName;e.category_id=target;}}
 const budgets:State['budgets']=[];
 for(const b of s.budgets){b.category_id=redirects.get(b.category_id)||b.category_id;const existing=budgets.find(x=>x.category_id===b.category_id&&x.month===b.month);if(existing)existing.limit_amount+=b.limit_amount;else budgets.push(b);}
 s.budgets=budgets;
 return s;
}
