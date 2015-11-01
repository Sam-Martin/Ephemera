variable "access_key" {}
variable "secret_key" {}
variable "region" {default = "eu-west-1"}
variable "aws_account_id" {}


variable "private_bucket_name" {}
variable "public_bucket_name" {}
variable "public_bucket_url" {default = "http://test.s3-websiteeu-west-1.amazonaws.com"}


variable "ephemera_s3_url_signer" {default = "EphemeraS3Signer"}
variable "lambda_role_name" {default = "EphemeraLambda"}
variable "lambda_executor_role_name" {default = "EphemeraLambdaExecutor"}
variable "ephemera_lambda_zip" {default = "..\ephemera.zip"}

variable "upload_secret_ip_whitelist" {default = <<EOF
"aws:SourceIp": "0.0.0.0/0"
EOF
}
variable "retrieve_secret_ip_whitelist" {default = <<EOF
"aws:SourceIp": "0.0.0.0/0"
EOF
}

variable "ephemera_getsecret_function_name" {default = "ephemera-getsecret"}
variable "ephemera_addtextsecret_function_name" {default = "ephemera-addtextsecret"}
variable "ephemera_getsignedurl_function_name" {default = "ephemera-getsignedurl"}