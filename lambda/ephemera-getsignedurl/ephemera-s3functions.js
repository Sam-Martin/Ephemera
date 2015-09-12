var aws = require('aws-sdk');
var sts = new aws.STS();
var crypto = require("crypto")
  , util = require("util");


module.exports = {
  
  // Stolen from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  generateUUID: function() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  },

  // Stolen from https://gist.github.com/radekg/2163005
  pad: function(n) {
    if ((n+"").length == 1) {
      return "0" + n;
    }
    return ""+n;
  },

  generateS3ExpiryDate: function(validityPeriody) {
    var now = new Date();
    var date = new Date( now.getTime() + (validityPeriody) );
    var ed = date.getFullYear() + "-" + module.exports.pad(date.getMonth()+1) + "-" + module.exports.pad(date.getDate());
    ed += "T" + module.exports.pad(date.getHours()) + ":" + module.exports.pad(date.getMinutes()) + ":" + module.exports.pad(date.getSeconds()) + ".000Z";
    return ed;
  },

  generateS3PolicyString: function( bucketName, bucketKey, contentType, expiryDate, s3ACL, successActionRedirect){
     return '{\n    "expiration": "' + expiryDate + '",\n'
          + '   "conditions": [\n'
          + '       {"bucket": "' + bucketName + '"},'
          + '       {"key": "' + bucketKey + '"},'
          + '       {"acl": "' + s3ACL + '"},'
          + '       {"success_action_redirect": "' +successActionRedirect + '"},'
          + '       {"Content-Type": "' + contentType + '"}]\n}';
  },

  base64PolicyString: function(policyString){
    return new Buffer(policyString).toString('base64').replace(/\n|\r/, '');
  },

  signS3Policy: function(policyBase64, secretKey){
  
    var hmac = crypto.createHmac("sha1", secretKey);
    var hash2 = hmac.update(policyBase64);
    var signature = hmac.digest(encoding="base64");
    return signature;
  },

  GenerateOutput: function(params,returnFunction){
      var context = params.context
     // Assume the role we're executing under again so that we can access the secret key
    sts.assumeRole({RoleArn:params.roleArn,RoleSessionName:"test"},function(err,data){
      if(err){
        console.log(err);
        context.fail("Error: " + JSON.stringify(err));
      }
      //var ContentType = event['Content-Type'];
      console.log("loaded role " + params.roleArn + " successfully");

      //var accessKeyId = data.Credentials.AccessKeyId;
      //var secretAccessKey = data.Credentials.SecretAccessKey;

      var bucketKey = module.exports.generateUUID();
      var s3PolicyBase64 = module.exports.base64PolicyString(module.exports.generateS3PolicyString( params.bucketName, bucketKey, params.contentType,
         module.exports.generateS3ExpiryDate(60*1000), params.s3ACL, params.successActionRedirect));
      var s3Signature = module.exports.signS3Policy(s3PolicyBase64, params.secretAccessKey);

      returnFunction({
        "key":bucketKey, 
        "AWSAccessKeyId":params.accessKeyId,
        "acl": params.s3ACL,
        "success_action_redirect": params.successActionRedirect,
        "policy": s3PolicyBase64,
        "signature": s3Signature,
        "Content-Type": params.contentType
      })
    })
  }
}