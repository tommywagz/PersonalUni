import { getData } from './dataStore';
import { isValidToken, getUId } from './helpers';
import HttpError from 'http-errors';
import { store, messageInfo } from './types';
/**
* Given a query substring, returns a collection of messages in all
* of the channels/DMs that the user has joined that contain the query
* (case-insensitive). There is no expected order for these messages.

* @param { string } token -number identifying that the current user is valid
* @param { string } queryStr -a particular string or substring
*
* @return { messages }  -collection of messages of the channel/dm that the user has joined that contain the query.
*
*/
export function searchV1(token: string, queryStr: string): messageInfo[] {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HttpError(403, 'token is invalid');
  }
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HttpError(400, 'length must be between 1 and 1000 characters.');
  }

  const userId: number = getUId(token);

  const searchMessages = (messageInfo: messageInfo) => (messageInfo.uId === userId) && (messageInfo.message.includes(queryStr));
  const messages = ds.messages.filter(searchMessages);

  return messages;
}
