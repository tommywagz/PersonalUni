import { session, error, channelsCreateSuccess } from '../../types';

import { requestClear, requestAuthRegister, requestChannelsCreate, requestChannelJoin, requestMessageSend, requestMessageRemove, requestDmCreate, requestMessageSenddm } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successfully remove message', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    expect(requestMessageRemove(userToken, messageId)).toStrictEqual({});
  });
  test('Successfully remove message in dms', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, [])).dmId;
    const messageId = requestMessageSenddm(userToken, dmId, 'Cow').messageId;
    expect(requestMessageRemove(userToken, messageId)).toStrictEqual({});
  });
  test('Owner member who do not send the message successfully remove message', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    requestChannelJoin(userToken2, channelId);
    const messageId = requestMessageSend(userToken2, channelId, 'Camel').messageId;
    expect(requestMessageRemove(userToken, messageId)).toStrictEqual({});
  });
});
describe('error cases', () => {
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    requestMessageSend(userToken, channelId, 'Turtle');
    expect(requestMessageRemove(userToken, 5959595) as error).toStrictEqual(400);
  });
  test('messageId exist but does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestChannelsCreate(userToken, 'channel1', true);
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    const channelId2 = (requestChannelsCreate(userToken2, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken2, channelId2, 'fish').messageId;
    expect(requestMessageRemove(userToken, messageId) as error).toStrictEqual(400);
  });
  test('messageId exist but does not refer to a valid message within a DM that the authorised user has joined', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, [])).dmId;
    requestMessageSenddm(userToken, dmId, 'Cow');
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    const dmId2 = (requestDmCreate(userToken2, [])).dmId;
    const messageId2 = requestMessageSenddm(userToken2, dmId2, 'Cow').messageId;
    expect(requestMessageRemove(userToken, messageId2) as error).toStrictEqual(400);
  });
  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    requestChannelJoin(userToken2, channelId);
    expect(requestMessageRemove(userToken2, messageId) as error).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId = requestMessageSend(userToken, channelId, 'Turtle').messageId;
    expect(requestMessageRemove('123', messageId) as error).toStrictEqual(403);
  });
});

