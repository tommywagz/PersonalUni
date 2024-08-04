import { requestAuthRegister, requestClear, requestUserProfile, requestChannelsCreate, requestChannelJoin } from '../wrappers';
import { session, user, userProfileSuccess, channelsCreateSuccess } from '../../types';

const INVALID_EMAILS = [['abcdef'], ['123456'], ['email@@wrong']];
const INVALID_PASSWORDS = [['123'], ['abc'], [''], ['12345']];
const VALID_EMAIL = 'email@gmail.com';
const LONG_STRING = '123456789123456789123456789123456789123456789123456789';
const SHORT_STRING = '';

let sessionOne: session, userOne: user, sessionTwo: session, userTwo: user, sessionThree: session, userThree: user;

beforeEach(() => {
  requestClear();
  sessionOne = requestAuthRegister(VALID_EMAIL, 'password', 'Namefirst', 'Namelast') as session;
  userOne = (requestUserProfile(sessionOne.token, sessionOne.authUserId) as userProfileSuccess).user;
  sessionTwo = requestAuthRegister('emailtwo@gmail.com', 'password', 'Namefirst', 'Namelast') as session;
  userTwo = (requestUserProfile(sessionTwo.token, sessionTwo.authUserId) as userProfileSuccess).user;
  sessionThree = requestAuthRegister('emailthree@gmail.com', 'password', 'Namefirst', 'Namelast') as session;
  userThree = (requestUserProfile(sessionThree.token, sessionThree.authUserId) as userProfileSuccess).user;
});

describe('failure', () => {
  test.each(INVALID_EMAILS)('invalid email: $email', (email) => {
    expect(requestAuthRegister(email, 'password', 'firstname', 'lastname')).toStrictEqual(400);
  });
  test.each(INVALID_PASSWORDS)('invalid password: $password', (password) => {
    expect(requestAuthRegister(VALID_EMAIL, password, 'firstname', 'lastname')).toStrictEqual(400);
  });
  test('nameFirst too short', () => {
    expect(requestAuthRegister(VALID_EMAIL, 'password', SHORT_STRING, 'namelast')).toStrictEqual(400);
  });
  test('nameFirst too long', () => {
    expect(requestAuthRegister(VALID_EMAIL, 'password', LONG_STRING, 'namelast')).toStrictEqual(400);
  });
  test('nameLast too short', () => {
    expect(requestAuthRegister(VALID_EMAIL, 'password', 'namefirst', SHORT_STRING)).toStrictEqual(400);
  });
  test('nameLast too long', () => {
    expect(requestAuthRegister(VALID_EMAIL, 'password', 'namefirst', LONG_STRING)).toStrictEqual(400);
  });
  test('email already taken', () => {
    requestAuthRegister(VALID_EMAIL, 'password', 'namefirst', 'namelast');
    expect(requestAuthRegister(VALID_EMAIL, 'password', 'namefirst', 'namelast')).toStrictEqual(400);
  });
});

describe('success', () => {
  test('returns valid session', () => {
    expect(sessionOne).toStrictEqual({ token: sessionOne.token, authUserId: sessionOne.authUserId });
  });
  test('handleStr is correctly generated', () => {
    expect(userOne.handleStr).toStrictEqual('namefirstnamelast');
  });
  test('handleStr length is cut', () => {
    const session: session = requestAuthRegister('newemail@gmail.com', 'password', 'Namefirstlong', 'Namelastlong') as session;
    const userFour = (requestUserProfile(session.token, session.authUserId) as userProfileSuccess).user;
    expect(userFour.handleStr).toStrictEqual('namefirstlongnamelas');
  });
  test('multiple handles are correctly generated', () => {
    expect(userOne.handleStr).toStrictEqual('namefirstnamelast');
    expect(userTwo.handleStr).toStrictEqual('namefirstnamelast0');
    expect(userThree.handleStr).toStrictEqual('namefirstnamelast1');
  });
  test('first user is a global owner and others are not', () => {
    const channelId: number = (requestChannelsCreate(sessionThree.token, 'channel', false) as channelsCreateSuccess).channelId;
    expect(requestChannelJoin(sessionOne.token, channelId)).toStrictEqual({});
    expect(requestChannelJoin(sessionTwo.token, channelId)).toStrictEqual(403);
  });
});
