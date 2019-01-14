const puppeteer = require('puppeteer');

const url = 'http://localhost:6006/iframe.html?selectedKind=Accordions&selectedStory=Collapse';

(async () => {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
// Adjustments particular to this page to ensure we hit desktop breakpoint.
  page.setViewport({width: 1400, height: 800, deviceScaleFactor: 1});

  await page.goto(url, {waitUntil: 'networkidle2'});

  /**
   * Takes a screenshot of a DOM element on the page, with optional padding.
   *
   * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
   * @return {!Promise<!Buffer>}
   */
  async function screenshotDOMElement(opts = {}) {
      const padding = 'padding' in opts ? opts.padding : 0;
      const path = 'path' in opts ? opts.path : null;
      const selector = opts.selector;

      if (!selector)
          throw Error('Please provide a selector.');

          
          const rect = await page.evaluate(selector => {
          const element = document.querySelector(selector);

          document.querySelector('#root').firstElementChild.lastElementChild.style.display = "none";

          if (!element)
              return null;
          const {x, y, width, height} = element.getBoundingClientRect();
          return {left: x, top: y, width, height, id: element.id};
      }, selector);

      if (!rect)
          throw Error(`Could not find element that matches selector: ${selector}.`);

      return await page.screenshot({
          path,
          fullPage: true,
      });
  }

  await screenshotDOMElement({
      path: 'element.png',
      selector: '.uil-locale-provider',
      padding: 16
  });

  browser.close();
})();