import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '../../shared/schema';
import { categoryHelp, categoryKinds, kindLabels, normalName } from '../../shared/categories';
import { uid } from '../../shared/finance';
import { useStore } from '../lib';
import { Button, Card, Modal } from './ui';

export function CategorySettings(){
 const {state:s,save,saving}=useStore();
 const [edit,setEdit]=useState<Partial<Category>|null>(null),[merge,setMerge]=useState('');
 if(!s)return null;
 return <Card title="Your categories" subtitle="Choose what the money was for. The examples below help you decide." action={<Button variant="outline" onClick={()=>{setEdit({kind:'spending'});setMerge('');}}><Plus size={15}/>Add category</Button>}>
  <p className="category-guide">Everyday spending has eight main groups, plus Other for temporary items. Repayments, savings and transfers are shown separately. Use tags such as Family or Work for who a purchase is for.</p>
  {categoryKinds.map(kind=>{const cats=s.categories.filter(c=>(c.kind||'review')===kind);return cats.length>0&&<section className="category-section" key={kind}><h3>{kindLabels[kind]}</h3>{kind==='review'&&<p className="field-hint">These names need your meaning, such as Family, Subscriptions or return Fund. They still count as spending until reviewed. Edit to choose a type or move their entries into an existing category.</p>}<div className="categories-grid">{cats.map(c=><div className="category-setting" key={c.id} title={categoryHelp(c)}><i style={{background:c.color}}/><div className="category-copy"><b>{c.name}</b><p>{categoryHelp(c)}</p></div><div className="row-actions"><button aria-label={`Edit ${c.name}`} onClick={()=>{setEdit(c);setMerge('');}}><Pencil size={14}/></button><button aria-label={`Delete ${c.name}`} disabled={saving||c.id==='emi'} onClick={async()=>{if(s.expenses.some(e=>e.category_id===c.id)||s.budgets.some(b=>b.category_id===c.id)){toast.error('Edit this category and move its entries to another category first.');return;}await save({...s,categories:s.categories.filter(x=>x.id!==c.id)});}}><Trash2 size={14}/></button></div></div>)}</div></section>})}
  {edit&&<Modal open title={edit.id?'Edit category':'New category'} onClose={()=>setEdit(null)}><form className="form-grid" onSubmit={async e=>{
   e.preventDefault();const f=new FormData(e.currentTarget),next=structuredClone(s);
   if(merge&&edit.id){const target=next.categories.find(c=>c.id===merge)!;next.categories=[target,...next.categories.filter(c=>c.id!==target.id).map(c=>c.id===edit.id?{...target,id:c.id}:c)];for(const t of next.expenses)if(t.category_id===edit.id)t.original_category??=edit.name;}
   else {const name=String(f.get('name')).trim();if(next.categories.some(c=>c.id!==edit.id&&normalName(c.name)===normalName(name))){toast.error('This category already exists. Use it or merge into it.');return;}const c:Category={id:edit.id||uid(),name,color:String(f.get('color')),description:String(f.get('description')).trim(),kind:String(f.get('kind')) as Category['kind'],icon:edit.icon||'Wallet',type:edit.type||'variable'};next.categories=edit.id?next.categories.map(x=>x.id===edit.id?c:x):[...next.categories,c];}
   if(await save(next)){setEdit(null);toast.success(merge?'Categories merged; transactions and budgets kept.':'Category saved');}
  }}>
   {edit.id&&edit.id!=='emi'&&<label className="full">Move everything into another category<select value={merge} onChange={e=>setMerge(e.target.value)}><option value="">Keep this category</option>{s.categories.filter(c=>c.id!==edit.id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><small className="field-hint">Moves all past transactions and adds monthly budget limits together. Original category names stay on transactions.</small></label>}
   {!merge&&<><label className="full">Name<input name="name" required maxLength={60} defaultValue={edit.name}/></label><label className="full">What belongs here?<textarea name="description" required maxLength={400} defaultValue={edit.description} placeholder="Example: bus fares, petrol, parking and car repairs"/></label><label>Money type<select name="kind" defaultValue={edit.kind||'spending'} disabled={edit.id==='emi'}>{categoryKinds.map(k=><option value={k} key={k}>{kindLabels[k]}</option>)}</select>{edit.id==='emi'&&<input type="hidden" name="kind" value="debt"/>}</label><label>Colour<input name="color" type="color" defaultValue={edit.color||'#8172d5'}/></label><p className="field-hint full">Choose the purpose, not who you paid. A monthly payment can change in amount: electricity is recurring, but variable.</p></>}
   <Button className="full" disabled={saving}>{merge?'Merge and keep history':'Save category'}</Button>
  </form></Modal>}
 </Card>;
}
