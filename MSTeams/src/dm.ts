import { getData, setData } from './dataStore';
import {
  error, dmCreateSuccess, dmDetailsSuccess, dmListSuccess,
  dmMessagesSuccess, dm, dmInfo, userInfo, user, store,
  message, session, react, notificationInfo
} from './types';
import { isValidToken, getUId, userObject } from './helpers';
import HTTPError from 'http-errors';
/**
* dmCreate generates a new direct message for the sender and the recipients to view.
* It also adds a new userInfo type to the array of userInfo objects in the datastore.
*
* @param { string } token -number identifying that the current user is valid
* @param { number[] } uIds -array of the users that are attatched to the message
*
* @return { dmId }  -returns the dmId of the created dm

*/
export function dmCreateV2(token: string, uIds: number[]): dmCreateSuccess | error {
  const ds: store = getData();

  // region errors

  for (const item of uIds) {
    if (ds.users.find(x => x.uId === item) === undefined) {
      throw HTTPError(400, 'At least one of the uIds is invalid');
    }
  }

  if ((new Set(uIds)).size !== uIds.length) {
    throw HTTPError(400, 'One of the recipients of the dm was repeated');
  }

  // region errors

  const id: number = ds.dms.length;

  const ownerUId: number = getUId(token);

  const userInviting: userInfo = ds.users.find((x) => x.uId === ownerUId);

  const uIdsArray: number[] = [ownerUId, [uIds]].flat(2);

  const namesArray: string[] = [];

  for (const item of uIdsArray) {
    const userItem: userInfo = ds.users.find(x => x.uId === item);

    namesArray.push(userItem.handleStr);
  }

  let nameStr = '';
  for (const item of namesArray.sort()) {
    if (item === namesArray[0]) {
      nameStr += item;
    } else {
      nameStr += `, ${item}`;
    }
  }

  const dmInfo: dmInfo = {
    dmId: id,
    name: nameStr,
    ownerId: ownerUId,
    memberIds: uIdsArray,
  };

  ds.dms.push(dmInfo);

  for (const item of uIds) {
    const newNotification: notificationInfo = {
      uId: item,
      channelId: -1,
      dmId: id,
      notificationMessage: userInviting.handleStr + ' added you to ' + nameStr,
    };

    ds.notifications.push(newNotification);
  }

  setData(ds);

  return { dmId: id };
}

/**
 * Provides a set of objects containing details about the channel,
 * given the channel ID and the user authentication ID.
 *
 * @param {string} token - Number identifier that is unique to each user
 * @param {integer} dmId - Number identifier unique to each dm
 *
 * @returns {set of objects} returns information about the channel
 */
export function dmDetailsV2(
  token: string,
  dmId: number
): dmDetailsSuccess | error {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  // find user in the datastore from token parameter
  const userId: number = getUId(token);

  // find dm in datastore
  const dm: dmInfo = ds.dms.find(
    (x) => x.dmId === dmId
  );

  // #region errors
  if (dm === undefined) {
    throw HTTPError(400, 'dm is invalid');
  }

  if (dm.memberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'User is not a member of the dm');
  }
  // #region errors

  const allMembers: user[] = dm.memberIds.map(x => userObject(x));

  return {
    name: dm.name,
    members: allMembers,
  };
}

/**
 * dmList returns the list of Dm's that the user is member of
 *
 * @param { string } token -string of numbers identifying the user's session
 *
 * @return { dms } -returns the list of dmInfo objects
 *
 */
export function dmListV2(token: string): dmListSuccess | error {
  const ds = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const userId: number = getUId(token);

  const dms: dm[] = [];
  for (const dm of ds.dms) {
    if (dm.memberIds.includes(userId)) {
      dms.push({ dmId: dm.dmId, name: dm.name });
    }
  }

  return { dms: dms };
}

/**
 * dmLeave removes the user from a dm given by it's dmId
 * It also returns basic details about the dm that was left
 *
 * @param { string } token
 * @param { dmId } dmId
 *
 * @return {  } -nothing is returned
 */
export function dmLeaveV2(token: string, dmId: number): object | error {
  const ds = getData();
  // region errors
  // token is invalid
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const dm: dmInfo = ds.dms.find(x => x.dmId === dmId);

  if (dm === undefined) {
    throw HTTPError(400, 'Dm is invalid');
  }

  if (!dm.memberIds.includes(getUId(token))) {
    throw HTTPError(403, 'User is not a member of the dm');
  }

  const index: number = dm.memberIds.indexOf(getUId(token));
  ds.dms.find(x => x.dmId === dmId).memberIds.splice(index, 1);

  setData(ds);

  return {};
}

/**
 * Given a channel that the authorised user is a member of, returns
 * up to 50 messages between index "start" and "start + 50".
 *
 * @param {string} token - unique handle that is generated for each user
 * @param {integer} dmId - unique handle that is generated for each dm
 * @param {integer} start - starting index of messages to return
 *
 * @returns {array of objects}  - messages between the index "start" and "start + 50"
 * @returns {integer} - the starting index of the returned messages
 * @returns {integer} - the ending index of the returned messages
 */
export function dmMessagesV2(
  token: string,
  dmId: number,
  start: number
): dmMessagesSuccess | error {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const userSession = ds.sessions.find(x => x.token === token) as session;

  const dm: dmInfo = ds.dms.find(
    (x) => x.dmId === dmId
  );

  if (dm === undefined) {
    throw HTTPError(400, 'dm is invalid');
  }

  const msgs: message[] = [];

  for (const item of ds.messages) {
    if (item.dmId === dmId) {
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
    throw HTTPError(400, 'Start is greater than dm Message length');
  }

  if (dm.memberIds.find((x) => x === userSession.authUserId) === undefined) {
    throw HTTPError(403, 'User not a member of the dm');
  }

  const splicedMsgs: message[] = msgs.slice(start, start + 50).reverse();

  let end: number = start + 50;

  if (end > msgs.length) {
    end = -1;
  }

  return { messages: splicedMsgs, start: start, end: end };
}

/**
 * dmRemove deletes a dm so that it is removed from dataStore
 * and the members are no longer a member of the dm.
 * This can only be done by the dm owner.
 *
 * @param { string } token -number identifying the user's session
 * @param { dmId } dmId -object containing the number id of the dm
 *
 * @return { } - no return
 */
export function dmRemoveV2(token: string, dmId: number): object | error {
  const ds = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const dm: dmInfo = ds.dms.find(x => x.dmId === dmId);

  if (dm === undefined) {
    throw HTTPError(400, 'dm is invalid');
  }

  if (dm.memberIds.find(x => x === getUId(token)) === undefined) {
    throw HTTPError(403, 'User is not a member of the dm');
  }

  if (getUId(token) !== dm.ownerId) {
    throw HTTPError(403, 'Only the creator of the dm can delete a dm');
  }

  const index: number = ds.dms.indexOf(dm);
  ds.dms.splice(index, 1);

  return {};
}

