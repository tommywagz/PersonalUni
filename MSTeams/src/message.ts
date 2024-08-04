import { getData, setData } from './dataStore';
import {
  error,
  messageSendSuccess,
  store,
  channelInfo,
  messageInfo,
  dmInfo,
  messageShareSuccess,
  reactInfo,
  userInfo,
  notificationInfo
} from './types';
import { isValidToken, getUId, isGlobalOwner, tagCheck } from './helpers';
import HTTPError from 'http-errors';

/**
* Send a message from the authorised user to the channel specified by channelId.
* Note: Each message should have its own unique ID, i.e. no messages should share an
* ID with another message, even if that other message is in a different channel.
*
* @param { string } token -number identifying that the current user is valid
* @param { number } channelId -channelId of the channel that the user sends a message to
* @param { string } message -message that the users send to the channel
*
* @return { messageId }  -returns the messageId of the message
* @return { error: string } returns error if channelId, message, user, or token is invalid
*
*/

export function messageSendV2(token: string, channelId: number, message: string): messageSendSuccess | error {
  const ds: store = getData();

  const getTimeStamp = () => Math.floor(Date.now() / 1000);
  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const userId: number = getUId(token);

  const userInviting: userInfo = ds.users.find((x) => x.uId === userId);

  if (channel === undefined) {
    throw HTTPError(400, 'channel not found');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message must be between 1 and 1000 characters.');
  }

  if ((channel.allMemberIds.find((x) => x === userId)) === undefined) {
    throw HTTPError(403, 'user not in channel');
  }

  const messageId: number = ds.messages.length;

  const messageItem: messageInfo = {
    uId: userId,
    messageId: messageId,
    channelId: channelId,
    dmId: null,
    message: message,
    timeSent: getTimeStamp(),
    reacts: [],
    isPinned: false
  };

  ds.messages.push(messageItem);

  const taggedUIds: number[] = tagCheck(message);

  const slicedMessage: string = message.substring(0, 20);

  for (const item of taggedUIds) {
    const newNotification: notificationInfo = {
      uId: item,
      channelId: channelId,
      dmId: -1,
      notificationMessage: userInviting.handleStr + ' tagged you in ' + channel.name + ': ' + slicedMessage,
    };

    ds.notifications.push(newNotification);
  }

  setData(ds);

  return { messageId: messageId };
}

