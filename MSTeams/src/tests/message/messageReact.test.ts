import { session, channelsCreateSuccess, messageSendSuccess, dmCreateSuccess } from '../../types';
import { requestClear, requestAuthRegister, requestChannelsCreate, requestMessageReact, requestMessageSend, requestDmCreate, requestMessageSenddm } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('error cases', () => {
  test('Invalid token', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(userToken + 90, messageId, 1)).toStrictEqual(403);
  });
  test('Invalid messageId', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(userToken, messageId + 100, 1)).toStrictEqual(400);
  });
  test('Invalid reactId', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(userToken, messageId, 10)).toStrictEqual(400);
  });
  test('User already reacted', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;
    requestMessageReact(userToken, messageId, 1);

    expect(requestMessageReact(userToken, messageId, 1)).toStrictEqual(400);
  });
  test('User is not a member of the channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(user2, messageId, 1)).toStrictEqual(403);
  });
  test('User is not a member of the dm', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).token;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'wagner') as session);
    const dmId = (requestDmCreate(userToken, [user3.authUserId]) as dmCreateSuccess).dmId;
    const messageId = (requestMessageSenddm(userToken, dmId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(user2, messageId, 1)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('Successful channel message reaction', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = (requestMessageSend(userToken, channelId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(userToken, messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(userToken, messageId, 1)).toStrictEqual(400);
  });
  test('Successful dm message reaction', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'wagner') as session);
    const Token2 = user2.token as string;
    const dmId = (requestDmCreate(userToken, [user2.authUserId]) as dmCreateSuccess).dmId;
    const messageId = (requestMessageSenddm(userToken, dmId, 'test') as messageSendSuccess).messageId;

    expect(requestMessageReact(userToken, messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(Token2, messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(userToken, messageId, 1)).toStrictEqual(400);
  });
});
