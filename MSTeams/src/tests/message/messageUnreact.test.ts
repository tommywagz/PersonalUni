import { session, channelsCreateSuccess, dmCreateSuccess } from '../../types';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelInvite,
  requestMessageSend, requestMessageSenddm, requestMessageUnreact, requestMessageReact,
  requestChannelMessages, requestDmMessages, requestDmCreate
} from '../wrappers';

let user: session;
let channelId: number;
let messageIdCh: number;
let dmId: number;
let messageIdDm: number;
const reactId = 1;

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
    `example${emailSuffix}@gmail.com`,
    'password',
    'namefirst',
    'namelast'
  ) as session;
}

beforeEach(() => {
  requestClear();
  user = createUser('one');
  channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
  dmId = (requestDmCreate(user.token, []) as dmCreateSuccess).dmId;
  messageIdCh = requestMessageSend(user.token, channelId, 'hello channel').messageId;
  messageIdDm = requestMessageSenddm(user.token, dmId, 'hello dm').messageId;
});

describe('error cases', () => {
  test('messageId not a valid message within a channel', () => {
    requestMessageReact(user.token, messageIdCh, reactId);
    expect(requestMessageUnreact(user.token, messageIdCh + 1, reactId)).toStrictEqual(400);
  });
  test('messageId not a valid message within a DM', () => {
    requestMessageReact(user.token, messageIdDm, reactId);
    expect(requestMessageUnreact(user.token, messageIdDm + 1, reactId)).toStrictEqual(400);
  });
  test('invalid reactId', () => {
    requestMessageReact(user.token, messageIdCh, reactId);
    expect(requestMessageUnreact(user.token, messageIdCh, 0)).toStrictEqual(400);
  });
  test('the message does not contain a react with ID reactId', () => {
    expect(requestMessageUnreact(user.token, messageIdCh, reactId)).toStrictEqual(400);
  });
  test('the message does not contain a react with ID reactId from authorised user', () => {
    const user2 = createUser('two');
    requestMessageReact(user2.token, messageIdCh, reactId);
    expect(requestMessageUnreact(user.token, messageIdCh, reactId)).toStrictEqual(400);
  });
  test('invalid token', () => {
    requestMessageReact(user.token, messageIdCh, reactId);
    expect(requestMessageUnreact(user.token + 1, messageIdCh, reactId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('return type', () => {
    requestMessageReact(user.token, messageIdCh, reactId);
    expect(requestMessageUnreact(user.token, messageIdCh, reactId)).toStrictEqual({});
  });
  test('one message with react unreacted in channel', () => {
    requestMessageReact(user.token, messageIdCh, reactId);
    requestMessageUnreact(user.token, messageIdCh, reactId);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdCh,
        message: 'hello channel',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
  test('one message with react unreacted in dm', () => {
    requestMessageReact(user.token, messageIdDm, reactId);
    requestMessageUnreact(user.token, messageIdDm, reactId);
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdDm,
        message: 'hello dm',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
  test('two messages with reacts unreacted in channel', () => {
    const messageIdCh2 = requestMessageSend(user.token, channelId, 'hello channel 2').messageId;
    requestMessageReact(user.token, messageIdCh, reactId);
    requestMessageReact(user.token, messageIdCh2, reactId);
    requestMessageUnreact(user.token, messageIdCh, reactId);
    requestMessageUnreact(user.token, messageIdCh2, reactId);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [
        {
          uId: user.authUserId,
          messageId: messageIdCh2,
          message: 'hello channel 2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          uId: user.authUserId,
          messageId: messageIdCh,
          message: 'hello channel',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });
  test('two messages with reacts unreacted in dm', () => {
    const messageIdDm2 = requestMessageSenddm(user.token, dmId, 'hello dm 2').messageId;
    requestMessageReact(user.token, messageIdDm, reactId);
    requestMessageReact(user.token, messageIdDm2, reactId);
    requestMessageUnreact(user.token, messageIdDm, reactId);
    requestMessageUnreact(user.token, messageIdDm2, reactId);
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual({
      messages: [
        {
          uId: user.authUserId,
          messageId: messageIdDm2,
          message: 'hello dm 2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          uId: user.authUserId,
          messageId: messageIdDm,
          message: 'hello dm',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });
  test('one message with 1 of 2 users reacts unreacted in channel', () => {
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestMessageReact(user.token, messageIdCh, reactId);
    requestMessageReact(user2.token, messageIdCh, reactId);
    requestMessageUnreact(user.token, messageIdCh, reactId);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdCh,
        message: 'hello channel',
        timeSent: expect.any(Number),
        reacts: [{ reactId: reactId, uIds: [user2.authUserId], isThisUserReacted: false }],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
  test('one message with 1 of 2 users reacts unreacted in dm', () => {
    const user2 = createUser('two');
    const dmId2 = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
    const messageIdDm2 = requestMessageSenddm(user.token, dmId2, 'hi dm').messageId;
    requestMessageReact(user.token, messageIdDm2, reactId);
    requestMessageReact(user2.token, messageIdDm2, reactId);
    requestMessageUnreact(user.token, messageIdDm2, reactId);
    expect(requestDmMessages(user.token, dmId2, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdDm2,
        message: 'hi dm',
        timeSent: expect.any(Number),
        reacts: [{ reactId: reactId, uIds: [user2.authUserId], isThisUserReacted: false }],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
  test('one message with 2 users reacts unreacted in channel', () => {
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestMessageReact(user.token, messageIdCh, reactId);
    requestMessageReact(user2.token, messageIdCh, reactId);
    requestMessageUnreact(user.token, messageIdCh, reactId);
    requestMessageUnreact(user2.token, messageIdCh, reactId);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdCh,
        message: 'hello channel',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
  test('one message with 2 users reacts unreacted in dm', () => {
    const user2 = createUser('two');
    const dmId2 = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
    const messageIdDm2 = requestMessageSenddm(user.token, dmId2, 'hi dm').messageId;
    requestMessageReact(user.token, messageIdDm2, reactId);
    requestMessageReact(user2.token, messageIdDm2, reactId);
    requestMessageUnreact(user.token, messageIdDm2, reactId);
    requestMessageUnreact(user2.token, messageIdDm2, reactId);
    expect(requestDmMessages(user.token, dmId2, 0)).toStrictEqual({
      messages: [{
        uId: user.authUserId,
        messageId: messageIdDm2,
        message: 'hi dm',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
});
