resource "aws_iam_access_key" "lb" {
    user = "${aws_iam_user.ephemera_s3_url_signer.name}"
}

resource "aws_iam_user" "ephemera_s3_url_signer" {
    name = "${var.ephemera_s3_url_signer.name}"
    path = "/system/"
}

resource "aws_iam_user_policy" "ephemera_s3_url_signer_policy" {
    name = "${aws_iam_user.ephemera_s3_url_signer.name}-policy"
    user = "${aws_iam_user.ephemera_s3_url_signer.name}"
    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1440938489000",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject*"
            ],
            "Resource": [
                "arn:aws:s3:::${var.private_bucket_name}",
                "arn:aws:s3:::${var.private_bucket_name}/*"
            ]
        }
    ]
}
EOF
}




resource "aws_iam_role" "ephemera_lambda_role" {
    name = "${var.lambda_role_name}"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "ephemera_lambda_role_s3Uploader" {
    name = "${var.lambda_role_name}-s3Uploader"
    role = "${aws_iam_role.ephemera_lambda_role.id}"
    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1440938489000",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject*",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::${var.private_bucket_name}",
                "arn:aws:s3:::${var.private_bucket_name}/*",
                "arn:aws:s3:::${var.public_bucket_name}",
                "arn:aws:s3:::${var.public_bucket_name}/*"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "ephemera_lambda_role_logger" {
    name = "${var.lambda_role_name}-s3Uploader"
    role = "${aws_iam_role.ephemera_lambda_role.id}"
    policy = <<EOF
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Action": [ 
        "logs:*"
      ],
      "Effect": "Allow", 
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
} 
EOF
}


resource "aws_iam_role" "ephemera_lambda_executor_role" {
    name = "${var.lambda_executor_role_name}"
    assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "ephemera_lambda_s3_uploader" {
    name = "${var.lambda_role_name}-s3Uploader"
    role = "${aws_iam_role.ephemera_lambda_executor_role.id}"
    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1442056373000",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "Stmt1442056419000",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
EOF
}