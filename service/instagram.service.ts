const fs = require('fs');
const path = require('path');

import { getRandomNumber } from '../utils/getRandomNumber';
import { convertToCSV } from '../utils/convertToCSV';
import { delay } from '../utils/delay';
import { logger, LoggerType } from '../utils/logger';

import { needToCreateCsvFile, TAG } from '../constants/common.constants';
import {
  CHAT_BUTTON_TITLE,
  INSTAGRAM_API,
  INSTAGRAM_CONSTANTS,
  MAX_ATTEMPTS_TO_SCROLL_FOLLOWERS_DIALOG,
  MAX_DELAY_MILLISECONDS_AUTH,
  MAX_DELAY_MILLISECONDS_SCROLL_FOLLOWERS,
  MIN_DEFAULT_DELAY,
  MIN_DELAY_MILLISECONDS_AUTH,
  MIN_DELAY_MILLISECONDS_SCROLL_FOLLOWERS,
  NEEDED_LIST_ITEM_INDEX,
  NEEDED_SECTION_ITEM_INDEX,
  NUMBER_OF_ELEMENTS_LIST,
  NUMBER_OF_ELEMENTS_SECTION,
  SEND_MESSAGE_BUTTON_TITLE,
} from '../constants/instagram.constants';

export class InstagramService {
  async userAuthorize({ page, email, password }) {
    try {
      await page.goto(INSTAGRAM_CONSTANTS.BASE_URL);
      await page.waitForSelector(TAG.FORM);
      logger({ type: LoggerType.Info, message: `Tag ${TAG.FORM} successfully loaded` });

      const inputUserName = await page.$(INSTAGRAM_CONSTANTS.USER_NAME_INPUT);
      await inputUserName.type(email);
      logger({ type: LoggerType.Info, message: `User name ${email} successfully added` });

      const inputUserPassword = await page.$(INSTAGRAM_CONSTANTS.USER_PASSWORD_INPUT);
      await inputUserPassword.type(password);
      logger({ type: LoggerType.Info, message: `User password successfully added` });

      const button = await page.$(INSTAGRAM_CONSTANTS.LOGIN_BUTTON);

      if (!button) {
        logger({ type: LoggerType.Error, message: `Login button not found!` });
        return;
      }

      await button.click();
      logger({ type: LoggerType.Info, message: `Loged in successfully` });

      await delay(getRandomNumber(MIN_DELAY_MILLISECONDS_AUTH, MAX_DELAY_MILLISECONDS_AUTH));
      logger({ type: LoggerType.Info, message: `Delay have passed` });

      return true;
    } catch (error) {
      logger({ type: LoggerType.Error, message: `userAuthorize`, meta: error });
      return false;
    }
  }

