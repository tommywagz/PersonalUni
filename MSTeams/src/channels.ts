import { getData, setData } from './dataStore';
import {
  error,
  channelsCreateSuccess,
  store,
  session,
  channelsListSuccess,
  channel,
  channelInfo,

} from './types';
import { isValidToken } from './helpers';
import HTTPError from 'http-errors';

/**
 * Creates a new channel with the given name, that is either a public or
 * private channel. The user who created it automatically joins the channel.
 *
 * @param {string} token - token that is generated for each user
 * @param {string} name - specifies the name of the created channel
 * @param {boolean} isPublic - declares whether channel is public/private
 *
 * @returns {channelId: integer}  - returns the channelID
 * @returns {error: string}  - returns error if name or token is invalid
 *
 */
export function channelsCreateV3(
  token: string,
  name: string,
  isPublic: boolean
): channelsCreateSuccess | error {
  const ds: store = getData();

  // Get a user object from authUserId
  const userSession: session = ds.sessions.find((x) => x.token === token);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'name length not valid');
  }

  // Create a unique id
  const id: number = ds.channels.length;

  // Sets the values of the created channel
  const newChannel: channelInfo = {
    channelId: id,
    name: name,
    isPublic: isPublic,
    ownerMemberIds: [userSession.authUserId],
    allMemberIds: [userSession.authUserId],
    sIsActive: false,
    sMessages: [],
    sLength: null,
    sFinish: null,
  };

  ds.channels.push(newChannel);

  setData(ds);

  return { channelId: id };
}

/**
 * Provides an array of all channels, including private channels git st
 * (and their associated details)
 *
 * @param {string} token - takes in a user's token
 *
 * @returns {array of channels} = all channels
 * @returns {{error: string}} - returns error if invalid token
 */
export function channelsListAllV3(token: string): channelsListSuccess | error {
  const ds: store = getData();

  const userId: session = ds.sessions.find((x) => x.token === token);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invlaid');
  }

  if (userId === undefined) {
    throw HTTPError(400, 'userId is invlaid');
  }

  const channels: channel[] = [];

  for (const channel of ds.channels) {
    channels.push({ name: channel.name, channelId: channel.channelId });
  }

  return { channels: channels };
}

/**
 * Provides an array of all channels (and their associated details) that the
 * authorised user is part of.
 *
 * @param {string} token - unique handle generated for each user session
 *
 * @returns {array of objects}  - returns the channels array unless when the
 * token is invlaid in which case it returns 'error'
 */

export function channelsListV3(token: string): channelsListSuccess | error {
  const ds: store = getData();

  const userId: session = ds.sessions.find((x) => x.token === token);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invlaid');
  }

  if (userId === undefined) {
    throw HTTPError(400, 'userId is invalid');
  }

  const channels: channel[] = [];
  for (const channel of ds.channels) {
    if (channel.allMemberIds.includes(userId.authUserId)) {
      channels.push({ channelId: channel.channelId, name: channel.name });
    }
  }

  return { channels: channels };
}
