console.log('Loading event');
var AWS = require('aws-sdk');
var s3functions = require('../common/ephemera-s3functions.js');
AWS.config.update({
  region: process.env.REGION,
  endpoint: "https://dynamodb."+process.env.REGION+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function (event, context,callback) {
  console.log('Loaded handler');

  // Generate a UUID for a key
  var bucketKey = s3functions.generateUUID();
  console.log(event)
  var params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
        SecretID: bucketKey,
        SecretText: JSON.parse(event.body).secretText,
        Uploaded: new Date().getTime()
    }
  };

  // Save the text to DynamoDB
  docClient.put(params, function(err, data) {
      if (err) {
        return callback(null, {
          headers: {
            "Access-Control-Allow-Origin" : "*"
          },
          statusCode: 500,
          isBase64Encoded: false,
          body: JSON.stringify({message: "Failed to insert record to database"})
        });

      } else {
            console.log("Successfully put " + bucketKey + " into " + process.env.DYNAMODB_TABLE_NAME);
            callback(null, {
              headers: {
                "Access-Control-Allow-Origin" : "*"
              },
              statusCode: 200,
              isBase64Encoded: false,
              body: JSON.stringify({key: bucketKey})
            });
      }
  });
};
