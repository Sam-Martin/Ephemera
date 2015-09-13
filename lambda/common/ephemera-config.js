exports.config = function () {
  return {
    accessKeyId: 'AKIAJLZ5URQYUOWBAEHA',
    // Name of the bucket to upload to
    bucketName: 'ephemera-upload',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://google.com',
    s3ACL: 'private',
    encryptedSecret: 'CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMfsOHNviGR7j4Br1DAgEQgEPuFHNkbdL/fhYEJTrrJA1kQoXgLNCAtey1paDBAy63ZSTU/frR+wWiGEvPxMYhfZKZ1xA00+DsIuglRaFWX6vSlVig'
  };
};