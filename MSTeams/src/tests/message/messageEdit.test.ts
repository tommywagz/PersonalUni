import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessageEdit,
} from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successfully edit message in channels', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    expect(requestMessageEdit(userToken, messageId, 'Fish')).toStrictEqual({});
  });
  //   test('Successfully edit message in dms', () => {
  //     const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
  //     const dmCreateSuccess = (requestDmCreate(userToken, [])).dmCreateSuccess;
  //     const messageId = requestMessageSenddm(userToken, dmCreateSuccess, 'Cow').messageId;
  //     expect(requestMessageEdit(userToken, messageId, 'Fish')).toStrictEqual({});
  //   });
  test('Owner member who do not send the message successfully edit message in channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    requestMessageSend(userToken, channelId, 'Turtle');
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;

    requestChannelJoin(userToken2, channelId);
    const messageId2 = requestMessageSend(userToken2, channelId, 'Camel').messageId;
    expect(requestMessageEdit(userToken, messageId2, 'fish')).toStrictEqual({});
  });
});
describe('error cases', () => {
  test('length of message is over 1000 characters', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    expect(requestMessageEdit(userToken, messageId, '1'.repeat(1001))).toStrictEqual(400);
  });
  test('messageId does not refer to a valid message within a channel that the authorised user has joined', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    requestMessageSend(userToken, channelId, 'Turtle');
    expect(requestMessageEdit(userToken, 595959, 'hello')).toStrictEqual(400);
  });
  //   test('messageId does not refer to a valid message within a DM that the authorised user has joined', () => {
  //     const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
  //     const dmCreateSuccess = (requestDmCreate(userToken, [])).dmCreateSuccess;
  //     requestMessageSenddm(userToken, dmCreateSuccess, 'Cow');
  //     expect(requestMessageEdit(userToken, 595959, 'hello')).toStrictEqual(ERROR);
  //   });
  test('messageId exist but does not refer to a valid message within a channel that the authorised user has joined', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    requestMessageSend(userToken, channelId, 'Turtle');
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    const channelId2 = (requestChannelsCreate(userToken2, 'channel2', true) as channelsCreateSuccess).channelId;
    const messageId2 = requestMessageSend(userToken2, channelId2, 'Turtle').messageId;
    expect(requestMessageEdit(userToken, messageId2, 'fish')).toStrictEqual(400);
  });
  //   test('messageId exist but does not refer to a valid message within a DM that the authorised user has joined', () => {
  //     const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
  //     const dmCreateSuccess = (requestDmCreate(userToken, [])).dmCreateSuccess;
  //     requestMessageSenddm(userToken, dmCreateSuccess, 'Cow');
  //     const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
  //     const dmId2 = (requestDmCreate(userToken2, []) as dmCreateSuccess).dmCreateSuccess;
  //     const messageId2 = requestMessageSenddm(userToken2, dmId2, 'Cow').messageId;
  //     expect(requestMessageEdit(userToken, messageId2, 'fish')).toStrictEqual(ERROR);
  //   });
  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    requestChannelJoin(userToken2, channelId);
    expect(requestMessageEdit(userToken2, messageId, 'fish')).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    expect(requestMessageEdit('123', messageId, 'fish')).toStrictEqual(403);
  });
});

