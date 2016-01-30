exports.config = function () {
  return {
    accessKeyId: 'AKIAILPS6G7S6YQ4AUMA',
    // Name of the bucket to upload to
    bucketName: 'smartin-test-beta-private',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://smartin-test-beta-public.s3-website-eu-west-1.amazonaws.com',
    s3ACL: 'private',
    encryptedSecret: 'CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMLWekeLEUKFuSvYm1AgEQgENc6Ue9oJZqHQgZo3EL7cJiyuKjOYH+W5PIDhv1nGCR23w6xFYOtKXUaVcHvijGRh8GobE5Di5FcQ7PAhqvtJFgahYW'
  };
};
