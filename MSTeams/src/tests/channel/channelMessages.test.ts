import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelMessages,
  requestMessageSend
} from '../wrappers';

// const ERROR: error = { error: expect.any(String) };

let user: session;

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
});

describe('error cases', () => {
  test('channelId does not refer to valid channel', () => {
    expect(requestChannelMessages(user.token, 1, 0)).toStrictEqual(400);
  });
  test('valid channelId, auth not member of channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelMessages(user2.token, channelId, 0)).toStrictEqual(403);
  });
  test('start is greater than the total number of messages in the channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    requestMessageSend(user.token, channelId, 'hello world');
    expect(requestChannelMessages(user.token, channelId, 5)).toStrictEqual(400);
  });
  test('start cant be negative', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    requestMessageSend(user.token, channelId, 'hello world');
    expect(requestChannelMessages(user.token, channelId, -1)).toStrictEqual(400);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelMessages(user.token + 'error', channelId, 0)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('empty message array', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  test('display one message', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    requestMessageSend(user.token, channelId, 'message');
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [{
        message: 'message',
        messageId: 0,
        timeSent: expect.any(Number),
        uId: 0,
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
  });
  test('display messages not from the start', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;

    for (let i = 0; i < 8; i++) {
      requestMessageSend(user.token, channelId, `message${i}`);
    }

    expect(requestChannelMessages(user.token, channelId, 3).messages[0]).toStrictEqual({
      message: 'message7',
      messageId: 7,
      timeSent: expect.any(Number),
      uId: 0,
      reacts: [],
      isPinned: false
    });
    expect(requestChannelMessages(user.token, channelId, 3).start).toStrictEqual(3);
    expect(requestChannelMessages(user.token, channelId, 3).end).toStrictEqual(-1);
  });
  test('display first 50 of 70 messages', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;

    for (let i = 1; i < 70; i++) {
      requestMessageSend(user.token, channelId, `m${i}`);
    }

    expect(requestChannelMessages(user.token, channelId, 3).end).toStrictEqual(53);
    expect(requestChannelMessages(user.token, channelId, 3).start).toStrictEqual(3);
    expect(requestChannelMessages(user.token, channelId, 3).messages[0].messageId).toStrictEqual(52);
    expect(requestChannelMessages(user.token, channelId, 3).messages[49].messageId).toStrictEqual(3);
    expect(requestChannelMessages(user.token, channelId, 3).messages.length).toStrictEqual(50);
  });
});
