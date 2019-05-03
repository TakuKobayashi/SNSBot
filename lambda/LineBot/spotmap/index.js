const line = require('@line/bot-sdk');

const callLambdaResponse = function (context) {
  const lambdaResponse = {
    statusCode: 200,
    headers: {
      "X-Line-Status": "OK"
    },
    body: JSON.stringify({
      "result": "completed"
    })
  };
  context.succeed(lambdaResponse);
}

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event));
  const linebot = new line.Client({
    channelAccessToken: process.env.ACCESSTOKEN
  });
  for (const lineMessage of event.events) {
    if (lineMessage.type == "follow") {
      //      await linebot.follow(lineMessage.source.userId, lineMessage.timestamp);
      callLambdaResponse(context);
    } else if (lineMessage.type == "unfollow") {
      callLambdaResponse(context);
    } else if (lineMessage.type == "postback") {
      const receiveData = JSON.parse(lineMessage.postback.data);
      console.log(receiveData);
    } else if (lineMessage.type == "message") {
      const replyObj = {
        type: 'text',
        text: lineMessage.message.text
      };
      console.log(lineMessage);
      // use reply API
      const replyed = await linebot.replyMessage(lineMessage.replyToken, replyObj);
      console.log(replyed);
      callLambdaResponse(context);
    }
  }
};