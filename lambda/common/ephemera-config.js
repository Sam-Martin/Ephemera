exports.config = function(){
	return {
		accessKeyId: 'AKIAJYDONY5Y2FDJJDQA',
		// Name of the bucket to upload to
		bucketName: 'image-upload-smartin',
		bucketRegion: 'eu-west-1',
		successActionRedirect: 'http://google.com',
		s3ACL: "public-read",
		encryptedSecret: "CiCV2KPOX2hYFgn4cGOI8oD2tzSjWrkekeZwn624FdeMGhKwAQEBAgB4ldijzl9oWBYJ+HBjiPKA9rc0o1q5HpHmcJ+tuBXXjBoAAACHMIGEBgkqhkiG9w0BBwagdzB1AgEAMHAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMM5oJtRaUoWFkprWAAgEQgENBGEmpEKkj/K6e5LvbQPwlzwVivvs++euV3pRXlqjo5S1VkdrTuLAt3d2laStMTvdFNYB+x9Uny/g00v1ZpYmo20K+"
	}
}