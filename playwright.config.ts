import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://localhost:8000',channel:'chrome',headless:true},webServer:{command:'npm run dev',url:'http://localhost:8000/api/health',reuseExistingServer:true,timeout:60000},reporter:'list'});
