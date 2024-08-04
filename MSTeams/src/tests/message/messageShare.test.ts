import { session, channelsCreateSuccess, dmCreateSuccess, messageSendSuccess } from '../../types';
import { requestClear, requestAuthRegister, requestChannelsCreate, requestMessageSend, requestDmCreate, requestMessageShare, requestMessageSenddm } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successful message sharing to channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const channel2 = (requestChannelsCreate(userToken, 'channel2', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const og = (requestMessageSend(userToken, channelId, 'This is the original')as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og, channel2, -1, message)).toStrictEqual({ sharedMessageId: 1 });
  });
  test('Successful message sharing to dm', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).authUserId;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'III') as session).authUserId;
    const dmId = (requestDmCreate(userToken, [user2, user3]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const og = (requestMessageSenddm(userToken, dmId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og, -1, dmId, message)).toStrictEqual({ sharedMessageId: 1 });
  });
});

describe('error cases', () => {
  test('token is invalid', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const og = (requestMessageSend(userToken, channelId, 'This is the original')as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken + 7, og, channelId, -1, message)).toStrictEqual(403);
  });
  test('Both the channel Id and dmId are -1', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).authUserId;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'III') as session).authUserId;
    const dmId = (requestDmCreate(userToken, [user2, user3]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const og = (requestMessageSenddm(userToken, dmId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og, -1, -1, message)).toStrictEqual(400);
  });
  test('neither of channel or dm are -1', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).authUserId;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'III') as session).authUserId;
    const dmId = (requestDmCreate(userToken, [user2, user3]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const og = (requestMessageSenddm(userToken, dmId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og, channelId, dmId, message)).toStrictEqual(400);
  });
  test('ogMessage is invalid within the channels and dms the user is in', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).authUserId;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'III') as session).authUserId;
    const dmId = (requestDmCreate(userToken, [user2, user3]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const og = (requestMessageSenddm(userToken, dmId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og + 10, channelId, -1, message)).toStrictEqual(400);
    expect(requestMessageShare(userToken, og + 10, -1, dmId, message)).toStrictEqual(400);
  });
  test('message is longer than 1000 characters', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    let message = '';
    for (let i = 0; i < 1000; i++) {
      message = message + 'aa';
    }
    const og = (requestMessageSend(userToken, channelId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, og, channelId, -1, message)).toStrictEqual(400);
  });
  test('The dm or channel is valid but the user isn\'t a member', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session);
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'tom', 'III') as session);
    const channelId = (requestChannelsCreate(user2.token, 'channel1', true) as channelsCreateSuccess).channelId;
    const dmId = (requestDmCreate(user2.token, [user3.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const ogDm = (requestMessageSenddm(user3.token, dmId, 'This is the original') as messageSendSuccess).messageId;
    const ogMessage = (requestMessageSend(user2.token, channelId, 'This is the original') as messageSendSuccess).messageId;

    expect(requestMessageShare(userToken, ogDm, channelId, -1, message)).toStrictEqual(403);
    expect(requestMessageShare(userToken, ogMessage, -1, dmId, message)).toStrictEqual(403);
  });
});

