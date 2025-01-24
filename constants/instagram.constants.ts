export const INSTAGRAM_CONSTANTS = {
  BASE_URL: 'https://www.instagram.com/',
  USER_NAME_INPUT: 'input[name="username"]',
  USER_PASSWORD_INPUT: 'input[name="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  DIALOG_POPUP: 'div[role="dialog"]',
  FOLLOWERS_SCROLL_LAYER: 'div.xyi19xy.x1ccrb07.xtf3nb5.x1pc53ja.x1lliihq.x1iyjqo2.xs83m0k.xz65tgg.x1rife3k.x1n2onr6',
  TURN_OFF_NOTIFICATION_BUTTON: 'button._a9--._ap36._a9_1',
  BUTTON: 'div[role="button"]',
  SEARCH_USER_INPUT: 'input[name="queryBox"]',
  USER_CHECKBOX: 'input[name="ContactSearchResultCheckbox"]',
  TEXT_AREA: 'div[role="textbox"]',
  SEND_MESSAGE_CONTAINER: 'div.x6s0dn4.x78zum5.x1gg8mnh.x1pi30zi.xlu9dua',
};

export const INSTAGRAM_API = {
  FOLLOWERS: '/api/v1/friendships',
  DIRECT: 'direct/inbox',
};

export const MIN_DEFAULT_DELAY = 1000;
export const MIN_DELAY_MILLISECONDS_AUTH = 10000;
export const MAX_DELAY_MILLISECONDS_AUTH = 15000;
export const MIN_DELAY_MILLISECONDS_SCROLL_FOLLOWERS = 3000;
export const MAX_DELAY_MILLISECONDS_SCROLL_FOLLOWERS = 5000;
export const NUMBER_OF_ELEMENTS_SECTION = 4;
export const NEEDED_SECTION_ITEM_INDEX = 3;
export const NUMBER_OF_ELEMENTS_LIST = 2;
export const NEEDED_LIST_ITEM_INDEX = 1;
export const MAX_ATTEMPTS_TO_SCROLL_FOLLOWERS_DIALOG = 5;
export const CHAT_BUTTON_TITLE = 'Chat';
export const SEND_MESSAGE_BUTTON_TITLE = 'Send';
