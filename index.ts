import * as http from 'http';
import App from './app';

require('dotenv').config();

import { logger, LoggerType } from './utils/logger';

const port = process.env.PORT || 3080;

App.set('port', port);
const server = http.createServer(App);
server.listen(port);

server.on('listening', async function () {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  logger({ type: LoggerType.Info, message: `Listening on ${bind}` });
});

module.exports = App;
