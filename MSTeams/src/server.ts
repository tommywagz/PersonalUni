import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';
import errorHandler from 'middleware-http-errors';
import { getData, setData } from './dataStore';
import config from './config.json';

// Return function Imports
import { clearV1 } from './other';
import { echo } from './echo';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequest, authPasswordResetReset } from './auth';
import { usersAllV1 } from './users';
import { channelsCreateV3, channelsListAllV3, channelsListV3 } from './channels';
import { channelDetailsV3, channelJoinV3, channelAddOwnerV2, channelRemoveOwnerV2, channelInviteV3, channelMessagesV3, channelLeaveV2 } from './channel';
import {
  messageSendV2, messageRemoveV2, messageSenddmV2, messageEditV2, messageSendLaterV1, messageSendDmLaterV1,
  messagePinV1, messageUnpinV1, messageReactV1, messageUnreactV1, messageShareV1
} from './message';
import { userProfileV3, userProfileSetnameV2, userProfileSethandleV2, userProfileSetemailV2, userProfileUploadPhoto } from './user';
import { dmCreateV2, dmDetailsV2, dmListV2, dmLeaveV2, dmMessagesV2, dmRemoveV2 } from './dm';
import { notificationsGetV1 } from './notifications';
import { adminUserRemoveV1, adminUserpermissionChange } from './admin';
import { searchV1 } from './search';
import { tokenFromHeader } from './helpers';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

export function saveData() {
  const ds = JSON.stringify(getData(), null, 2);
  fs.writeFileSync('./backup.json', ds);
}

function loadData() {
  if (!fs.existsSync('./backup.json')) {
    saveData();
    console.log('No saved data found');
    return;
  }

  const ds = JSON.parse(fs.readFileSync('./backup.json', 'utf8'));
  setData(ds);
  console.log('Restored data from ./backup.json');
}

// =============================== OTHER =================================== //
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  return res.json(clearV1());
});

// ============================== ADMIN =================================== //
app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const uId = parseInt(req.query.uId as string);
  return res.json(adminUserRemoveV1(token, uId));
});

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { uId, permissionId } = req.body;
  return res.json(adminUserpermissionChange(token, uId, permissionId));
});

// =============================== AUTH =================================== //
app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;
  return res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(authLogoutV2(token));
});

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;
  return res.json(authLoginV3(email, password));
});

app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const { email } = req.body;
  return res.json(authPasswordResetRequest(email));
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  const { resetCode, newPassword } = req.body;
  return res.json(authPasswordResetReset(resetCode, newPassword));
});

// ============================= CHANNELS ================================= //
app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(channelsListAllV3(token));
});

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { name, isPublic } = req.body;
  return res.json(channelsCreateV3(token, name, isPublic));
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(channelsListV3(token));
});

// ============================= CHANNEL ================================= //
app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const channelId = parseInt(req.query.channelId as string);
  return res.json(channelDetailsV3(token, channelId));
});

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, uId } = req.body;
  return res.json(channelInviteV3(token, channelId, uId));
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId } = req.body;
  return res.json(channelJoinV3(token, channelId));
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  return res.json(channelMessagesV3(token, channelId, start));
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId } = req.body;
  return res.json(channelLeaveV2(token, channelId));
});

app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, uId } = req.body;
  return res.json(channelAddOwnerV2(token, channelId, uId));
});

app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, uId } = req.body;
  return res.json(channelRemoveOwnerV2(token, channelId, uId));
});

// ============================= MESSAGE ================================= //
app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { dmId, message } = req.body;
  return res.json(messageSenddmV2(token, dmId, message));
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV2(token, messageId));
});

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, message } = req.body;
  return res.json(messageSendV2(token, channelId, message));
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { messageId, message } = req.body;
  return res.json(messageEditV2(token, messageId, message));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { messageId, reactId } = req.body;
  return res.json(messageUnreactV1(token, messageId, reactId));
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { dmId, message, timeSent } = req.body;
  return res.json(messageSendDmLaterV1(token, dmId, message, timeSent));
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { messageId } = req.body;
  return res.json(messagePinV1(token, messageId));
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, message, timeSent } = req.body;
  return res.json(messageSendLaterV1(token, channelId, message, timeSent));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { dmId, message, timeSent } = req.body;
  return res.json(messageSendDmLaterV1(token, dmId, message, timeSent));
});

app.put('/message/unpin/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { messageId } = req.body;
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { messageId, reactId } = req.body;
  return res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { ogMessageId, channelId, dmId, message } = req.body;
  return res.json(messageShareV1(token, ogMessageId, channelId, dmId, message));
});

// =============================== DM =================================== //
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { uIds } = req.body;
  return res.json(dmCreateV2(token, uIds));
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV2(token, dmId));
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(dmListV2(token));
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { dmId } = req.body;
  return res.json(dmLeaveV2(token, dmId));
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV2(token, dmId, start));
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmRemoveV2(token, dmId));
});

// ============================= USERS ================================= //
app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(usersAllV1(token));
});

// ============================= USER ================================= //
app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const uId = req.query.uId as string;
  return res.json(userProfileV3(token, +uId));
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { nameFirst, nameLast } = req.body;
  return res.json(userProfileSetnameV2(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { email } = req.body;
  return res.json(userProfileSetemailV2(token, email));
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { handleStr } = req.body;
  return res.json(userProfileSethandleV2(token, handleStr));
});

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  return res.json(userProfileUploadPhoto(token, imgUrl, xStart, yStart, xEnd, yEnd));
});
// ============================= USER ================================= //
app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

// =========================== NOTIFICATIONS =============================== //
app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  return res.json(notificationsGetV1(token));
});

// ============================= USER ================================= //
app.get('/search/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const queryStr = req.query.queryStr as string;
  return res.json(searchV1(token, queryStr));
});

// ============================= STANDUP ================================= //
app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, length } = req.body;
  return res.json(standupStartV1(token, channelId, length));
});
app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const channelId = parseInt(req.query.channelId as string);
  return res.json(standupActiveV1(token, channelId));
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const token = tokenFromHeader(req);
  const { channelId, message } = req.body;
  return res.json(standupSendV1(token, channelId, message));
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// =========================== START SERVER =============================== //

// Start the server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
  loadData();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  saveData();
  server.close(() => console.log('Shutting down server gracefully.'));
});
