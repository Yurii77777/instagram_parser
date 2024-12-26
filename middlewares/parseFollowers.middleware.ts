import { body } from 'express-validator';

export const parseFollowersMiddleware = [
  body(['email', 'password', 'donorPage'])
    .not()
    .isEmpty()
    .withMessage('Can not be empty')
    .isString()
    .withMessage('Should be a string'),
];