  async parseFollowers({ page, donorPage }) {
    const followers = [];

    try {
      await page.goto(`${INSTAGRAM_CONSTANTS.BASE_URL}${donorPage}`);
      logger({ type: LoggerType.Info, message: `Navigate to ${donorPage} page` });

      await page.waitForSelector(TAG.HEADER);
      logger({ type: LoggerType.Info, message: `Tag ${TAG.HEADER} successfully loaded` });

      const sections = await page.$$(TAG.SECTION);
      logger({ type: LoggerType.Info, message: `Tags ${TAG.SECTION} successfully retrived` });

      if (sections.length < NUMBER_OF_ELEMENTS_SECTION) {
        logger({ type: LoggerType.Error, message: `Not enough ${TAG.LIST_ITEM} elements in the ${TAG.LIST}!` });
        return;
      }

      const fourthSection = sections[NEEDED_SECTION_ITEM_INDEX];
      const topMenuList = await fourthSection.$(TAG.LIST);

      if (!topMenuList) {
        logger({ type: LoggerType.Error, message: `Not found ${TAG.LIST} in the ${TAG.SECTION}!` });
        return;
      }

      const listItems = await topMenuList.$$(TAG.LIST_ITEM);

      if (listItems.length < NUMBER_OF_ELEMENTS_LIST) {
        logger({ type: LoggerType.Error, message: `Not enough ${TAG.LIST_ITEM} elements in the ${TAG.LIST}!` });
        return;
      }

      await listItems[NEEDED_LIST_ITEM_INDEX].click();
      logger({
        type: LoggerType.Info,
        message: `Clicked the second ${TAG.LIST_ITEM} element in the ${TAG.LIST}`,
      });

      page.on('response', async (response) => {
        const request = response.request();
        const requestUrl = request.url();

        if (requestUrl.includes(INSTAGRAM_API.FOLLOWERS)) {
          try {
            const responseBody = await response.json();
            if (responseBody?.status !== 'ok') return;

            followers.push(...responseBody.users);
            logger({
              type: LoggerType.Info,
              message: `Total parsed followers: ${followers.length}`,
            });
          } catch (err) {
            logger({ type: LoggerType.Error, message: 'Failed to parse response body' });
          }
        }
      });

      await page.waitForSelector(INSTAGRAM_CONSTANTS.DIALOG_POPUP, { visible: true });
      logger({
        type: LoggerType.Info,
        message: `Tag ${INSTAGRAM_CONSTANTS.DIALOG_POPUP} successfully loaded`,
      });

      await page.waitForSelector(INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

      let previousHeight;
      let newHeight;
      let noMoreNewElements = 0;

      while (noMoreNewElements < MAX_ATTEMPTS_TO_SCROLL_FOLLOWERS_DIALOG) {
        previousHeight = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.scrollHeight : 0;
        }, INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

        await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollBy(0, 500);
          }
        }, INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

        await delay(getRandomNumber(MIN_DELAY_MILLISECONDS_SCROLL_FOLLOWERS, MAX_DELAY_MILLISECONDS_SCROLL_FOLLOWERS));

        newHeight = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.scrollHeight : 0;
        }, INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

        if (newHeight === previousHeight) {
          noMoreNewElements++;
        } else {
          noMoreNewElements = 0;
        }

