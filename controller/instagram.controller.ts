import { Request, Response, NextFunction } from 'express';

import { InstagramService } from '../service/instagram.service';
import { FollowerService } from '../service/follower.service';
import { PuppeteerService } from '../service/puppeteer.service';

import { Segment } from '../model/follower.model';

import { handleResponse } from '../utils/handleResponse';
import { getRandomNumber } from '../utils/getRandomNumber';

export class InstagramController {
  private instagramService: InstagramService;
  private followerService: FollowerService;
  private puppeteerService: PuppeteerService;

  constructor() {
    this.instagramService = new InstagramService();
    this.followerService = new FollowerService();
    this.puppeteerService = new PuppeteerService();
  }

  async parseFollowers(req: Request, res: Response, next: NextFunction) {
    const { email, password, donorPage } = req.body;

    try {
      const browserInstance = await this.puppeteerService.launchBrowser();

      if (!browserInstance) {
        return handleResponse(res, 400, 'ERROR ::: Browser was not launched!');
      }
      console.log('\x1b[32m%s\x1b[0m Browser launched successfully!', 'SUCCESS :::');

      const page = await this.puppeteerService.createPage(browserInstance);

      if (!page) {
        return handleResponse(res, 400, 'ERROR ::: Page was not created!');
      }

      const isSuccess = await this.instagramService.userAuthorize({ page, email, password });

      if (!isSuccess) {
        return handleResponse(res, 400, 'ERROR ::: Authorize failed!');
      }

      handleResponse(res, 200, 'Parsing was started successfully');

      const followers = await this.instagramService.parseFollowers({ page, donorPage });
      // await this.instagramService.closeBrowser(browserInstance);

      const failedFollowers = [];

      for (let i = 0; i < followers.length; i++) {
        const { id, full_name, is_private, username } = followers[i];
        const hasNickName = !!username;
        const hasFullName = !!full_name;

        try {
          const follower = await this.followerService.getFollower({ instagramId: String(id) });

          if (!follower && hasNickName && hasFullName) {
            await this.followerService.createFollower({
              instagramId: id,
              fullName: full_name,
              isPrivate: is_private === 'TRUE',
              nickName: username,
              segment: Segment.Cosmetology,
              isMessageSent: false,
            });
          }
        } catch (err) {
          console.log('\x1b[31m%s\x1b[0m Error inserting follower: ', 'ERROR :::', err);

          failedFollowers.push({
            id,
            fullName: full_name,
            isPrivate: is_private === 'TRUE',
            nickName: username,
          });
        }
      }

      console.log(`\x1b[32m%s\x1b[0m ${followers.length} followers was saved!`, 'SUCCESS :::');
    } catch (error) {
      return next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    const { email, password, message } = req.body;

    try {
      const browserInstance = await this.puppeteerService.launchBrowser();

      if (!browserInstance) {
        return handleResponse(res, 400, 'ERROR ::: Browser was not launched!');
      }
      console.log('\x1b[32m%s\x1b[0m Browser launched successfully!', 'SUCCESS :::');

      const page = await this.puppeteerService.createPage(browserInstance);

      if (!page) {
        return handleResponse(res, 400, 'ERROR ::: Page was not created!');
      }

      const isSuccess = await this.instagramService.userAuthorize({ page, email, password });

      if (!isSuccess) {
        return handleResponse(res, 400, 'ERROR ::: Authorize failed!');
      }

      const followers = await this.followerService.getFollowers(
        { segment: Segment.Cosmetology, isMessageSent: false },
        getRandomNumber(50, 100),
      );

      handleResponse(res, 200, 'Mailing started successfully!', followers);

      // test bigger timaout
      page.setDefaultTimeout(90000);
      for (const { _id, nickName } of followers) {
        await this.instagramService.sendMessage({ message, recipient: nickName, page });

        await this.followerService.updateFollower({ _id }, { isMessageSent: true });
      }

      // await this.instagramService.closeBrowser(browserInstance);
    } catch (error) {
      return next(error);
    }
  }
}
