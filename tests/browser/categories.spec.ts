import { test, expect } from '@playwright/test';

test('category guidance, custom categories, merges and separated money views',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/');await page.getByRole('button',{name:'Explore the live demo'}).click();
 await page.goto('/settings');
 await expect(page.getByText('Home & Bills',{exact:true})).toBeVisible();
 await expect(page.getByText('Rent, electricity, water, cooking gas, mobile and internet bills.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Add category',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Name',{exact:true}).fill('Pet care');await dialog.getByLabel('What belongs here?').fill('Pet food, vet visits and grooming.');await dialog.getByRole('button',{name:'Save category'}).click();
 await expect(page.getByText('Pet food, vet visits and grooming.',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByText('Pet care',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Edit Subscriptions',exact:true}).click();await dialog.getByLabel('Move everything into another category').selectOption({label:'Personal & Lifestyle'});await dialog.getByRole('button',{name:'Merge and keep history'}).click();await expect(page.getByRole('button',{name:'Edit Subscriptions',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Add expense',exact:true}).click();await dialog.getByRole('combobox',{name:'Category',exact:true}).selectOption({label:'Transport'});await expect(dialog.getByRole('status')).toContainText('petrol');await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.goto('/expenses');await page.getByLabel('Money type filter').selectOption('debt');await expect(page.getByRole('cell',{name:/Debt Repayments Originally: EMI/}).first()).toBeVisible();
 await page.goto('/settings');await page.setViewportSize({width:360,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'artifacts/categories-mobile.png',fullPage:true});
});
