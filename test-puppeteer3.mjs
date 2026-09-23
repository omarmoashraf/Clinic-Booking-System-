import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('request', msg => console.log('REQ:', msg.method(), msg.url()));
  page.on('response', msg => console.log('RES:', msg.status(), msg.url()));

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'test@test.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
