import { session, dmCreateSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestDmMessages, requestMessageSenddm } from '../wrappers';

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
  test('dmId does not refer to valid dm', () => {
    expect(requestDmMessages(user.token, 1, 0)).toStrictEqual(400);
  });
  test('valid dmId, auth not member of dm', () => {
    const user2 = createUser('two');
    const dmId = (requestDmCreate(user2.token, []) as dmCreateSuccess).dmId;
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual(403);
  });
  test('start is greater than the total number of messages in the dm', () => {
    const user2 = createUser('two');
    const dmId = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
    requestMessageSenddm(user.token, dmId, 'hello world');
    expect(requestDmMessages(user.token, 1, 0)).toStrictEqual(400);
  });
  test('start cant be negative', () => {
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;
    requestMessageSenddm(user.token, dmId, 'hello world');
    expect(requestDmMessages(user.token, 1, 0)).toStrictEqual(400);
  });
  test('invalid token', () => {
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;
    expect(requestDmMessages(user.token + 7, dmId, 0)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('empty message array', () => {
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
  test('display one message', () => {
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;
    requestMessageSenddm(user.token, dmId, 'message');
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual({
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
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;

    for (let i = 0; i < 8; i++) {
      requestMessageSenddm(user.token, dmId, `message${i}`);
    }

    expect(requestDmMessages(user.token, dmId, 3).messages[0]).toStrictEqual({
      message: 'message7',
      messageId: 7,
      timeSent: expect.any(Number),
      uId: 0,
      reacts: [],
      isPinned: false
    });
    expect(requestDmMessages(user.token, dmId, 3).start).toStrictEqual(3);
    expect(requestDmMessages(user.token, dmId, 3).end).toStrictEqual(-1);
  });
  test('display first 50 of 70 messages', () => {
    const dmId = (requestDmCreate(user.token, [user.authUserId]) as dmCreateSuccess).dmId;

    for (let i = 0; i < 70; i++) {
      requestMessageSenddm(user.token, dmId, `m${i}`);
    }

    expect(requestDmMessages(user.token, dmId, 3).end).toStrictEqual(53);
  });
});

