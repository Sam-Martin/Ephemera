exports.config = function () {
  return {
    accessKeyId: 'AKIAJ6S2VDLEKDI4TZ2Q',
    // Name of the bucket to upload to
    bucketName: 'smartin-test-beta-public',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://smartin-test-beta-public.s3-website-eu-west-1.amazonaws.com/',
    s3ACL: 'private',
    encryptedSecret: 'CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM3y7tAmcOayRSQoCqAgEQgEP1eWnLOlPtF+5jhUk1yRnf+LBWXkn4bEcX8C4v2+h2q5npHrzy+7g5KLeS60JAyDI4oRoK3CEECxqgTH2jfO06nCT8'
  };
};
