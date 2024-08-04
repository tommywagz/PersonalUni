// standup
import { getData, setData } from './dataStore';
import {
  store,
  channelInfo,
  standupMessageInfo,
} from './types';
import { isValidToken, getUId, getStandupMessage, userObject } from './helpers';
import { messageSendV2 } from './message';
import HTTPError from 'http-errors';

function sIsActive(channelId: number): boolean {
  const channel = getData().channels.find(x => x.channelId === channelId);

  if (channel.sIsActive === true) {
    return true;
  }

  return false;
}

/**
* For a given channel, starts a standup period lasting length seconds.
*
* @param { string } token -number identifying that the current user is valid
* @param { number } channelId -channelId of the channel that the user sends a message to
* @param { number } length -length of time in seconds of standup
*
* @return { timeFinish }  -returns timestamp of when standup will finish
*/

export function standupStartV1(token: string, channelId: number, length: number): object {
  const ds: store = getData();

  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const userId: number = getUId(token);

  // #region errors
  if (length < 0) {
    throw HTTPError(400, 'length cannot be negative');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'channel not found');
  }

  if ((channel.allMemberIds.find((x) => x === userId)) === undefined) {
    throw HTTPError(403, 'user not in channel');
  }

  if (sIsActive(channelId)) {
    throw HTTPError(400, 'standup already active');
  }
  // #region errors

  const timeFinish: number = Math.floor(Date.now() / 1000) + length;

  ds.channels.find(x => x.channelId === channelId).sIsActive = true;
  ds.channels.find(x => x.channelId === channelId).sLength = length;
  ds.channels.find(x => x.channelId === channelId).sMessages = [];
  ds.channels.find(x => x.channelId === channelId).sFinish = timeFinish;

  setData(ds);

  setTimeout(() => {
    if (getStandupMessage(channelId) !== '') {
      messageSendV2(token, channelId, getStandupMessage(channelId));
    }

    ds.channels.find(x => x.channelId === channelId).sIsActive = false;
    ds.channels.find(x => x.channelId === channelId).sLength = 0;
    ds.channels.find(x => x.channelId === channelId).sFinish = 0;
  }, length * 1000);

  return { timeFinish: timeFinish };
}

/**
 * For a given channel, returns whether a standup is active in it, and what
 * time the standup finishes. If no standup is active, then timeFinish should
 * be null.
 *
 * @param { string } token - the token of the user who is starting the standup
 * @param { number } channel_id - the channel that the standup is being checked for
 *
 * @returns { boolean, number } { isActive, timeFinish } - returns if the
 * standup is active and the time it will finish
 * @returns an error if channelId is invalid or if it is valid and the
 * authorised user is not a member of the channel
 *
 */
export function standupActiveV1(token: string, channelId: number) {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel ID');
  }

  const userId: number = getUId(token);

  if (channel.allMemberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (channel.sIsActive === true) {
    return { isActive: true, timeFinish: channel.sFinish };
  }

  return { isActive: false, timeFinish: null };
}

/**
 * For a given channel, returns whether a standup is active in it, and what
 * time the standup finishes. If no standup is active, then timeFinish should
 * be null.
 *
 * @param { string } token - the token of the user who is starting the standup
 * @param { number } channelId - the channel that the standup is being checked for
 * @param { string } message - message sent by user to get buffered in the standup queue
 *
 * @returns {}
 *
 */

export function standupSendV1(token: string, channelId: number, message: string): object {
  const ds = getData();
  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'Invalid token');
  }

  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channel ID');
  }

  const userId: number = getUId(token);

  if (channel.allMemberIds.find((x) => x === userId) === undefined) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long');
  }

  if (sIsActive(channelId) === false) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  }

  const handleStr: string = userObject(userId).handleStr;

  const standupMessageInfo: standupMessageInfo = {
    handleStr: handleStr,
    message: message,
  };

  ds.channels.find(x => x.channelId === channelId).sMessages.push(standupMessageInfo);

  setData(ds);

  return {};
}
