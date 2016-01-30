exports.config = function () {
  return {
    accessKeyId: 'AKIAILPS6G7S6YQ4AUMA',
    // Name of the bucket to upload to
    bucketName: 'smartin-test-beta-private',
    bucketRegion: 'eu-west-1',
    successActionRedirect: 'http://smartin-test-beta-public.s3-website-eu-west-1.amazonaws.com',
    s3ACL: 'private',
    encryptedSecret: 'CiCGkuKeBRDpoYXzr/AFCoCS8ocdC/lnJT/R8TGgWdAebxKwAQEBAgB4hpLingUQ6aGF86/wBQqAkvKHHQv5ZyU/0fExoFnQHm8AAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMbuXn5IU49Ql6zA1CAgEQgENcCYEqBJGZKdtcBqS384bfIOpV2fa+oDfGGuM+dytuVkWyKTX2ySljPjuMqKckN0YdJvRKexCP/bq7FK69cDAYsUKC'
  };
};
