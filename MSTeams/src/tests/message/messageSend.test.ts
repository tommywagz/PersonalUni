import { session, error, channelsCreateSuccess } from '../../types';

import { requestClear, requestAuthRegister, requestChannelsCreate, requestMessageSend } from '../wrappers';

// let userToken: string;
// let userToken2: string;

beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successful message sending', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;

    expect(requestMessageSend(userToken, channelId, 'Turtle')).toStrictEqual({ messageId: 0 });
  });
});
describe('error cases', () => {
  test('channelId does not refer to a valid channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestChannelsCreate(userToken, 'channel1', true);
    expect(requestMessageSend(userToken, 595959, 'Turtle') as error).toStrictEqual(400);
  });
  test('length of message is less than 1', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    expect(requestMessageSend(userToken, channelId, '')as error).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    expect(requestMessageSend(
      userToken,
      channelId,
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    )as error).toStrictEqual(400);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const userToken2 = (requestAuthRegister('emailotwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    expect(requestMessageSend(userToken2, channelId, 'Turtle') as error).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    expect(requestMessageSend('123', channelId, 'Turtle') as error).toStrictEqual(403);
  });
});

