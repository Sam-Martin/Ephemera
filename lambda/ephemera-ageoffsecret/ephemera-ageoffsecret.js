console.log('loading event');
var AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.REGION,
  endpoint: "https://dynamodb."+process.env.REGION+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  console.log('Loaded handler');

  var now = new Date();
  var params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      FilterExpression:"Uploaded <= :uploaded",
      ExpressionAttributeValues: {
        ":uploaded": now.setHours(now.getHours() - process.env.MAX_SECRET_AGE_HOURS)
      }
  };

  docClient.scan(params, function(err, data) {
    if (err) {
        console.error("Unable to search for expired items. Error JSON:", JSON.stringify(err, null, 2));
    }
    data.Items.forEach(function (item) {
      params = {
         TableName: process.env.DYNAMODB_TABLE_NAME,
         Key: {
           "SecretID": item.SecretID
          }
      }
      docClient.delete(params, function(err, data) {
         if (err) {
          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          return
         }
         console.log(data)
      })
    })
    console.log(data)
  })

}
