import { FollowerRepository } from '../repository/follower.repository';

import { IFollower } from '../model/follower.model';

export class FollowerService {
  private followerRepository: FollowerRepository;

  constructor() {
    this.followerRepository = new FollowerRepository();
  }

  async createFollower(follower): Promise<IFollower> {
    return await this.followerRepository.createFollower(follower);
  }

  async getFollower(follower): Promise<IFollower> {
    return await this.followerRepository.getFollower(follower);
  }

  async getFollowers(follower, limit?: number): Promise<null | IFollower[]> {
    return await this.followerRepository.getFollowers(follower, limit);
  }

  async updateFollower(follower, update): Promise<IFollower> {
    return await this.followerRepository.updateFollower(follower, update);
  }
}
