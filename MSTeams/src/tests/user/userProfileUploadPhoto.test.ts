import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfileUploadphoto } from '../wrappers';

beforeEach(() => {
  requestClear();
});

const coolimage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Banana_and_cross_section.jpg/2880px-Banana_and_cross_section.jpg';

test('url not https', () => {
  const user = requestAuthRegister('valid@email.com', 'validPassword', 'nameFirst', 'nameLast') as session;
  expect(requestUserProfileUploadphoto(user.token, coolimage,
    200, 0, 400, 400)).toStrictEqual({});
});

test('invalid url', () => {
  const user = requestAuthRegister('valid@email.com', 'validPassword', 'nameFirst', 'nameLast') as session;
  expect(requestUserProfileUploadphoto(user.token, 'coolimage',
    200, 0, 400, 400)).toStrictEqual(400);
});

test('invalid token', () => {
  expect(requestUserProfileUploadphoto('token', 'coolimage', 200, 0, 400, 400)).toStrictEqual(403);
});

