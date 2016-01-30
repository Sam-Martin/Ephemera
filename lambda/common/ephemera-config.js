exports.config = function () {
  return {
    accessKeyId: 'AKIAJHGIKFRVI5CXTVVQ',
    // Name of the bucket to upload to
    bucketName: 'smartin-test-beta-private',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://smartin-test-beta-public.s3-website-eu-west-1.amazonaws.com',
    s3ACL: 'private',
    encryptedSecret: 'CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMf6hEcACOY1YFlCr3AgEQgENaE6LkA63filppZ+lLo6KNNDcSO4nGVgUqkPrTDA9uztZCAZrRanG+bg+o18EXAdnPNzpd6pWgzAEfSpWP5UJ76lIb'
  };
};
