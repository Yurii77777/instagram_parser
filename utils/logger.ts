export enum LoggerType {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
  Debug = 'debug',
}

type LoggerArgs = {
  type: LoggerType;
  message: string;
  meta?: any;
};

const Colors = {
  Reset: '\x1b[0m',
  Green: '\x1b[32m',
  Red: '\x1b[31m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  White: '\x1b[37m',
  Gray: '\x1b[90m',
};

const colorize = (color: string, text: string) => `${color}${text}${Colors.Reset}`;

export const logger = ({ type, message, meta }: LoggerArgs) => {
  const timestamp = new Date().toISOString();

  const formatMessage = (color: string, prefix: string) => {
    const logLine = `${colorize(color, `[${timestamp}] ${prefix}`)}: ${message}`;
    console.log(logLine);

    if (meta) {
      console.log(colorize(Colors.Gray, 'Metadata:'), meta);
    }
  };

  switch (type) {
    case LoggerType.Info:
      formatMessage(Colors.Green, 'INFO');
      break;
    case LoggerType.Error:
      formatMessage(Colors.Red, 'ERROR');
      break;
    case LoggerType.Warning:
      formatMessage(Colors.Yellow, 'WARNING');
      break;
    case LoggerType.Debug:
      formatMessage(Colors.Blue, 'DEBUG');
      break;
    default:
      formatMessage(Colors.White, 'LOG');
  }
};
