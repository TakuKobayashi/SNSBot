const HiwaiHubLineBot = require(__dirname + '/hiwaihub_linebot.js');
const Pornsearch = require('pornsearch');

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
  const linebot = new HiwaiHubLineBot(process.env.ACCESSTOKEN);
  for(const lineMessage of event.events){
    if (lineMessage.type == "follow") {
      await linebot.follow(lineMessage.source.userId, lineMessage.timestamp);
      const confirmObj = linebot.generateConfirmMessage();
      const replyed = await linebot.replayMessage(lineMessage.replyToken, confirmObj);
      console.log(replyed);
      callLambdaResponse(context);
    } else if (lineMessage.type == "unfollow") {
      await linebot.unfollow(lineMessage.source.userId, lineMessage.timestamp);
      callLambdaResponse(context);
      //return linebot.unlinkRichMenu(lineMessage.source.userId, process.env.RICHMENUID1);
    } else if (lineMessage.type == "postback") {
      const receiveData = JSON.parse(lineMessage.postback.data);
      if (receiveData.confirmed) {
        await linebot.updateConfirmState(lineMessage.source.userId, lineMessage.timestamp);
        callLambdaResponse(context);
        //return linebot.linkRichMenu(lineMessage.source.userId, process.env.RICHMENUID1)
      } else {
        const confirmObj = linebot.generateConfirmMessage();
        const replyed = await linebot.replayMessage(lineMessage.replyToken, confirmObj);
        console.log(replyed);
        callLambdaResponse(context);
      }
    } else if (lineMessage.type == "message") {
      const confirmed = await linebot.checkConfirmed(lineMessage.source.userId);
      if (!confirmed) {
        const confirmObj = linebot.generateConfirmMessage();
        const replyed = await linebot.replayMessage(lineMessage.replyToken, confirmObj);
        console.log(replyed);
        callLambdaResponse(context);
        continue;
      }

      const searcher = new Pornsearch(keyword);
      const videos = await searcher.videos();
      const videoSamples = underscore.sample(videos, 10);

      const messageObj = linebot.convertReplyMessageObj(lineMessage, videoSamples);
      const replyed = await linebot.replayMessage(lineMessage.replyToken, messageObj);
      console.log(replyed);
      callLambdaResponse(context);
    }
  });
};