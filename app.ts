import express = require('express');
import bodyParser = require('body-parser');

import { InstagramController } from './controller/instagram.controller';

import { parseFollowersMiddleware } from './middlewares/parseFollowers.middleware';
import { handleValidate } from './middlewares/handleValidate';
import { handleResponse } from './utils/handleResponse';

class App {
  public express: express.Application;
  public instagramController: InstagramController;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.instagramController = new InstagramController();
  }

  private middleware(): void {
    this.express.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
      }
      next();
    });
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    // For health check
    this.express.get('/healthcheck', (req, res, next) => {
      res.send('Ok!');
    });

    this.express.post('/api/parse-followers', parseFollowersMiddleware, handleValidate, (req, res, next) => {
      this.instagramController.parseFollowers(req, res, next);
    });

    this.express.post('/api/send-message', (req, res, next) => {
      this.instagramController.sendMessage(req, res, next);
    });

    // global error handler
    this.express.use((error, req, res, next) => {
      return handleResponse(res, 500, error.statusMessage, undefined, error);
    });

    // handle undefined routes
    this.express.use('*', (req, res, next) => {
      res.status(404).send('API endpoint not found');
    });
  }
}

export default new App().express;
