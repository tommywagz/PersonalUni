import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfile } from '../wrappers';

// NOTE - CHECK FOR DIFFERENT USERNAMES BEING REGISTERED

beforeEach(() => {
  requestClear();
});

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
    `example${emailSuffix}@gmail.com`,
    'password',
    'namefirst',
    'namelast'
  ) as session;
}

describe('error cases', () => {
  test('token is invalid', () => {
    const user = createUser('one');
    expect(requestUserProfile(user.token + '1', user.authUserId)).toStrictEqual(403);
  });
  test('uId does not refer to a valid user ', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfile(userToken, -1)).toStrictEqual(400);
  });
});

describe('success', () => {
  test('one user', () => {
    const userOne = createUser('one');
    expect(requestUserProfile(userOne.token, userOne.authUserId)).toStrictEqual({
      user: {
        uId: userOne.authUserId,
        email: 'exampleone@gmail.com',
        nameFirst: 'namefirst',
        nameLast: 'namelast',
        handleStr: expect.any(String),
        profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
      },
    });
  });
  test('multiple users', () => {
    const userOne = createUser('one');
    createUser('two');
    const userThree = createUser('three');

    expect(requestUserProfile(userOne.token, userThree.authUserId)).toStrictEqual({
      user: {
        uId: userThree.authUserId,
        email: 'examplethree@gmail.com',
        nameFirst: 'namefirst',
        nameLast: 'namelast',
        handleStr: expect.any(String),
        profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
      },
    });
  });
});
