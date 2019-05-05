const line = require('@line/bot-sdk');

const userStatusEnum = {
  follow: 0,
  unfollow: 1,
}

const DynamoDB = require(__dirname + '/dynamodb.js');
const dynamodb = new DynamoDB();

export default class LineBot {
  constructor(applicationName, accessToken) {
    this.applicationName = applicationName;
    this.lineClient = new line.Client({
      channelAccessToken: accessToken
    });
  }

  async getUserProfile(user_id) {
    return await this.lineClient.getProfile(user_id);
  }

  async follow(user_id, timestamp) {
    const finsByUserObj = {
      user_id: user_id
    }
    const profile = await this.getUserProfile(user_id);
    const userProfileObj = Object.assign({
      userId: user_id
    }, profile);
    const userData = await dynamodb.getPromise("users", finsByUserObj);
    if (userData.Item) {
      const updateObject = {
        updated_at: timestamp
      }
      updateObject[this.applicationName] = userStatusEnum.follow;
      return await dynamodb.updatePromise("users", finsByUserObj, updateObject);
    } else {
      const insertObject = {
        user_id: userProfileObj.userId,
        name: userProfileObj.displayName,
        icon_url: userProfileObj.pictureUrl,
        description: userProfileObj.statusMessage,
        updated_at: timestamp
      }
      insertObject[this.applicationName] = userStatusEnum.follow
      return await dynamodb.createPromise("users", insertObject);
    }
  }

  async unfollow(user_id, timestamp) {
    const finsByUserObj = {
      user_id: user_id
    }
    const userData = await dynamodb.getPromise("users", finsByUserObj);
    if (userData.Item) {
      const updateObject = {
        updated_at: timestamp
      }
      updateObject[this.applicationName] = userStatusEnum.unfollow
      return await dynamodb.updatePromise("users", finsByUserObj, updateObject);
    }
    return null;
  }

  async replayMessage(replyToken, replyObj) {
    return await this.lineClient.replyMessage(replyToken, replyObj);
  }
}