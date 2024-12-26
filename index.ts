import * as http from 'http';
import App from './app';

require('dotenv').config();

const port = process.env.PORT || 3080;

App.set('port', port);
const server = http.createServer(App);
server.listen(port);

server.on('listening', async function () {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  console.log(`\x1b[32m%s\x1b[0m Listening on ${bind}`, 'SUCCESS :::');
});

module.exports = App;
