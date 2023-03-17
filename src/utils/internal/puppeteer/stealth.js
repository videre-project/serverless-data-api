import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export async function usePuppeteerStealth({
  abort = ['image', 'font', 'stylesheet'],
  args = ['--no-sandbox'],
  headless = true,
}) {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: headless,
    args: args
  });

  const page = (await browser.pages())[0];
  page.setDefaultNavigationTimeout(0); 

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if ([...abort].includes(request.resourceType()))
      request.abort();
    else
      request.continue();
  });
  
  return { browser, page };
};

export default usePuppeteerStealth;