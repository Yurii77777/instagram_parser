# Instagram followers parser

An example of interaction with a tool called Puppeteer.
site: https://pptr.dev/

## env

- `PORT` = 3080;
- `MONGO_CONNECTION_STRING` = mongoDB connetion string;

## how to start

- set envs;
- `yarn` or `npm i`;
- `yarn dev` or `npm run dev`;
- call needed API endpoint;

## Tech Stack

- **Puppeteer:** [Puppeteer](https://pptr.dev/)
- **Express (TypeScript):** [ExpressJS](https://expressjs.com/)

### API examples

POST: `http://localhost:3080/api/parse-followers`

BODY: {
"email": "your_account_login",
"password": "your_account_password",
"donorPage": "donor_page_login"
}

App can save all parsed followers in the DB and create CSV file.

POST: `http://localhost:3080/api/send-message`

BODY: {
"email": "your_account_login",
"password": "your_account_password",
"message": "message to send"
}

### Watch Video

[![Electron + React = Winamp](https://img.youtube.com/vi/xZOLpeia-04/0.jpg)](https://youtu.be/xZOLpeia-04)

### Support author here 👇😉

![Winamp Preview](./assets/img//IMG_2260.JPG)
