let data = {
  sessions: [
    {
      token: string,
      authUserId: number,
    }
  ],
  users: [
    {
      uId: number,
      nameFirst: string,
      nameLast: string,
      password: string,
      email: string,
      handleStr: string,
      permissionId: number,
    }
  ],
  channels: [
    {
      channelId: number,
      name: string,
      messages: number[],
      allMembers: number[],
      ownerMembers: number[],
      isPublic: boolean
    }
  ],
  messages: [
    {
      uId: number,
      messageId: number,
      channelId: number,
      dmId: number,
      message: string,
      timesSent: number,
    }
  ],
  dms: [
    {

    }
  ],
}
