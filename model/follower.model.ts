import { model, Schema, Model, Document } from 'mongoose';

export enum Segment {
  SomeSegment = 'someSegment',
}

export interface IFollower extends Document {
  instagramId: string;
  fullName: string;
  isPrivate: boolean;
  nickName: string;
  segment: Segment;
  isMessageSent: boolean;
}

const FollowerSchema: Schema = new Schema(
  {
    instagramId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      required: true,
    },
    nickName: {
      type: String,
      required: true,
    },
    segment: {
      type: String,
      enum: Segment,
    },
    isMessageSent: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

export const FollowerModel: Model<IFollower> = model<IFollower>('Follower', FollowerSchema);
