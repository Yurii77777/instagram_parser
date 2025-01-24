const puppeteer = require('puppeteer');

import { logger, LoggerType } from '../utils/logger';

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
      logger({ type: LoggerType.Error, message: 'Browser was not launched!', meta: error });
    }
  }

  async closeBrowser(browserInstance): Promise<void> {
    try {
      return await browserInstance.close();
    } catch (error) {
      logger({ type: LoggerType.Error, message: 'Browser was not closed!', meta: error });
    }
  }

  async createPage(browserInstance) {
    try {
      return await browserInstance.newPage();
    } catch (error) {
      logger({ type: LoggerType.Error, message: 'Page was not created!', meta: error });
    }
  }
}
