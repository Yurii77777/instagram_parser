const fs = require('fs');
const path = require('path');

import { FollowerRepository } from '../repository/follower.repository';

import { getRandomNumber } from '../utils/getRandomNumber';
import { convertToCSV } from '../utils/convertToCSV';
import { delay } from '../utils/delay';

import { needToCreateCsvFile, TAG } from '../constants/common.constants';
import { INSTAGRAM_API, INSTAGRAM_CONSTANTS } from '../constants/instagram.constants';

export class InstagramService {
  private followerRepository: FollowerRepository;

  constructor() {
    this.followerRepository = new FollowerRepository();
  }

  async userAuthorize({ page, email, password }) {
    try {
      await page.goto(INSTAGRAM_CONSTANTS.BASE_URL);
      await page.waitForSelector(TAG.FORM);
      console.log(`\x1b[32m%s\x1b[0m Tag ${TAG.FORM} successfully loaded`, 'SUCCESS :::');

      const inputUserName = await page.$(INSTAGRAM_CONSTANTS.USER_NAME_INPUT);
      await inputUserName.type(email);
      console.log(`\x1b[32m%s\x1b[0m User name ${email} successfully added`, 'SUCCESS :::');

      const inputUserPassword = await page.$(INSTAGRAM_CONSTANTS.USER_PASSWORD_INPUT);
      await inputUserPassword.type(password);
      console.log(`\x1b[32m%s\x1b[0m User password successfully added`, 'SUCCESS :::');

      const button = await page.$(INSTAGRAM_CONSTANTS.LOGIN_BUTTON);

      if (!button) {
        console.log('\x1b[31m%s\x1b[0m Login button not found!', 'ERROR :::');
        return;
      }

      await button.click();
      console.log(`\x1b[32m%s\x1b[0m Loged in successfully`, 'SUCCESS :::');

      await delay(getRandomNumber(10000, 15000));
      console.log(`\x1b[32m%s\x1b[0m Delay have passed`, 'SUCCESS :::');

      return true;
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m userAuthorize: ', 'ERROR :::', error);
      return false;
    }
  }

  async parseFollowers({ page, donorPage }) {
    const followers = [];

    try {
      await page.goto(`${INSTAGRAM_CONSTANTS.BASE_URL}${donorPage}`);
      console.log(`\x1b[32m%s\x1b[0m Navigate to ${donorPage} page`, 'SUCCESS :::');

      await page.waitForSelector(TAG.HEADER);
      console.log(`\x1b[32m%s\x1b[0m Tag ${TAG.HEADER} successfully loaded`, 'SUCCESS :::');

      const sections = await page.$$(TAG.SECTION);
      console.log(`\x1b[32m%s\x1b[0m Tags ${TAG.SECTION} successfully retrived`, 'SUCCESS :::');

      if (sections.length < 4) {
        console.log(`\x1b[31m%s\x1b[0m Not enough ${TAG.LIST_ITEM} elements in the ${TAG.LIST}!`, 'ERROR :::');
        return;
      }

      const thirdSection = sections[3];
      const topMenuList = await thirdSection.$(TAG.LIST);

      if (!topMenuList) {
        console.log(`\x1b[31m%s\x1b[0m Not found ${TAG.LIST} in the ${TAG.SECTION}!`, 'ERROR :::');
        return;
      }

      const listItems = await topMenuList.$$(TAG.LIST_ITEM);

      if (listItems.length < 2) {
        console.log(`\x1b[31m%s\x1b[0m Not enough ${TAG.LIST_ITEM} elements in the ${TAG.LIST}!`, 'ERROR :::');
        return;
      }

      await listItems[1].click();
      console.log(
        `\x1b[32m%s\x1b[0m Clicked the second ${TAG.LIST_ITEM} element in the ${TAG.LIST} of the third ${TAG.SECTION}`,
        'SUCCESS :::',
      );

      page.on('response', async (response) => {
        const request = response.request();
        const requestUrl = request.url();

        if (requestUrl.includes(INSTAGRAM_API.FOLLOWERS)) {
          try {
            const responseBody = await response.json();
            if (responseBody?.status !== 'ok') return;

            followers.push(...responseBody.users);
            console.log(`\x1b[32m%s\x1b[0m Total parsed followers: `, 'SUCCESS :::', followers.length);
          } catch (err) {
            console.log(`\x1b[31m%s\x1b[0m Failed to parse response body:`, 'ERROR :::');
          }
        }
      });

      await page.waitForSelector(INSTAGRAM_CONSTANTS.DIALOG_POPUP, { visible: true });
      console.log(
        `\x1b[32m%s\x1b[0m Tag ${INSTAGRAM_CONSTANTS.DIALOG_POPUP} successfully loaded`,
        'SUCCESS :::',
        followers.length,
      );

      await page.waitForSelector(INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

      let previousHeight;
      let newHeight;
      let noMoreNewElements = 0;

      while (noMoreNewElements < 5) {
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

        await delay(getRandomNumber(3000, 5000));

        newHeight = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.scrollHeight : 0;
        }, INSTAGRAM_CONSTANTS.FOLLOWERS_SCROLL_LAYER);

        if (newHeight === previousHeight) {
          noMoreNewElements++;
        } else {
          noMoreNewElements = 0;
        }

        console.log('Scrolling... Current height:', newHeight);
      }

      console.log(`\x1b[32m%s\x1b[0m Finished scrolling. Total followers collected: `, 'SUCCESS :::', followers.length);

      if (!needToCreateCsvFile) {
        return followers;
      } else {
        const csvData = convertToCSV(followers);

        const filePath = path.join(__dirname, 'followers.csv');
        fs.writeFileSync(filePath, csvData, 'utf8');

        console.log(`CSV file has been saved at ${filePath}`);

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
      console.log(`\x1b[31m%s\x1b[0m parseFollowers`, 'ERROR :::', error);
      return followers;
    }
  }

