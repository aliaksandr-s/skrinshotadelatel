const puppeteer = require('puppeteer');

const url = `http://localhost:6006/iframe.html?selectedKind=${
  process.argv[2]
}&selectedStory=${process.argv[3]}`;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Adjustments particular to this page to ensure we hit desktop breakpoint.
  page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 1 });

  await page.goto(url, { waitUntil: 'networkidle2' });

  /**
   * Takes a screenshot of a DOM element on the page, with optional padding.
   *
   * @param {!{path:string, selector:string, screenType:string, arabic:boolean}} opts
   * @return {!Promise<!Buffer>}
   */
  async function screenshotDOMElement(opts = {}) {
    const path = 'path' in opts ? opts.path : null;
    const selector = opts.selector;
    const screenType = opts.screenType;
    const isArabic = opts.arabic;

    if (!selector) throw Error('Please provide a selector.');

    const rect = await page.evaluate(
      data => {
        document.querySelector(
          '.uil-story-wrapper'
        ).className = `uil-story-wrapper uil-story-wrapper_${data.screenType}`;
        if (data.isArabic) {
          document.querySelector(
            '.uil-locale-provider'
          ).className = `uil-locale-provider uil-locale-provider_rtl`;
        } else {
          document.querySelector(
            '.uil-locale-provider'
          ).className = `uil-locale-provider`;
        }
        document.querySelector(
          '#root'
        ).firstElementChild.lastElementChild.style.display = 'none';

        const element = document.querySelector(data.selector);
        if (!element) return null;
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      },
      { selector, screenType, isArabic }
    );

    if (!rect) {
      throw Error(`Could not find element that matches selector: ${selector}.`);
    }

    return await page.screenshot({
      path,
      fullPage: true
    });
  }

  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_desktop_ar.png`,
    selector: '.uil-locale-provider',
    screenType: 'desktop',
    arabic: true
  });
  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_tablet_ar.png`,
    selector: '.uil-locale-provider',
    screenType: 'tablet',
    arabic: true
  });
  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_phone_ar.png`,
    selector: '.uil-locale-provider',
    screenType: 'phone',
    arabic: true
  });
  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_desktop_en.png`,
    selector: '.uil-locale-provider',
    screenType: 'desktop',
    arabic: false
  });
  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_tablet_en.png`,
    selector: '.uil-locale-provider',
    screenType: 'tablet',
    arabic: false
  });
  await screenshotDOMElement({
    path: `screenshots/${process.argv[3]}_phone_en.png`,
    selector: '.uil-locale-provider',
    screenType: 'phone',
    arabic: false
  });

  browser.close();
})();
