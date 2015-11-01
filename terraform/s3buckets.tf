resource "aws_s3_bucket" "private_s3_bucket" {
    bucket = "${var.private_bucket_name}"
    acl = "private"

    tags {
        Name = "Ephemera private bucket"
    }
}

resource "aws_s3_bucket" "public_s3_bucket" {
    bucket = "${var.public_bucket_name}"
    acl = "public-read"
    policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[{
    "Sid":"AddPerm",
        "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${var.public_bucket_name}/*"
      ]
    }
  ]
}
EOF
    website {
        index_document = "index.html"
        error_document = "error.html"
    }
    tags {
        Name = "Ephemera public bucket"
    }
}