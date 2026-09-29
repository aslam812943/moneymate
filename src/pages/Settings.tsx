import { useState } from 'react';
import { addMonths, format } from 'date-fns';
import { Database, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '../../shared/schema';
import { demoState, emptyState, monthKey, salaryCreditDate, uid } from '../../shared/finance';
import { download, useStore } from '../lib';
import { Button, Card, Modal } from '../components/ui';

type SalaryRule='fixed'|'last_working_day'|'before_last_working_day'|'manual';

function SalaryProfile(){
 const {state:s,save,saving}=useStore();
 const [rule,setRule]=useState<SalaryRule>(()=>s?.profile.salary_credit_rule||'fixed');
 if(!s)return null;
 const saveProfile=async(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget),salary=Number(f.get('salary')),day=rule==='fixed'?Number(f.get('day')):1,next=structuredClone(s);
  next.profile={...next.profile,name:String(f.get('name')),salary_credit_day:day,salary_credit_rule:rule,monthly_salary:salary};
  const templates=next.incomes.filter(i=>i.salary_schedule&&i.is_recurring&&!i.recurrence_id);
  for(const template of templates)template.amount=salary;
  if(rule!=='manual'&&salary>0&&!templates.length){let salaryMonth=monthKey(),date=salaryCreditDate(salaryMonth,next.profile);if(date>format(new Date(),'yyyy-MM-dd')){salaryMonth=monthKey(addMonths(new Date(),-1));date=salaryCreditDate(salaryMonth,next.profile);}next.incomes.push({id:uid(),amount:salary,date,source_type:'Salary',note:'Monthly salary',is_recurring:true,salary_schedule:true,tags:[]});}
  if(await save(next))toast.success('Profile and salary schedule updated');
 };
 return <Card title="Your profile" subtitle="Your details and salary schedule"><form className="form-grid" onSubmit={saveProfile}>
  <label className="full">Name<input name="name" required maxLength={80} defaultValue={s.profile.name}/></label>
  <label>Currency<select defaultValue="INR"><option value="INR">INR · Indian Rupee (₹)</option></select></label>
  <label>Monthly salary (₹)<input name="salary" type="number" min="0" max="1000000000000" required defaultValue={s.profile.monthly_salary||0}/></label>
  <label className="full">Salary recording<select value={rule} onChange={e=>setRule(e.target.value as SalaryRule)}><option value="fixed">Fixed date each month</option><option value="last_working_day">Last working day</option><option value="before_last_working_day">One working day before month-end</option><option value="manual">Manual — add when received</option></select></label>
  {rule==='fixed'&&<label className="full">Salary credit date<input name="day" type="number" min="1" max="31" required defaultValue={s.profile.salary_credit_day}/><small className="field-hint">Dates 29–31 use the last calendar day in shorter months.</small></label>}
  <p className="salary-rule-note full">{rule==='last_working_day'?'Automatically recorded on the final Monday–Friday of each month.':rule==='before_last_working_day'?'Automatically recorded one working day before the final weekday of each month.':rule==='manual'?'Add salary from the Income page on the day it reaches your account.':'Future salary entries follow this date.'}</p>
  <Button disabled={saving}>Save profile</Button>
 </form></Card>;
}

