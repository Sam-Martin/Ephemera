resource "aws_s3_bucket_object" "indexHTML" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "index.html"
    source = "${path.module}/../frontend/index.html"
    content_type = "text/html"
}

resource "aws_s3_bucket_object" "getSecretHTML" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "getSecret.html"
    source = "${path.module}/../frontend/getSecret.html"
    content_type = "text/html"
}

resource "aws_s3_bucket_object" "main-js" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "js/main.js"
    source = "${path.module}/../frontend/js/main.js"
    content_type = "text/plain"
}

resource "aws_s3_bucket_object" "config-js" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "js/frontend_config.js"
    source = "${path.module}/../${var.frontend_config_location}"
    content_type = "text/plain"
}

resource "aws_s3_bucket_object" "ephemera-logo" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "img/ephemera-log-no-background.png"
    source = "${path.module}/../frontend/img/ephemera-log-no-background.png"
    content_type = "image/png"
}

resource "aws_s3_bucket_object" "github-logo" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "img/GitHub-Mark-Light-120px-plus.png"
    source = "${path.module}/../frontend/img/GitHub-Mark-Light-120px-plus.png"
    content_type = "image/png"
}

resource "aws_s3_bucket_object" "ephemeracss" {
    bucket = "${aws_s3_bucket.public_s3_bucket.id}"
    key = "css/ephemera.css"
    source = "${path.module}/../frontend/css/ephemera.css"
    content_type = "text/plain"
}