/**
* Given a messageId for a message, this message is removed from the channel/DM.
*
* @param { string } token -number identifying that the current user is valid
* @param { number } messageId -Id of the message sent by the user
*
* @return { error: string } returns error if message, messageId, user, or token is invalid
*
*/
export function messageRemoveV2(token: string, messageId: number): object | error {
  const ds: store = getData();

  const messageInfo: messageInfo = ds.messages.find((x) => x.messageId === messageId);

  if (messageInfo === undefined) {
    throw HTTPError(400, 'messageId is invalid');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const userId: number = getUId(token);

  if (messageInfo.channelId !== null) {
    const channel: channelInfo = ds.channels.find(x => x.channelId === messageInfo.channelId);

    if ((channel.allMemberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (channel.ownerMemberIds.find((x) => x === userId) === undefined) && !isGlobalOwner(userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  if (messageInfo.dmId !== null) {
    const dm: dmInfo = ds.dms.find(x => x.dmId === messageInfo.dmId);

    if ((dm.memberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (dm.ownerId !== userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  const index: number = ds.messages.indexOf(messageInfo);
  ds.messages.splice(index, 1);

  setData(ds);

  return {};
}

/**
* Send a message from the authorised user to the channel specified by channelId.
* Note: Each message should have its own unique ID, i.e. no messages should share an
* ID with another message, even if that other message is in a different channel.
*
* @param { string } token -number identifying that the current user is valid
* @param { number } dmId -dmId of the channel that the user sends a message to
* @param { string } message -message that the users send to the channel
*
* @return { messageId }  -returns the messageId of the message
* @return { error: string } returns error if channelId, message, user, or token is invalid
*
*/

export function messageSenddmV2(token: string, dmId: number, message: string): messageSendSuccess | error {
  const ds: store = getData();

  const getTimeStamp = () => Math.floor(Date.now() / 1000);
  const dm: dmInfo = ds.dms.find((x) => x.dmId === dmId);

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const userId: number = getUId(token);

  const userInviting: userInfo = ds.users.find((x) => x.uId === userId);

  if (dm === undefined) {
    throw HTTPError(400, 'dm not found');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message must be between 1 and 1000 characters.');
  }

  if ((dm.memberIds.find((x) => x === userId)) === undefined) {
    throw HTTPError(403, 'user not in channel');
  }

  const messageId: number = ds.messages.length;

  const messageItem: messageInfo = {
    uId: userId,
    messageId: messageId,
    channelId: null,
    dmId: dmId,
    message: message,
    timeSent: getTimeStamp(),
    reacts: [],
    isPinned: false
  };

  ds.messages.push(messageItem);

  const taggedUIds: number[] = tagCheck(message);

  const slicedMessage: string = message.substring(0, 20);

  for (const item of taggedUIds) {
    const newNotification: notificationInfo = {
      uId: item,
      channelId: -1,
      dmId: dmId,
      notificationMessage: userInviting.handleStr + ' tagged you in ' + dm.name + ': ' + slicedMessage,
    };
    console.log(newNotification.notificationMessage);

    ds.notifications.push(newNotification);
  }

  setData(ds);

  return { messageId: messageId };
}

/**
* Given a messageId for a message, this message is removed from the channel/DM.
*
* @param { string } token -number identifying that the current user is valid
* @param { number } messageId -Id of the message sent by the user
* @param { string } message - new message
*
* @return { error: string } returns error if message, messageId, user, or token is invalid
*
*/
export function messageEditV2(token: string, messageId: number, message: string): object | error {
  const ds: store = getData();

  const messageInfo: messageInfo = ds.messages.find((x) => x.messageId === messageId);

  if (messageInfo === undefined) {
    throw HTTPError(400, 'messageId is invalid');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const userId: number = getUId(token);

  if (messageInfo.channelId !== null) {
    const channel: channelInfo = ds.channels.find(x => x.channelId === messageInfo.channelId);

    if ((channel.allMemberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (channel.ownerMemberIds.find((x) => x === userId) === undefined) && !isGlobalOwner(userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  if (messageInfo.dmId !== null) {
    const dm: dmInfo = ds.dms.find(x => x.dmId === messageInfo.dmId);

    if ((dm.memberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (dm.ownerId !== userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  if (message === '') {
    const index: number = ds.messages.indexOf(messageInfo);
    ds.messages.splice(index, 1);
  } else {
    ds.messages.find(x => x.messageId === messageId).message = message;
  }

  setData(ds);

  return {};
}

/**

 * Given a message Id from a specified channel or dm, this function will
 * reply to that message by forwarding the og message with an attatched
 * reply to it. (It's facebook messenger's reply feature)
 *
 *  @param { string } token
 *  @param { number } ogMessageId
 *  @param { string } message
 *  @param { number? } channelId
 *  @param { number? } dmId
 *
 *  @return { sharedMessageId }
 */

export function messageShareV1(
  token: string, ogMessageId: number,
  channelId: number, dmId: number,
  message?: string): messageShareSuccess | error {
  const ds = getData();

  // region errors
  if (!isValidToken(token)) {
    throw HTTPError(403, 'Token is invalid');
  }

  const ogMessage = ds.messages.find(x => x.messageId === ogMessageId);
  if (ogMessage === undefined) {
    throw HTTPError(400, 'ogMessage is invalid');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }

  if (dmId !== -1 && channelId !== -1) {
    throw HTTPError(400, 'Can only share message to one destination');
  }

  if (dmId === -1 && channelId === -1) {
    throw HTTPError(400, 'Need to enter a destination to share the message with');
  }

  // the og MesssageId is not in any associated channels or dms
  // the user is not a member of the destination dm or channel

  const userId = getUId(token);

  // ogChan ==> newChan || newDm
  // ogDm ==> newDm || newChan

  let isOgChan = false; let ogMessChannel: channelInfo;
  let isOgDm = false; let ogMessDm: dmInfo;
  let isNewChan = false; let targetChannel: channelInfo;
  let isNewDm = false; let targetDm: dmInfo;
  if (ogMessage.channelId !== null) {
    isOgChan = true;
    ogMessChannel = ds.channels.find(x => x.channelId === ogMessage.channelId);
  }
  if (ogMessage.dmId !== null) {
    isOgDm = true;
    ogMessDm = ds.dms.find(x => x.dmId === ogMessage.dmId);
  }
  if (channelId !== -1) {
    isNewChan = true;
    targetChannel = ds.channels.find(x => x.channelId === channelId);
  }
  if (dmId !== -1) {
    isNewDm = true;
    targetDm = ds.dms.find(x => x.dmId === dmId);
  }

  if (ds.channels.length !== 0 && isOgChan === true) { // there are channels in ds and the ogMessage was in a channel
    if (!ogMessChannel.allMemberIds.includes(userId) && channelId !== -1) { // the user is not a member of the ogChannel
      throw HTTPError(400, 'User is not a member of original channel/dm');
    }
    if (isNewChan === true && !targetChannel.allMemberIds.includes(userId)) { // the destination is a channel
      throw HTTPError(403, 'User is not a member of the destination');
    } else if (isNewDm === true && !targetDm.memberIds.includes(userId)) { // the destination is a dm
      throw HTTPError(403, 'User is not a member of the destination');
    }
  }
  if (ds.dms.length !== 0 && isOgDm === true) { // there are dms and the original message was in a dm
    if (!ogMessDm.memberIds.includes(userId) && dmId !== -1) { // the user is not a part of the ogdm
      throw HTTPError(400, 'User is not a member of original channel/dm');
    }
    if (isNewDm === true && !targetDm.memberIds.includes(userId)) { // the user is not a part of the target dm
      throw HTTPError(403, 'User is not a member of the destination');
    } else if (isNewChan === true && !targetChannel.allMemberIds.includes(userId)) { // the user is not a part of the target channel
      throw HTTPError(403, 'User is not a member of the destination');
    }
  }
  // region errors

  if (message === null) {
    message = '';
  }
  const newString = ogMessage.message + message;

  let returnObject: number;
  if (channelId !== -1) {
    returnObject = (messageSendV2(token, channelId, newString) as messageSendSuccess).messageId;
  }
  if (dmId !== -1) {
    returnObject = (messageSenddmV2(token, dmId, newString) as messageSendSuccess).messageId;
  }

  return { sharedMessageId: returnObject };
}

/**
 * Given a message and a reaction, a user can add a react to that specific message within a channel or dm
 *
 *  @param { number } messageId
 *  @param { number } reactId
 */

export function messageReactV1(token: string, messageId: number, reactId: number): object {
  const ds = getData();

  // region errors
  if (!isValidToken(token)) {
    throw HTTPError(403, 'User token is invalid');
  }

  // Does this reaction exist
  // ds.reacts.length === 0 || ds.reactions.find(x=> x.reactId === reactId) === undefined;
  // *(for when there is eventually a bank of reactions to choose from)*
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reaction');
  }

  if (ds.messages.length === 0 || ds.messages.find(x => x.messageId === messageId) === undefined) {
    throw HTTPError(400, 'Invalid message Id');
  }

  // Is the user a member of the channel or dm
  const user = getUId(token);
  const mess: messageInfo = ds.messages.find(x => x.messageId === messageId);

  let chan: channelInfo;
  let dm: dmInfo;
  if (mess.channelId !== null && ds.channels.length !== 0) { // if the message was from a channel
    chan = ds.channels.find(x => x.channelId === mess.channelId); // channel the message maybe from

    if (!chan.allMemberIds.includes(user)) {
      throw HTTPError(403, 'User is not in this channel');
    }
  }
  if (mess.dmId !== null && ds.dms.length !== 0) { // if the message was from a dm
    dm = ds.dms.find(x => x.dmId === mess.dmId); // the dm the message is maybe from

    if (!dm.memberIds.includes(user)) {
      throw HTTPError(403, 'User is not in this dm');
    }
  }

  // check if the user has already done this reaction to the same message

  if (ds.reacts.length !== 0 && ds.reacts.find(x => x.messageId === messageId && x.reactId === reactId).uIds.includes(user)) {
    throw HTTPError(400, 'Message already contains that reaction sent from this user');
  }
  // region errors

  const react: reactInfo = ds.reacts.find(x => x.messageId === messageId && x.reactId === reactId);

  // if reaction does not exist on message, add object to ds and add user to array
  if (react === undefined) {
    const newReact: reactInfo = {
      messageId: messageId,
      reactId: reactId,
      uIds: [],
      isThisUserReacted: false
    };
    newReact.uIds.push(user);
    newReact.isThisUserReacted = true;
    ds.reacts.push(newReact);

    const messReacts: number[] = ds.messages.find(x => x.messageId === messageId).reacts;

    if (!messReacts.includes(reactId)) {
      ds.messages.find(x => x.messageId === messageId).reacts.push(reactId);
    }

  // If this reaction does exist in this message then add the uId to the array and set boolean to true
  } else {
    react.uIds.push(user);
    react.isThisUserReacted = true;
  }

  const userInviting: userInfo = ds.users.find((x) => x.uId === mess.uId);

  if (mess.channelId !== null && ds.channels.length !== 0) { // if the message was from a channel
    const newNotification: notificationInfo = {
      uId: mess.uId,
      channelId: mess.channelId,
      dmId: -1,
      notificationMessage: userInviting.handleStr + ' reacted to your message in ' + chan.name,
    };

    ds.notifications.push(newNotification);
  }

  if (mess.dmId !== null && ds.dms.length !== 0) { // if the message was from a dm
    const newNotification: notificationInfo = {
      uId: mess.uId,
      channelId: -1,
      dmId: mess.dmId,
      notificationMessage: userInviting.handleStr + ' reacted to your message in ' + dm.name,
    };

    ds.notifications.push(newNotification);
  }

  setData(ds);

  return {};
}

/**
* Given a message within a channel or DM, marks it as "pinned".
*
* @param { number } messageId -Id of the message sent by the user
*
* @return { 400 Error } - messageId is invalid or message is already pinned
* @return { 403 Error } - messageId is valid and unauthorised user
*/

export function messagePinV1(token: string, messageId: number) {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const messageInfo: messageInfo = ds.messages.find((x) => x.messageId === messageId);

  if (messageInfo === undefined) {
    throw HTTPError(400, 'messageId is invalid');
  }

  if (messageInfo.isPinned === true) {
    throw HTTPError(400, 'message is already pinned');
  }

  const userId: number = getUId(token);

  if (messageInfo.dmId === null) {
    const channelInfo: channelInfo = ds.channels.find(x => x.channelId === messageInfo.channelId);
    const isOwner: boolean = channelInfo.ownerMemberIds.includes(userId);

    const isGlobalOwnerInChannel: boolean = isGlobalOwner(userId) && channelInfo.allMemberIds.includes(userId);

    if (!(isOwner || isGlobalOwnerInChannel)) {
      throw HTTPError(403, 'messageId refers to a valid message in a joined channel and the authorised user does not have owner permissions in the channel');
    }
  } else {
    const dmOwner: number = ds.dms.find(x => x.dmId === messageInfo.dmId).ownerId;

    if (dmOwner !== userId) {
      throw HTTPError(403, 'messageId refers to a valid message in a joined DM and the authorised user does not have owner permissions in the DM');
    }
  }

  messageInfo.isPinned = true;

  setData(ds);

  return {};
}

/**
* Given a message within a channel or DM, removes its mark as "pinned".
*
* @param { string } token -number identifying that the current user is valid
* @param { number } messageId -ID of the message that the users send to the channel
*
* @return { 400 Error } -messageId is invalid or message is not already pinned
* @return { 403 Error } -messageId refers to a valid message but user is unauthorised
*
*/

export function messageUnpinV1(token: string, messageId: number): object {
  const ds: store = getData();

  const messageInfo: messageInfo = ds.messages.find((x) => x.messageId === messageId);

  if (messageInfo === undefined) {
    throw HTTPError(400, 'messageId is invalid');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (messageInfo.isPinned === false) {
    throw HTTPError(400, 'message is not already pinned.');
  }

  const userId: number = getUId(token);

  if (messageInfo.channelId !== null) {
    const channel: channelInfo = ds.channels.find(x => x.channelId === messageInfo.channelId);

    if ((channel.allMemberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (channel.ownerMemberIds.find((x) => x === userId) === undefined) && !isGlobalOwner(userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  if (messageInfo.dmId !== null) {
    const dm: dmInfo = ds.dms.find(x => x.dmId === messageInfo.dmId);

    if ((dm.memberIds.find((x) => x === userId)) === undefined) {
      throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined.');
    }

    if ((userId !== messageInfo.uId) && (dm.ownerId !== userId)) {
      throw HTTPError(403, 'the message was not sent by the authorised user making this request or the user does not have owner permissions in the channel/DM.');
    }
  }

  messageInfo.isPinned = false;

  setData(ds);

  return {};
}

/**
* Given a message within a channel or DM the authorised user is part of,
* removes a "react" to that particular message
*
* @param { string } token -string identifying that the current user is valid
* @param { number } messageId -Id of the message sent by the user
* @param { number } reactId -type of react
*
* @return { }  -returns empty object if successful
* @return { error: string } returns error if messageId or reactId or unreact is invalid
*
*/
export function messageUnreactV1(token: string, messageId: number, reactId: number): object | error {
  const ds: store = getData();

  const messageInfo: messageInfo = ds.messages.find((x) => x.messageId === messageId);
  const reactInfo: reactInfo = ds.reacts.find((x) => x.reactId === reactId);

  if (messageInfo === undefined) {
    throw HTTPError(400, 'messageId is invalid');
  }

  if (reactInfo === undefined) {
    throw HTTPError(400, 'reactId is invalid');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if ((messageInfo.reacts.find((x) => x === reactId)) === undefined) {
    throw HTTPError(400, 'the message does not contain a react with ID reactId');
  }

  const userId: number = getUId(token);

  if ((reactInfo.uIds.find((x) => x === userId)) === undefined) {
    throw HTTPError(400, 'the user has not reacted to this message');
  }

  // splice uId from reactInfo.uids array
  const index: number = reactInfo.uIds.indexOf(userId);
  reactInfo.uIds.splice(index, 1);
  reactInfo.isThisUserReacted = false;

  // if length is 0, splice entire react from reactInfo
  if (reactInfo.uIds.length === 0) {
    const index2: number = ds.reacts.indexOf(reactInfo);
    ds.reacts.splice(index2, 1);
  }

  // // remove uId from messageInfo
  // if (messageInfo.reacts.includes(reactId)) {
  //   const index3: number = messageInfo.reacts.indexOf(reactId);
  //   messageInfo.reacts.splice(index3, 1);
  // }

  setData(ds);

  return {};
}

/**
 * messsage send later will send a given message at a given time in the future
 *
 *  @param { number } channelId
 *  @param { string } message
 *  @param { number } timeSent unix timestamp in seconds
 *
 *  @return { messageId }
 */
export function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number): messageSendSuccess {
  const ds = getData();
  const timeNow = Math.floor(Date.now() / 1000);

  // region errors
  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (ds.channels.length === 0) {
    throw HTTPError(400, 'dm is invalid');
  }

  const chan: channelInfo = ds.channels.find(x => x.channelId === channelId);
  if (ds.channels.length === 0 || chan === undefined) {
    throw HTTPError(400, 'ChannelId is invalid');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }

  if (timeSent < timeNow) {
    throw HTTPError(400, 'Time entered is in the past');
  }

  const user = getUId(token);
  if (!chan.allMemberIds.includes(user)) {
    throw HTTPError(403, 'User is not allowed to send messages to this channel');
  }

  // region errors

  const timeout = timeSent - timeNow;
  const messId: number = ds.messages.length;
  setTimeout(() => {
    ds.messages.push(
      {
        uId: user,
        messageId: ds.messages.length,
        channelId: channelId,
        dmId: null,
        message: message,
        timeSent: timeSent,
        reacts: [],
        isPinned: false,
      }
    );
    ds.messages.find(x => x.message === message).messageId = ds.messages.length;
    setData(ds);
  }, timeout * 1000);

  return { messageId: messId };
}

/**
 * messsage send later will send a given message at a given time in the future
 *
 *  @param { number } dmId
 *  @param { string } message
 *  @param { number } timeSent unix timestamp in seconds
 *
 *  @return { messageId }
 */
export function messageSendDmLaterV1(token: string, dmId: number, message: string, timeSent: number): messageSendSuccess {
  const ds = getData();
  const timeNow = Math.floor(Date.now() / 1000);

  // region errors
  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  if (ds.dms.length === 0) {
    throw HTTPError(400, 'dm is invalid');
  }

  const dm: dmInfo = ds.dms.find(x => x.dmId === dmId);
  if (dm === undefined) {
    throw HTTPError(400, 'dm is invalid');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Message is too long');
  }

  const user = getUId(token);
  if (dm === undefined || !dm.memberIds.includes(user)) {
    throw HTTPError(403, 'User is not allowed to send messages to this channel');
  }

  if (timeSent < timeNow) {
    throw HTTPError(400, 'Time entered is invalid');
  }
  // region errors

  const timeout = timeSent - timeNow;
  const messId: number = ds.messages.length;
  setTimeout(() => {
    ds.messages.push(
      {
        uId: user,
        messageId: ds.messages.length,
        channelId: null,
        dmId: dmId,
        message: message,
        timeSent: timeSent,
        reacts: [],
        isPinned: false,
      }
    );
    setData(ds);
  }, timeout * 1000);

  return { messageId: messId };
}
