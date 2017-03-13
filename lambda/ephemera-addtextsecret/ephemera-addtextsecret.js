console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var YAML = require("yamljs");
var s3functions = require('../common/ephemera-s3functions.js');
var config = YAML.load('config.yml');
exports.handler = function (event, context,callback) {
  console.log('Loaded handler');
  // Generate a UUID for a key
  var bucketKey = s3functions.generateUUID();
  // Upload the object to s3
  s3.putObject({
    Bucket: config.private_bucket_name,
    Key: bucketKey,
    ACL: config.s3ACL,
    Body: event.body.secretText,
    ContentDisposition: 'inline',
    ContentType: 'text/plain'
  }, function (err, data) {
    if (err) {
      callback(new Error('Error adding object to bucket ' + config.private_bucket_name + ' - ' + JSON.stringify(err)));
      return;
    }
    console.log("Successfully put " + bucketKey + " into " + config.private_bucket_name);
    callback(null, {
      key: bucketKey,
      bucketName: config.private_bucket_name,
      bucketRegion: config.region,
      objectURL: 'https://s3-' + config.region + '.amazonaws.com/' + config.private_bucket_name + '/' + bucketKey
    });
  });
};