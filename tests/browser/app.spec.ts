import { test, expect } from '@playwright/test';
test('API rejects requests from untrusted origins',async({request})=>{
 const health=await request.get('/api/health');expect(health.ok()).toBe(true);
 const rejected=await request.post('/api/auth/signup',{headers:{Origin:'https://untrusted.example'},data:{email:'test@example.com',password:'test-password-123'}});expect(rejected.status()).toBe(403);
 if((await health.json()).database==='unconfigured'){
  const unavailable=await request.post('/api/auth/signup',{headers:{Origin:'http://localhost:8000'},data:{email:'test@example.com',password:'test-password-123'}});expect(unavailable.status()).toBe(503);
 }
});
test('demo transactions, goals, budgets, reports and mobile navigation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:'Explore the live demo'}).click();
 await expect(page.getByRole('heading',{name:'A little clarity. A lot of possibility.'})).toBeVisible();
 await page.getByRole('button',{name:'Add expense',exact:true}).click();
 await page.getByLabel('Amount (₹)').fill('1234');await page.getByLabel('Note',{exact:true}).fill('Browser smoke purchase');
 await page.getByRole('button',{name:'Save transaction'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.locator('.sidebar').getByRole('link',{name:'Expenses',exact:true}).click();await page.getByLabel('Search transactions').fill('Browser smoke purchase');
 await expect(page.getByRole('cell',{name:'Browser smoke purchase',exact:true})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Your expenses'})).toBeVisible();
 await page.locator('.sidebar').getByRole('link',{name:'Savings goals'}).click();await page.getByRole('button',{name:'New goal'}).click();
 await page.getByLabel('Goal name').fill('Browser goal');await page.getByLabel('Target (₹)').fill('10000');await page.getByLabel('Deadline').fill('2027-12-01');await page.getByRole('button',{name:'Save goal'}).click();await expect(page.getByRole('heading',{name:'Browser goal'})).toBeVisible();
 await page.locator('.sidebar').getByRole('link',{name:'Budgets',exact:true}).click();await expect(page.getByRole('heading',{name:'Make a little room'})).toBeVisible();
 await page.locator('.sidebar').getByRole('link',{name:'EMIs & loans'}).click();await page.getByRole('button',{name:'View schedule & payment history'}).first().click();await expect(page.getByRole('heading',{name:'Amortization schedule'})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.locator('.sidebar').getByRole('link',{name:'Reports',exact:true}).click();await expect(page.getByRole('heading',{name:'Patterns worth knowing'})).toBeVisible();
 await page.locator('.sidebar').getByRole('link',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Use dark mode'}).click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Use light mode'}).click();await page.locator('.sidebar').getByRole('link',{name:'Overview',exact:true}).click();
 await expect(page.locator('.stat-card').first().locator('strong')).toHaveText('₹1,03,000');
 await expect(page.locator('[data-sonner-toast]')).toHaveCount(0,{timeout:10000});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'artifacts/dashboard-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/dashboard-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.locator('.mobile-bottom').getByRole('link',{name:'Expenses'}).click();await expect(page.getByRole('heading',{name:'Your expenses'})).toBeVisible();expect(errors).toEqual([]);
});

test('people ledger records an entry, proof, partial repayment, and statement',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/');await page.getByRole('button',{name:'Explore the live demo'}).click();
 await page.locator('.sidebar').getByRole('link',{name:'People & Loans',exact:true}).click();
 await expect(page.getByRole('heading',{name:'People & Loans'})).toBeVisible();
 await page.screenshot({path:'artifacts/people-overview.png',fullPage:true});
 await page.getByRole('button',{name:'Add person'}).click();
 await page.getByLabel('Name',{exact:true}).fill('Browser Friend');await page.getByLabel('Phone (optional)').fill('919999999999');await page.getByRole('button',{name:'Save person'}).click();
 await page.getByRole('button',{name:'Add entry',exact:true}).click();
 const entryDialog=page.getByRole('dialog');await entryDialog.getByRole('combobox').first().selectOption({label:'Browser Friend · Friend'});await entryDialog.getByLabel('Amount (₹)').fill('2000');await entryDialog.getByLabel('Purpose / note').fill('Browser loan');
 await page.locator('.proof-uploader input[type=file]').first().setInputFiles({name:'proof.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});
 await expect(page.getByText('proof.png')).toBeVisible();await page.getByRole('button',{name:'Save entry'}).click();
 await page.getByRole('link',{name:/Browser Friend/}).click();await expect(page.getByRole('heading',{name:'Browser loan'})).toBeVisible();await expect(page.getByText('Pending ₹2,000')).toBeVisible();
 await page.locator('.proof-thumb').click();await expect(page.getByRole('dialog',{name:'Proof viewer'})).toBeVisible();await page.getByRole('button',{name:'Close proof viewer'}).click();
 await page.getByRole('button',{name:'Add repayment'}).click();await page.getByLabel('Amount (₹)').fill('500');await page.getByLabel('Note').fill('First part');await page.getByRole('button',{name:'Save repayment'}).click();
 await expect(page.getByText('Pending ₹1,500')).toBeVisible();await expect(page.getByText(/Money received · ₹500/)).toBeVisible();
 await page.getByRole('button',{name:'Copy for WhatsApp'}).click();await expect(page.getByText('Statement copied for WhatsApp')).toBeVisible();
 await expect(page.locator('[data-sonner-toast]')).toHaveCount(0,{timeout:10000});await page.screenshot({path:'artifacts/person-detail.png',fullPage:true});
});
