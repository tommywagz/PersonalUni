import { getData, setData } from './dataStore';
import {
  channelDetailsSuccess, error, user, channelInfo, store, session, userInfo,
  channelMessagesSuccess, message, notificationInfo, react
} from './types';
import { isValidToken, getUId, userObject, isGlobalOwner } from './helpers';
import HTTPError from 'http-errors';

/**
 * Provides a set of objects containing details about the channel,
 * given the channel ID and the user authentication ID.
 *
 * @param {string} token - Number identifier that is unique to each user
 * @param {integer} channelId - Number identifier unique to each channel
 *
 * @returns {set of objects} returns information about the channel
 */
export function channelDetailsV3(
  token: string,
  channelId: number
): channelDetailsSuccess | error {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // find user in the datastore from token parameter
  const userId: number = getUId(token);

  // find channel in datastore
  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );

  // #region errors
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  if (channel.allMemberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'User not in channel');
  }
  // #region errors

  const allMembers: user[] = channel.allMemberIds.map(x => userObject(x));
  const ownerMembers: user[] = channel.ownerMemberIds.map(x => userObject(x));

  return {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  };
}

/**
 * Invites a user with ID uId to join a channel with ID channelId
 *

 * @param {string} token - authentication of user making the function call
 * @param {integer} channelId - unique identifier for a channel
 * @param {integer} uId - unique identifier for a user
 *
 * @returns { } - returns null if no error
 */
export function channelInviteV3(
  token: string,
  channelId: number,
  uId: number
): error | object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // user to be invited
  const user: userInfo = ds.users.find((x) => x.uId === uId);

  // find user in the datastore from token parameter
  const userId: number = getUId(token);

  const userInviting: userInfo = ds.users.find((x) => x.uId === userId);

  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );

  // #region Errors
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  if (user === undefined) {
    throw HTTPError(400, 'Invalid user');
  }

  if (channel.allMemberIds.find((x) => x === uId) !== undefined) {
    throw HTTPError(400, 'User already in channel');
  }

  if (channel.allMemberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'auth user not member of channel');
  }
  // #endregion

  ds.channels
    .find((x) => x.channelId === channelId)
    .allMemberIds.push(uId);

  const newNotification: notificationInfo = {
    uId: uId,
    channelId: channelId,
    dmId: -1,
    notificationMessage: userInviting.handleStr + ' added you to ' + channel.name,
  };

  ds.notifications.push(newNotification);

  setData(ds);

  return {};
}

/**
 * Adds a user to a channel
 *
 * @param {string} token - user ID of the user making the function call
 * @param {integer} channelId - channel ID of a channel that the authorised user can join
 * ...
 * @returns {} if no error
 */
export function channelJoinV3(
  token: string,
  channelId: number
): error | object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // find user in the datastore from token parameter
  const userId: number = getUId(token);

  // find channel in datastore
  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );

  // #region Errors
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  if (channel.allMemberIds.find((x) => x === userId) !== undefined) {
    throw HTTPError(400, 'User already in channel');
  }

  if (isGlobalOwner(userId)) {
    ds.channels.find((x) => x.channelId === channelId).allMemberIds.push(userId);

    setData(ds);

    return {};
  }

  if (!channel.isPublic && channel.allMemberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'channel is private and user is not currently a member or global owner');
  }
  // #endregion

  ds.channels
    .find((x) => x.channelId === channelId)
    .allMemberIds.push(userId);

  setData(ds);

  return {};
}

/**
 * Allows a user with token to leave a channel with ID channelId
 *
 * @param {string} token - authentication of the user making the function call
 * @param {integer} channelId - unique identifier for a channel
 *
 * @returns { } - returns null if no error
 */
export function channelLeaveV2(
  token: string,
  channelId: number
): error | object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // find user in the datastore from token parameter
  const userId: session = ds.sessions.find((x) => x.token === token);

  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  // #region Errors
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  if (channel.allMemberIds.find((x) => x === userId.authUserId) === undefined) {
    throw HTTPError(403, 'authUser is not a channel member');
  }

  // add error: standup

  // #endregion

  for (let i = 0; i < channel.allMemberIds.length; i++) {
    if (channel.allMemberIds[i] === userId.authUserId) {
      channel.allMemberIds.splice(i, 1);
      break;
    }
  }

  for (let i = 0; i < channel.ownerMemberIds.length; i++) {
    if (channel.ownerMemberIds[i] === userId.authUserId) {
      channel.ownerMemberIds.splice(i, 1);
      break;
    }
  }

  setData(ds);

  return {};
}

/**
 * remove user with user id uId as a channel owner
 *
 * @param {string} token - authentication of the user making the function call
 * @param {integer} channelId - unique identifier for a channel
 * @param {integer} uId - unique identifier for a user
 *
 * @returns { } - returns null if no error
 */
