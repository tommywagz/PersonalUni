import { requestAuthRegister, requestClear, requestChannelsCreate, requestStandupStart, requestStandupActive } from '../wrappers';
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
    expect(requestStandupActive(user1.token, 0)).toStrictEqual(400);
  });
  test('valid channelId, auth not member', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupActive(user2.token, channelId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupActive(user1.token + 'error', channelId)).toStrictEqual(403);
  });
});

describe('success cases', () => {
  test('active standup', async () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    const standupTimeFinish = (requestStandupStart(user1.token, channelId, 1)).timeFinish;
    expect(requestStandupActive(user1.token, channelId)).toStrictEqual({ isActive: true, timeFinish: standupTimeFinish });
    await new Promise(r => setTimeout(r, 2 * 1000));
  });
  test('inactive standup', async() => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    requestStandupStart(user1.token, channelId, 1);
    await new Promise(r => setTimeout(r, 2 * 1000));
    expect(requestStandupActive(user1.token, channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
  test('no standup', async () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestStandupActive(user1.token, channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
});

