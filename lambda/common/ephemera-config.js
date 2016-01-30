exports.config = function () {
  return {
    accessKeyId: 'AKIAJE7HMRR77HE5FQ6A',
    // Name of the bucket to upload to
    bucketName: 'smartin-test-beta-private',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://smartin-test-beta-public.s3-website-eu-west-1.amazonaws.com',
    s3ACL: 'private',
    encryptedSecret: 'CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMvCpwEzJr1DRH6D3+AgEQgEOHES69s/sZuYhDciVodbr9xuohsNA6RkUJgZJHQyEsltou+7HXtf3yyt53Xa/U96h9MAogUM/dsCtwUL0iMgYQ/0B0'
  };
};
