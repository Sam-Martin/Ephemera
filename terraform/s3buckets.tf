resource "aws_s3_bucket" "private_s3_bucket" {
    bucket = "${var.private_bucket_name}"
    acl = "private"

    tags {
        Name = "Ephemera private bucket"
        Environment = "Dev"
    }
}

resource "aws_s3_bucket" "public_s3_bucket" {
    bucket = "${var.public_bucket_name}"
    acl = "public"

    tags {
        Name = "Ephemera public bucket"
        Environment = "Dev"
    }
}