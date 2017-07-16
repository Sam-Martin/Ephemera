console.log('Loading event');
var AWS = require('aws-sdk');
var YAML = require("yamljs");
var s3functions = require('../common/ephemera-s3functions.js');
var config = YAML.load('config.yml');
AWS.config.update({
  region: config.region,
  endpoint: "https://dynamodb."+config.region+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function (event, context,callback) {
  console.log('Loaded handler');
  
  // Generate a UUID for a key
  var bucketKey = s3functions.generateUUID();
  
  var params = {
    TableName: config.dynamodb_table_name,
    Item: {
        SecretID: bucketKey,
        SecretText: event.body.secretText,
        Uploaded: new Date().getTime()
    }
  };

  // Save the text to DynamoDB
  docClient.put(params, function(err, data) {
      if (err) {
        return callback(null, {
          Error: "Unable to add item. Error JSON:" + JSON.stringify(err, null, 2)
        });

      } else {
            console.log("Successfully put " + bucketKey + " into " + config.dynammodb_table_name);
            return callback(null, {
              key: bucketKey
            });
      }
  });
};