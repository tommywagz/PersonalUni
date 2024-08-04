import { requestClear, requestSearch, requestAuthRegister, requestChannelsCreate, requestDmCreate, requestMessageSend, requestMessageSenddm } from '../wrappers';
import { channelsCreateSuccess, dmCreateSuccess, session, error } from '../../types';

let userToken: string;

beforeEach(() => {
  requestClear();
  userToken = (
      requestAuthRegister(
        'emailone@gmail.com',
        'password',
        'tom',
        'abbott'
      ) as session
  ).token;
});

describe('error cases', () => {
  test('length of queryStr is less than 1 characters', () => {
    expect(requestSearch(userToken, '') as error).toStrictEqual(400);
  });
  test('length of queryStr is over 1000 characters', () => {
    const queryStr = 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';
    expect(requestSearch(userToken, queryStr) as error).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const channelId1 = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    requestMessageSend(userToken, channelId1, 'Turtle');
    expect(requestSearch('invalid', 'Turtle') as error).toStrictEqual(403);
  });
});
describe('success', () => {
  test('search and return a collection of messages from a channel and a dm', () => {
    const channelId1 = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId1 = requestMessageSend(userToken, channelId1, 'Turtle1').messageId;
    const dmId1 = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const messageId2 = requestMessageSenddm(userToken, dmId1, 'Turtle2').messageId;
    expect(requestSearch(userToken, 'Turtle')).toStrictEqual(
      [
        {
          uId: 0,
          messageId: messageId1,
          channelId: channelId1,
          dmId: null,
          message: 'Turtle1',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          uId: 0,
          messageId: messageId2,
          channelId: null,
          dmId: dmId1,
          message: 'Turtle2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]
    );
  });
  test('search and return a collection of messages from different channels', () => {
    const channelId1 = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const messageId1 = requestMessageSend(userToken, channelId1, 'Turtle1').messageId;
    const channelId2 = (requestChannelsCreate(userToken, 'channel2', true) as channelsCreateSuccess).channelId;
    const messageId2 = requestMessageSend(userToken, channelId2, 'Turtle2').messageId;
    expect(requestSearch(userToken, 'Turtle')).toStrictEqual(
      [
        {
          uId: 0,
          messageId: messageId1,
          channelId: channelId1,
          dmId: null,
          message: 'Turtle1',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          uId: 0,
          messageId: messageId2,
          channelId: channelId2,
          dmId: null,
          message: 'Turtle2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]
    );
  });
  test('search and return a collection of messages from different dms', () => {
    const dmId1 = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const messageId1 = requestMessageSenddm(userToken, dmId1, 'Cow1').messageId;
    const dmId2 = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const messageId2 = requestMessageSenddm(userToken, dmId2, 'Cow2').messageId;
    expect(requestSearch(userToken, 'Cow')).toStrictEqual(
      [
        {
          uId: 0,
          messageId: messageId1,
          channelId: null,
          dmId: dmId1,
          message: 'Cow1',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          uId: 0,
          messageId: messageId2,
          channelId: null,
          dmId: dmId2,
          message: 'Cow2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]
    );
  });
});

