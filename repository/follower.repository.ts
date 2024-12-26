import { connect } from '../config/db.config';

import { IFollower, FollowerModel } from '../model/follower.model';

export class FollowerRepository {
  constructor() {
    connect();
  }

  async createFollower(follower): Promise<IFollower> {
    try {
      return await FollowerModel.create(follower);
    } catch (err) {
      console.log('\x1b[31m%s\x1b[0m Follower was not created: ', 'ERROR :::', err);
    }
  }

  async getFollower(follower): Promise<IFollower> {
    try {
      return await FollowerModel.findOne(follower);
    } catch (err) {
      console.log('\x1b[31m%s\x1b[0m Follower was not retrived: ', 'ERROR :::', err);
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
      console.log('\x1b[31m%s\x1b[0m Followers was not retrived: ', 'ERROR :::', err);
    }
  }

  async updateFollower(follower, update): Promise<IFollower> {
    let data: null | IFollower = null;

    try {
      data = await FollowerModel.findOneAndUpdate(follower, update, { new: true });
    } catch (err) {
      console.log('\x1b[31m%s\x1b[0m Follower was not updated: ', 'ERROR :::', err);
    }

    return data;
  }
}
