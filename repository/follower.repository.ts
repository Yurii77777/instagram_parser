import { connect } from '../config/db.config';

import { IFollower, FollowerModel } from '../model/follower.model';
import { logger, LoggerType } from '../utils/logger';

export class FollowerRepository {
  constructor() {
    connect();
  }

  async createFollower(follower): Promise<IFollower> {
    try {
      return await FollowerModel.create(follower);
    } catch (err) {
      logger({ type: LoggerType.Error, message: 'Follower was not created', meta: err });
    }
  }

  async getFollower(follower): Promise<IFollower> {
    try {
      return await FollowerModel.findOne(follower);
    } catch (err) {
      logger({ type: LoggerType.Error, message: 'Follower was not retrived', meta: err });
    }
  }

  async getFollowers(follower, limit?: number): Promise<null | IFollower[]> {
    let data: null | IFollower[] = null;

    try {
      const query = FollowerModel.find(follower).sort({ createdAt: -1 });

      if (limit) {
        query.limit(limit);
      }

      const result = await query;
      if (result.length) {
        data = result;
      }

      return data;
    } catch (err) {
      logger({ type: LoggerType.Error, message: 'Followers was not retrived', meta: err });
    }
  }

  async updateFollower(follower, update): Promise<IFollower> {
    let data: null | IFollower = null;

    try {
      data = await FollowerModel.findOneAndUpdate(follower, update, { new: true });
    } catch (err) {
      logger({ type: LoggerType.Error, message: 'Follower was not updated', meta: err });
    }

    return data;
  }
}
