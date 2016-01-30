exports.config = function () {
  return {
    accessKeyId: '${ephemera_s3_url_signer_access_key}',
    // Name of the bucket to upload to
    bucketName: '${private_bucket_name}',
    bucketRegion: '${aws_region}',
    successActionRedirect: '${public_bucket_url}',
    s3ACL: 'private',
    encryptedSecret: '${encrypted_s3_url_signer_secret}'
  };
};