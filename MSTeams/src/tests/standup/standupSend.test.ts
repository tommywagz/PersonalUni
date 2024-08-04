import { requestAuthRegister, requestClear, requestChannelsCreate, requestStandupStart, requestStandupSend } from '../wrappers';
import { session, channelsCreateSuccess } from '../../types';

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
    `example${emailSuffix}@gmail.com`,
    'password',
    'namefirst',
    'namelast'
  ) as session;
}

let user1: session;

beforeEach(() => {
  requestClear();
  user1 = createUser('one');
});

describe('error cases', () => {
  test('channelId does not refer to valid channel', () => {
    expect(requestStandupSend(user1.token, 123456, 'hello')).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    const message = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(requestStandupSend(user1.token, channelId, message)).toStrictEqual(400);
  });
  test('an active standup is not currently running in the channel', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupSend(user1.token, channelId, 'hello')).toStrictEqual(400);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupSend(user2.token, channelId, 'hello')).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupSend(user1.token + 'error', channelId, 'hello')).toStrictEqual(403);
  });
});

describe('success cases', () => {
  test('sends a message success return', async () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    requestStandupStart(user1.token, channelId, 1);
    expect(requestStandupSend(user1.token, channelId, 'hello')).toStrictEqual({});
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
  test('sends two messages success return', async () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    requestStandupStart(user1.token, channelId, 1);
    expect(requestStandupSend(user1.token, channelId, 'hello')).toStrictEqual({});
    expect(requestStandupSend(user1.token, channelId, 'bye')).toStrictEqual({});
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
});
