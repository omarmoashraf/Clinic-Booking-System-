import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async response => {
    if (response.url().includes('login')) {
      console.log('Response URL:', response.url());
      console.log('Response Status:', response.status());
      try {
        console.log('Response Body:', await response.text());
      } catch (e) {
        console.log('Response Body error:', e.message);
      }
    }
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'test@test.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
