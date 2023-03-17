/**
 * Listens for network requests through devtools matching against regex.
 */
export async function getApiCallHeaders(page, url, regex=/\/graphql$/) {
  return new Promise(async (resolve, reject) => {
    let resolved = false;
    try {
      const devtools = await page.target().createCDPSession();
      await devtools.send('Network.enable');
      await devtools.send('Network.setRequestInterception', {
        patterns: [{ urlPattern: '*' }],
      });
      devtools.on('Network.requestIntercepted', async (event) => {
        if (resolved) return;
        if (regex.test(event.request.url)) {
          resolved = true;
          return resolve(event.request.headers);
        }
        await devtools.send('Network.continueInterceptedRequest', {
          interceptionId: event.interceptionId,
        });
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' },);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    }
  });
};