import { getData } from './dataStore';
import {
  store,
  notificationGetSuccess,
} from './types';
import { isValidToken, getUId } from './helpers';
import HTTPError from 'http-errors';

/**
 * Returns the user's most recent 20 notifications, ordered from most recent to
 * least recent.
 *
 * @param {string} token - unique handle that is generated for each user
 *
 * @returns { notifications } - most recent 20 notifications
 *
 */
export function notificationsGetV1(token: string) {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const uId = getUId(token);

  let userNotifications: notificationGetSuccess[] = [];

  for (const item of ds.notifications) {
    if (item.uId === uId) {
      userNotifications.push({
        channelId: item.channelId,
        dmId: item.dmId,
        notificationMessage: item.notificationMessage,
      });
    }
  }

  userNotifications = userNotifications.reverse();

  const slicedNotifications: notificationGetSuccess[] = userNotifications.slice(0, 20);

  return { notifications: slicedNotifications };
}
