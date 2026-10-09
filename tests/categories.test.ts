import { test } from 'node:test';
import assert from 'node:assert/strict';
import { organizeCategories } from '../shared/categories';
import { emptyState, totals, cashBalance, materializeRecurring } from '../shared/finance';
import { stateSchema, type Category } from '../shared/schema';
const cat=(id:string,name:string):Category=>({id,name,color:'#123456',icon:'Wallet',type:'variable'});
test('migration covers every screenshot category, keeps custom names and merges budgets without losing history',()=>{
 const s=emptyState();
 const names=['Rent','Groceries','Food & Dining','Transport','Fuel','Utilities','Mobile & Internet','Shopping','Entertainment','Personal Care','Education','Travel','Insurance','Subscriptions','Family','Investments','Miscellaneous','EMI','electricity bill','vehicle repair and maintenance','Loan Repayment','Shopping','No return Fund','return Fund','My custom category'];
 s.categories=names.map((name,i)=>cat(`old-${i}`,name));
 s.expenses=s.categories.map((c,i)=>({id:`e-${i}`,amount:100,date:'2026-10-01',note:c.name,category_id:c.id,is_recurring:i===0,tags:['kept']}));
 s.budgets=[{id:'b1',category_id:'old-7',month:'2026-10',limit_amount:100},{id:'b2',category_id:'old-21',month:'2026-10',limit_amount:200}];
 const next=organizeCategories(s);
 assert.equal(next.expenses.length,names.length);assert.equal(next.budgets.length,1);assert.equal(next.budgets[0].limit_amount,300);
 assert.equal(next.categories.filter(c=>c.name==='Personal & Lifestyle').length,1);
 for(const name of ['Subscriptions','Family','return Fund','My custom category'])assert.equal(next.categories.find(c=>c.name===name)?.kind,'review');
 assert.equal(next.expenses[18].original_category,'electricity bill');assert.equal(next.expenses[18].category_id,next.expenses[0].category_id);
 assert.equal(next.expenses[20].category_id,next.expenses[17].category_id);
 assert.deepEqual(organizeCategories(next),next);assert.ok(stateSchema.safeParse(next).success);assert.equal(s.categories.length,names.length);
 assert.equal(cashBalance(next,'2026-10'),-2500);
 const recurring=materializeRecurring(next,new Date('2026-11-02T12:00:00'));assert.equal(recurring.expenses.at(-1)?.category_id,next.expenses[0].category_id);
});
test('migration cannot overwrite a custom category that owns a built-in ID',()=>{
 const s=emptyState();s.categories=[cat('gift','No return Fund'),cat('cat-14','Family')];
 const n=organizeCategories(s);assert.equal(new Set(n.categories.map(c=>c.id)).size,n.categories.length);assert.equal(n.categories.find(c=>c.name==='Family')?.id,'cat-14');assert.ok(stateSchema.safeParse(n).success);
});
test('spending excludes money movements while balance accounts for all outgoings exactly once',()=>{
 const s=emptyState();s.incomes=[{id:'income',date:'2026-10-01',amount:10000,note:'',is_recurring:false,tags:[]}];
 s.expenses=['cat-1','emi','cat-15','transfers'].map((id,i)=>({id:`t-${i}`,category_id:id,date:'2026-10-01',amount:1000,note:'',is_recurring:false,tags:[]}));
 assert.deepEqual(totals(s,'2026-10'),{income:10000,expenses:1000,balance:6000,savings:8000,rate:80,emi:0});assert.equal(cashBalance(s,'2026-10'),6000);
});
