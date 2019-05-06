const LineBot = require(__dirname + '/libs/linebot.js');
const underscore = require('underscore');
const underscoreString = require("underscore.string");

export default class HiwaiHubLineBot extends LineBot {
  constructor(applicationName, accessToken) {
    super(applicationName, accessToken);
  }

  async checkConfirmed(user_id) {
    const userData = await this.dynamodb.getPromise("users", {
      user_id: user_id
    });
    return userData.Item && userData.Item[applicationName] === userStatusEnum.confirmed;
  }

  async updateConfirmState(user_id, timestamp) {
    const finsByUserObj = {
      user_id: user_id
    }
    const userData = await dynamodb.getPromise("users", finsByUserObj);
    if (userData.Item) {
      var updateObject = {
        updated_at: timestamp
      }
      updateObject[applicationName] = userStatusEnum.confirmed
      return dynamodb.updatePromise("users", finsByUserObj, updateObject);
    }
    return {};
  }

  generateConfirmMessage() {
    const confirmObject = {
      type: "template",
      altText: "this is a confirm template",
      template: {
        type: "confirm",
        text: "Hiwaihubへようこそ!!\nこのコンテンツはアダルト動画を検索してみることができるものです!!\nあなたは18歳以上ですか?",
        actions: [{
            type: "postback",
            label: "はい",
            data: JSON.stringify({
              confirmed: true,
            }),
          },
          {
            type: "postback",
            label: "いいえ",
            data: JSON.stringify({
              confirmed: false,
            }),
          }
        ]
      }
    }
    return confirmObject;
  }

  generateRichMenuObj(){
    const richMenuObj = {
      size: {
        width: 2500,
        height: 843
      },
      selected: true,
      name: "HiwaiHubController",
      chatBarText: "オプション",
      areas: [{
          bounds: {
            x: 0,
            y: 0,
            width: 2500,
            height: 443
          },
          action: {
            type: "uri",
            label: "本家PronHubに行く",
            uri: "https://www.pornhub.com/"
          }
        },
        {
          bounds: {
            x: 0,
            y: 443,
            width: 833,
            height: 400
          },
          action: {
            type: "uri",
            label: "仮想通貨Vergeを購入する",
            uri: "https://www.binance.com/?ref=16721878"
          }
        },
        {
          bounds: {
            x: 834,
            y: 443,
            width: 833,
            height: 400
          },
          action: {
            type: "uri",
            label: "日本円でBitCoinを購入する",
            uri: "https://bitflyer.jp?bf=3mrjfos1"
          }
        },
        {
          bounds: {
            x: 1667,
            y: 443,
            width: 833,
            height: 400
          },
          action: {
            type: "message",
            label: "Vergeで寄付する",
            text: "D6NkyiFL9rvqu8bjaSaqwD9gr1cwQRbiu6"
          }
        }
      ]
    };
    return richMenuObj;
  }

  convertReplyMessageObj(lineMessageObj, pornhubVideos){
    const messageObj = {
      type: "template",
      altText: lineMessageObj.text + "の検索結果",
      template: {
        type: "carousel",
        columns: underscore.map(pornhubVideos, function (video) {
          return {
            thumbnailImageUrl: video.thumb,
            title: underscoreString(video.title).prune(37).value(),
            text: "再生時間:" + video.duration.toString(),
            defaultAction: {
              type: "uri",
              label: "動画を見る",
              uri: video.url
            },
            actions: [{
              type: "uri",
              label: "動画を見る",
              uri: video.url
            }]
          }
        })
      }
    };

    return messageObj;
  }

  async recordResponseMessage(lineMessageObj, response_object) {
    const insertObject = {
      message_id: lineMessageObj.message.id,
      message_type: lineMessageObj.message.type,
      user_id: lineMessageObj.source.userId,
      reply_token: lineMessageObj.replyToken,
      input_text: lineMessageObj.message.text,
      application_name: applicationName,
      response_object: response_object,
      created_at: lineMessageObj.timestamp
    }

    return this.dynamodb.createPromise("bot_messages", insertObject);
  }
}