import Mongoose = require('mongoose');
require('dotenv').config();

let database: Mongoose.Connection;

export const connect = () => {
  const url = process.env.MONGO_CONNECTION_STRING;

  if (database) {
    return;
  }

  Mongoose.connect(url, {});

  database = Mongoose.connection;

  database.once('open', async () => {
    console.log(`\x1b[32m%s\x1b[0m Connected to DB: ${process.env.MONGO_CONNECTION_STRING}`, 'SUCCESS :::');
  });

  database.on('error', () => {
    console.log('\x1b[31m%s\x1b[0m Error connecting to database!', 'ERROR :::');
  });
};

export const disconnect = () => {
  if (!database) {
    return;
  }

  Mongoose.disconnect();

  database.once('close', async () => {
    console.log(`\x1b[32m%s\x1b[0m Diconnected  to database`, 'SUCCESS :::');
  });
};
