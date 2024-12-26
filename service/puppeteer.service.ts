const puppeteer = require('puppeteer');

export class PuppeteerService {
  async launchBrowser(settings?) {
    try {
      return await puppeteer.launch({
        timeout: 60000,
        headless: false,
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
        ...settings,
      });
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m Browser was not launched!', 'ERROR :::');
    }
  }

  async closeBrowser(browserInstance): Promise<void> {
    try {
      return await browserInstance.close();
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m Browser was not closed!', 'ERROR :::');
    }
  }

  async createPage(browserInstance) {
    try {
      return await browserInstance.newPage();
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m Page was not created!', 'ERROR :::');
    }
  }
}