export function Settings({dark,toggleTheme}:{dark:boolean;toggleTheme:()=>void}){
 const {state:s,save,saving,demo,deleteAccount}=useStore();
 const [category,setCategory]=useState<Partial<Category>|null>(null);
 if(!s)return null;
 return <>
  <div className="page-heading"><div><div className="eyebrow">MAKE YOURSELF AT HOME</div><h1>The little details</h1><p>Your profile, preferences, and data.</p></div><span className="badge"><Database size={14}/>{demo?'Local demo storage':'MongoDB account'}</span></div>
  <div className="two-col"><SalaryProfile/><Card title="Your preferences" subtitle="A comfortable place to check in"><div className="setting-row"><div><b>Appearance</b><p className="muted">{dark?'A softer view for late evenings.':'A little light for your day.'}</p></div><Button variant="outline" onClick={toggleTheme}>{dark?'Use light mode':'Use dark mode'}</Button></div><div className="setting-row"><div><b>Storage</b><p className="muted">{demo?'Demo data stays in this browser. Sign out and create an account to use MongoDB.':'Your account data is saved privately in MongoDB.'}</p></div></div></Card></div>
  <Card title="Your categories" subtitle="Organize your spending in a way that makes sense to you" action={<Button variant="outline" onClick={()=>setCategory({})}><Plus size={15}/>Add category</Button>}><div className="categories-grid">{s.categories.map(c=><div className="category-setting" key={c.id}><i style={{background:c.color}}/><div><b>{c.name}</b><small>{c.type}</small></div><div className="row-actions"><button aria-label={`Edit ${c.name}`} onClick={()=>setCategory(c)}><Pencil size={14}/></button><button aria-label={`Delete ${c.name}`} disabled={c.id==='emi'} onClick={async()=>{if(s.expenses.some(e=>e.category_id===c.id)||s.budgets.some(b=>b.category_id===c.id)){toast.error('Move or remove linked expenses and budgets before deleting this category.');return;}if(confirm(`Delete ${c.name}?`))await save({...s,categories:s.categories.filter(x=>x.id!==c.id)});}}><Trash2 size={14}/></button></div></div>)}</div></Card>
  <Card title="Your data, your choice" subtitle="Export a copy, try sample data, or start fresh"><div className="setting-row"><div><b>Export all data</b><p className="muted">Download your full financial data as JSON.</p></div><Button variant="outline" onClick={()=>download('moneymate-backup.json',JSON.stringify(s,null,2),'application/json')}><Download size={15}/>Export data</Button></div><div className="setting-row"><div><b>Explore with demo data</b><p className="muted">Replace current data with six months of sample finances.</p></div><Button variant="outline" onClick={async()=>{if(confirm('Replace all current financial data with sample data? Export a backup first if needed.')){const next=demoState();next.profile=s.profile;if(await save(next))toast.success('Demo data loaded');}}}>Load demo data</Button></div><div className="setting-row"><div><b>Clear financial data</b><p className="muted">Remove transactions, loans, budgets, goals, and personal ledgers. Keep your profile.</p></div><Button variant="danger" onClick={async()=>{if(confirm('Permanently clear all financial data?')){const next=emptyState(s.profile.name);next.profile=s.profile;await save(next);}}}>Clear data</Button></div><div className="setting-row"><div><b>Delete {demo?'demo data':'account'}</b><p className="muted">Permanently remove {demo?'the demo on this browser':'your account and all stored data'}.</p></div><Button variant="danger" onClick={()=>{if(confirm('Permanently delete all data and sign out? This cannot be undone.'))void deleteAccount();}}><Trash2 size={15}/>Delete {demo?'demo':'account'}</Button></div></Card>
  {category&&<Modal open title={category.id?'Edit category':'New category'} onClose={()=>setCategory(null)}><form className="form-grid" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget),c:Category={id:category.id||uid(),name:String(f.get('name')),color:String(f.get('color')),type:String(f.get('type')) as Category['type'],icon:'Wallet'};if(await save({...s,categories:category.id?s.categories.map(x=>x.id===category.id?c:x):[...s.categories,c]})){setCategory(null);toast.success('Category saved');}}}><label className="full">Name<input name="name" required maxLength={60} defaultValue={category.name}/></label><label>Color<input name="color" type="color" defaultValue={category.color||'#8172d5'}/></label><label>Type<select name="type" defaultValue={category.type||'variable'}><option value="variable">Variable</option><option value="fixed">Fixed</option></select></label><Button className="full" disabled={saving}>Save category</Button></form></Modal>}
 </>;
}
