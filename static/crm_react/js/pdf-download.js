const puppeteer = require('puppeteer');
//const pdf_settings = require('./pdf_settings');
const report_page = process.argv[2];
const file_path = process.argv[3];

//console.log("file_path", file_path)

//const report_page = 'http://127.0.0.1:8001/quotation/document/1ff1de774005f8da13f42943881c655f/';

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  //page.on('load', () => console.log(page.url()))
  page.on('response', response => {
  const req = response.request();
    console.log(req.method, response.status, req.url);
    });
  //await page.goto(pdf_settings.login_page, {waitUntil:'networkidle0'});

  await page.waitFor(2000);

  await page.goto(report_page, {waitUntil:'networkidle0'});

  await page.emulateMedia('screen');
  await page.pdf({path: file_path, format: 'A4'});
  await browser.close();
})();