  async sendMessage({ message, recipient, page }) {
    try {
      await page.goto(`${INSTAGRAM_CONSTANTS.BASE_URL}${INSTAGRAM_API.DIRECT}`);
      console.log(`\x1b[32m%s\x1b[0m Navigate to '${INSTAGRAM_API.DIRECT}' page`, 'SUCCESS :::');

      await delay(getRandomNumber(3000, 5000));

      const turnOffNotificationButton = await page.$(INSTAGRAM_CONSTANTS.TURN_OFF_NOTIFICATION_BUTTON);

      if (turnOffNotificationButton) {
        await turnOffNotificationButton.click();
        console.log(`\x1b[32m%s\x1b[0m Notifications off`, 'SUCCESS :::');
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
        console.log(`\x1b[32m%s\x1b[0m Send message dialog opened`, 'SUCCESS :::');
      } else {
        console.log(`\x1b[31m%s\x1b[0m Send message dialog was not opened: `, 'ERROR :::');
      }

      await page.waitForSelector(INSTAGRAM_CONSTANTS.DIALOG_POPUP, { visible: true });
      await page.waitForSelector(INSTAGRAM_CONSTANTS.SEARCH_USER_INPUT);
      const searchUserInput = await page.$(INSTAGRAM_CONSTANTS.SEARCH_USER_INPUT);
      await searchUserInput.type(recipient);

      await delay(getRandomNumber(3000, 5000));

      await page.waitForSelector(INSTAGRAM_CONSTANTS.USER_CHECKBOX);
      await page.evaluate((userCheckboxSelector) => {
        const checkbox = document.querySelector(userCheckboxSelector) as HTMLInputElement;

        if (checkbox && !checkbox.checked) {
          checkbox.click();
        }
      }, INSTAGRAM_CONSTANTS.USER_CHECKBOX);

      const chatDialog = await page.$(INSTAGRAM_CONSTANTS.DIALOG_POPUP);

      if (!chatDialog) {
        console.log('\x1b[31m%s\x1b[0m Chat dialog not retrived!', 'ERROR :::');
        return;
      }

      await delay(1000);
      const chatButton = await chatDialog.$(INSTAGRAM_CONSTANTS.BUTTON);

      if (!chatButton) {
        console.log('\x1b[31m%s\x1b[0m Chat button not found!', 'ERROR :::');
        return;
      }

      const chatButtons = await chatDialog.$$(INSTAGRAM_CONSTANTS.BUTTON);

      if (!chatButtons.length) {
        console.log('\x1b[31m%s\x1b[0m No any buttons found!', 'ERROR :::');
        return;
      }

      let foundChatButton = null;

      for (const button of chatButtons) {
        const buttonText = await page.evaluate((el) => el.textContent.trim(), button);

        if (buttonText === 'Chat') {
          foundChatButton = button;
          break;
        }
      }

      if (!foundChatButton) {
        console.log('\x1b[31m%s\x1b[0m Chat button not found!', 'ERROR :::');
        return;
      }

      const isDisabled = await page.evaluate((el) => {
        return el.getAttribute('aria-disabled') === 'true';
      }, foundChatButton);

      if (!isDisabled) {
        await foundChatButton.click();
        console.log('\x1b[32m%s\x1b[0m Chat button clicked!', 'SUCCESS :::');
      } else {
        console.log('\x1b[31m%s\x1b[0m Chat button is disabled!', 'ERROR :::');
      }

      await page.waitForSelector(INSTAGRAM_CONSTANTS.TEXT_AREA, { visible: true });
      const textArea = await page.$(INSTAGRAM_CONSTANTS.TEXT_AREA);
      await textArea.type(message);
      console.log(`\x1b[32m%s\x1b[0m Message successfully added to the text area`, 'SUCCESS :::');
      await delay(getRandomNumber(700, 1000));

      const sendMessageInputContainer = await page.$(INSTAGRAM_CONSTANTS.SEND_MESSAGE_CONTAINER);

      if (sendMessageInputContainer) {
        const buttons = await sendMessageInputContainer.$$(INSTAGRAM_CONSTANTS.BUTTON);

        if (!buttons.length) {
          console.log('\x1b[31m%s\x1b[0m No buttons found in the message container!', 'ERROR :::');
          return;
        }

        let foundSendMessageButton = null;

        for (const button of buttons) {
          const buttonText = await page.evaluate((el) => el.textContent.trim(), button);

          if (buttonText === 'Send') {
            foundSendMessageButton = button;
            break;
          }
        }

        if (!foundSendMessageButton) {
          console.log('\x1b[31m%s\x1b[0m Send message button not found!', 'ERROR :::');
          return;
        }

        await foundSendMessageButton.click();
        console.log('\x1b[32m%s\x1b[0m Message sent successfully!', 'SUCCESS :::');

        return true;
      }

      return false;
    } catch (error) {
      console.log(`\x1b[31m%s\x1b[0m sendMessage: `, 'ERROR :::', error);

      return false;
    }
  }
}