        logger({
          type: LoggerType.Info,
          message: `'Scrolling... Current height: ${newHeight}`,
        });
      }

      logger({
        type: LoggerType.Info,
        message: `Finished scrolling. Total followers collected: ${followers.length}`,
      });

      if (!needToCreateCsvFile) {
        return followers;
      } else {
        const csvData = convertToCSV(followers);

        const filePath = path.join(__dirname, 'followers.csv');
        fs.writeFileSync(filePath, csvData, 'utf8');

        logger({
          type: LoggerType.Info,
          message: `CSV file has been saved at ${filePath}`,
        });

        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: __dirname,
        });

        const htmlContent = `
        <html>
          <body>
            <a href="file://${filePath}" download="followers.csv" id="download-link">Download CSV</a>
            <script>
              document.getElementById('download-link').click();
            </script>
          </body>
        </html>
        `;

        const htmlFilePath = path.join(__dirname, 'download.html');
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

        await page.goto(`file://${htmlFilePath}`);

        return followers;
      }
    } catch (error) {
      logger({ type: LoggerType.Error, message: 'parseFollowers', meta: error });
      return followers;
    }
  }

  async sendMessage({ message, recipient, page }) {
    try {
      await page.goto(`${INSTAGRAM_CONSTANTS.BASE_URL}${INSTAGRAM_API.DIRECT}`);
      logger({ type: LoggerType.Info, message: `Navigate to '${INSTAGRAM_API.DIRECT}' page` });

      await delay(getRandomNumber(MIN_DELAY_MILLISECONDS_SCROLL_FOLLOWERS, MAX_DELAY_MILLISECONDS_SCROLL_FOLLOWERS));

      const turnOffNotificationButton = await page.$(INSTAGRAM_CONSTANTS.TURN_OFF_NOTIFICATION_BUTTON);

      if (turnOffNotificationButton) {
        await turnOffNotificationButton.click();
        logger({ type: LoggerType.Info, message: 'Notifications off' });
      }

      await page.waitForSelector(INSTAGRAM_CONSTANTS.BUTTON);
      const wasClickedSendMessageButton = await page.evaluate((selector) => {
        const divButtons = document.querySelectorAll(selector);
        const divButtonsArray = Array.from(divButtons);

        for (let div of divButtonsArray) {
          const buttonDiv = div as HTMLDivElement;

          if (buttonDiv.textContent.trim() === 'Send message') {
            buttonDiv.click();
            return true;
          }
        }

        return false;
      }, INSTAGRAM_CONSTANTS.BUTTON);

      if (wasClickedSendMessageButton) {
        logger({ type: LoggerType.Info, message: 'Send message dialog opened' });
      } else {
        logger({ type: LoggerType.Error, message: 'Failed to open message dialog!' });
      }

      await page.waitForSelector(INSTAGRAM_CONSTANTS.DIALOG_POPUP, { visible: true });
      await page.waitForSelector(INSTAGRAM_CONSTANTS.SEARCH_USER_INPUT);
      const searchUserInput = await page.$(INSTAGRAM_CONSTANTS.SEARCH_USER_INPUT);
      await searchUserInput.type(recipient);

      await delay(getRandomNumber(MIN_DELAY_MILLISECONDS_SCROLL_FOLLOWERS, MAX_DELAY_MILLISECONDS_SCROLL_FOLLOWERS));

      await page.waitForSelector(INSTAGRAM_CONSTANTS.USER_CHECKBOX);
      await page.evaluate((userCheckboxSelector) => {
        const checkbox = document.querySelector(userCheckboxSelector) as HTMLInputElement;

        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      }, INSTAGRAM_CONSTANTS.USER_CHECKBOX);

      const chatDialog = await page.$(INSTAGRAM_CONSTANTS.DIALOG_POPUP);

      if (!chatDialog) {
        logger({ type: LoggerType.Error, message: 'Chat dialog not retrived!' });
        return;
      }

      await delay(MIN_DEFAULT_DELAY);
      const chatButton = await chatDialog.$(INSTAGRAM_CONSTANTS.BUTTON);

      if (!chatButton) {
        logger({ type: LoggerType.Error, message: 'Chat button not found!' });
        return;
      }

      const chatButtons = await chatDialog.$$(INSTAGRAM_CONSTANTS.BUTTON);
      const isChatButtons = !!chatButtons?.length;

      if (!isChatButtons) {
        logger({ type: LoggerType.Error, message: 'No any buttons found!' });
        return;
      }

      let foundChatButton = null;

      for (const button of chatButtons) {
        const buttonText = await page.evaluate((el) => el.textContent.trim(), button);

        if (buttonText === CHAT_BUTTON_TITLE) {
          foundChatButton = button;
          break;
        }
      }

      if (!foundChatButton) {
        logger({ type: LoggerType.Error, message: 'Chat button not found!' });
        return;
      }

      const isDisabled = await page.evaluate((el) => {
        return el.getAttribute('aria-disabled') === 'true';
      }, foundChatButton);

      if (!isDisabled) {
        await foundChatButton.click();
        logger({ type: LoggerType.Info, message: 'Chat button clicked!' });
      } else {
        logger({ type: LoggerType.Error, message: 'Chat button is disabled!' });
      }

      await page.waitForSelector(INSTAGRAM_CONSTANTS.TEXT_AREA, { visible: true });
      const textArea = await page.$(INSTAGRAM_CONSTANTS.TEXT_AREA);
      await textArea.type(message);
      logger({ type: LoggerType.Info, message: 'essage successfully added to the text area' });
      await delay(getRandomNumber(700, 1000));

      const sendMessageInputContainer = await page.$(INSTAGRAM_CONSTANTS.SEND_MESSAGE_CONTAINER);

      if (sendMessageInputContainer) {
        const buttons = await sendMessageInputContainer.$$(INSTAGRAM_CONSTANTS.BUTTON);
        const isButtons = !!buttons?.length;

        if (!isButtons) {
          logger({ type: LoggerType.Error, message: 'No buttons found in the message container!' });
          return;
        }

        let foundSendMessageButton = null;

        for (const button of buttons) {
          const buttonText = await page.evaluate((el) => el.textContent.trim(), button);

          if (buttonText === SEND_MESSAGE_BUTTON_TITLE) {
            foundSendMessageButton = button;
            break;
          }
        }

        if (!foundSendMessageButton) {
          logger({ type: LoggerType.Error, message: 'Send message button not found!' });
          return;
        }

        await foundSendMessageButton.click();
        logger({ type: LoggerType.Info, message: 'Message sent successfully!' });

        return true;
      }

      return false;
    } catch (error) {
      logger({ type: LoggerType.Error, message: 'sendMessage', meta: error });

      return false;
    }
  }
}
