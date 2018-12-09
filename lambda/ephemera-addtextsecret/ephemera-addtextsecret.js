console.log('Loading event');
var AWS = require('aws-sdk');
var s3functions = require('../common/ephemera-s3functions.js');
AWS.config.update({
  region: process.env.REGION,
  endpoint: "https://dynamodb."+process.env.REGION+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function (event, context,callback) {

  // Generate a UUID for a key
  var bucketKey = s3functions.generateUUID();
  encrypt(new Buffer(JSON.parse(event.body).secretText,'utf-8')).then(base64EncryptedString => {
    console.log(base64EncryptedString)
    console.log('hello')
    var params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
          SecretID: bucketKey,
          SecretText: base64EncryptedString,
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
  })

};


function encrypt(buffer) {
    const kms = new AWS.KMS({
        region: process.env.REGION,
        endpoint: "https://kms."+process.env.REGION+".amazonaws.com"
    });
    return new Promise((resolve, reject) => {
        const params = {
            KeyId: process.env.KMS_KEY_ID,
            Plaintext: buffer
        };

        kms.encrypt(params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(data.CiphertextBlob);
            }
        });
    });
}
