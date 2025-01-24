import Mongoose = require('mongoose');
require('dotenv').config();

import { logger, LoggerType } from '../utils/logger';

let database: Mongoose.Connection;

export const connect = () => {
  const url = process.env.MONGO_CONNECTION_STRING;

  if (database) {
    return;
  }

  Mongoose.connect(url, {});

  database = Mongoose.connection;

  database.once('open', async () => {
    logger({ type: LoggerType.Info, message: `Connected to DB: ${process.env.MONGO_CONNECTION_STRING}` });
  });

  database.on('error', () => {
    logger({ type: LoggerType.Error, message: 'Error connecting to database!' });
  });
};

export const disconnect = () => {
  if (!database) {
    return;
  }

  Mongoose.disconnect();

  database.once('close', async () => {
    logger({ type: LoggerType.Info, message: 'Diconnected  to database' });
  });
};
