import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dateFormat = (utcTimestamp: string): string => {
  return dayjs.utc(utcTimestamp).local().format('DD-MMM-YYYY');
};
