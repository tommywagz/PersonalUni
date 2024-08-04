import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear, requestAuthRegister, requestChannelsCreate,
  requestChannelMessages, requestStandupStart, requestStandupSend
} from '../wrappers';

let user: session;
let channelId: number;

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
});

describe('error cases', () => {
  test('invalid channelId', async () => {
    expect(requestStandupStart(user.token, channelId + 1, 0.5)).toStrictEqual(400);
    await new Promise(r => setTimeout(r, 1 * 1000));
  });
  test('invalid length', async () => {
    expect(requestStandupStart(user.token, channelId, -1)).toStrictEqual(400);
    await new Promise(r => setTimeout(r, 1 * 1000));
  });
  test('already an active standup in channel', async () => {
    requestStandupStart(user.token, channelId, 1);
    expect(requestStandupStart(user.token, channelId, 1)).toStrictEqual(400);
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
  test('auth user not member of valid channel', async () => {
    const user2 = createUser('two');
    expect(requestStandupStart(user2.token, channelId, 1)).toStrictEqual(403);
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
  test('invalid token', async () => {
    expect(requestStandupStart(user.token + 1, channelId, 1)).toStrictEqual(403);
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
});

describe('success', () => {
  test('return type', async() => {
    expect(requestStandupStart(user.token, channelId, 2)).toStrictEqual({ timeFinish: expect.any(Number) });
    await new Promise(r => setTimeout(r, 3 * 1000));
  });
  test('no messages sent in standup', async () => {
    requestStandupStart(user.token, channelId, 1);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
  test('two messages sent in standup', async () => {
    requestStandupStart(user.token, channelId, 2);
    requestStandupSend(user.token, channelId, 'one');
    requestStandupSend(user.token, channelId, 'two');
    await new Promise(r => setTimeout(r, 3 * 1000));
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [
        {
          uId: user.authUserId,
          messageId: expect.any(Number),
          message: 'namefirstnamelast: one\nnamefirstnamelast: two',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
    // break;
  });
});