export function channelRemoveOwnerV2(
  token: string,
  channelId: number,
  uId: number
): error | object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );
    // find user in the datastore from token parameter
  const userId: number = getUId(token);

  // #region Errors
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel');
  }

  const user: userInfo = ds.users.find(x => x.uId === uId);

  if (user === undefined) {
    throw HTTPError(400, 'Invalid user');
  }

  if (channel.ownerMemberIds.find((x) => x === userId) === undefined && ds.users.find(x => x.uId === userId).permissionId !== 1) {
    throw HTTPError(403, 'requesting user doesnt have owner permissions in channel and is not a global owner');
  }

  if (channel.ownerMemberIds.find((x) => x === uId) === undefined) {
    throw HTTPError(400, 'User not owner of channel');
  }

  if (channel.ownerMemberIds.find((x) => x === uId) !== undefined &&
        channel.ownerMemberIds.length === 1) {
    throw HTTPError(400, 'user is only owner of channel');
  }

  if (channel.allMemberIds.find(x => x === userId) === undefined) {
    throw HTTPError(400, 'User not in channel');
  }

  // #endregion

  for (let i = 0; i < channel.ownerMemberIds.length; i++) {
    if (channel.ownerMemberIds[i] === uId) {
      channel.ownerMemberIds.splice(i, 1);
      break;
    }
  }

  setData(ds);

  return {};
}

/**
 * Make user with user id uId an owner of the channel
 *
 * @param {string} token - authentication of the user making the function call
 * @param {integer} channelId - unique identifier for a channel
 * @param {integer} uId - unique identifier for a user
 *
 * @returns { } - returns null if no error
 */
export function channelAddOwnerV2(
  token: string,
  channelId: number,
  uId: number
): error | object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const user: userInfo = ds.users.find((x) => x.uId === uId);

  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );
    // find user in the datastore from token parameter
  const userId: number = getUId(token);

  // #region Errors
  if (channel === undefined) {
    throw HTTPError(400, 'invalid channel');
  }

  if (user === undefined) {
    throw HTTPError(400, 'invalid user');
  }

  if (channel.allMemberIds.find((x) => x === uId) === undefined) {
    throw HTTPError(400, 'User not in channel');
  }

  if (channel.ownerMemberIds.find((x) => x === uId) !== undefined) {
    throw HTTPError(400, 'User already owner in channel');
  }

  if (channel.allMemberIds.find(x => x === userId) === undefined) {
    throw HTTPError(400, 'User not in channel');
  }

  if (channel.ownerMemberIds.find((x) => x === userId) === undefined && ds.users.find(x => x.uId === userId).permissionId !== 1) {
    throw HTTPError(403, 'User does not have owner permissions in channel');
  }

  ds.channels
    .find((x) => x.channelId === channelId)
    .ownerMemberIds.push(uId);

  setData(ds);

  return {};
}

/**
 * Given a channel that the authorised user is a member of, returns
 * up to 50 messages between index "start" and "start + 50".
 *
 * @param {string} token - unique handle that is generated for each user
 * @param {integer} channelId - unique handle that is generated for each channel
 * @param {integer} start - starting index of messages to return
 *
 * @returns {array of objects}  - messages between the index "start" and "start + 50"
 * @returns {integer} - the starting index of the returned messages
 * @returns {integer} - the ending index of the returned messages
 */
export function channelMessagesV3(
  token: string,
  channelId: number,
  start: number
): channelMessagesSuccess | error {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const userSession = ds.sessions.find(x => x.token === token) as session;

  const channel: channelInfo = ds.channels.find(
    (x) => x.channelId === channelId
  );

  if (channel === undefined) {
    throw HTTPError(400, 'invalid channel');
  }

  const msgs: message[] = [];

  // item is a message of type messageinfo
  for (const item of ds.messages) {
    if (item.channelId === channelId) {
      const reacts: react[] = [];

      for (const react of ds.reacts) {
        if (react.messageId === item.messageId) {
          let isThisUserReacted = false;

          if (react.uIds.find((x) => x === getUId(token))) {
            isThisUserReacted = true;
          }

          reacts.push({
            reactId: react.reactId,
            uIds: react.uIds,
            isThisUserReacted: isThisUserReacted
          });
        }
      }

      msgs.push({
        // NOTE: needs helper fn
        messageId: item.messageId,
        uId: item.uId,
        message: item.message,
        timeSent: item.timeSent,
        reacts: reacts,
        isPinned: item.isPinned
      });
    }
  }

  if (start > msgs.length || start < 0) {
    throw HTTPError(400, 'start out of bounds');
  }

  if (channel.allMemberIds.find((x) => x === userSession.authUserId) === undefined) {
    throw HTTPError(403, 'User not in channel');
  }

  const splicedMsgs: message[] = msgs.slice(start, start + 50).reverse();

  let end: number = start + 50;

  if (end > msgs.length) {
    end = -1;
  }

  return { messages: splicedMsgs, start: start, end: end };
}

