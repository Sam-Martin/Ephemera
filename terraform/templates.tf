resource "template_file" "swagger" {
    filename = "${path.module}/templates/ephemera-swagger-spec.json.tpl"
    vars {
    	lambda_executor_role = "${aws_iam_role.ephemera_lambda_executor_role.arn}"
    	aws_region = "${var.region}"
    	ephemera_getsecret_function_name = "${var.ephemera_getsecret_function_name}"
    	ephemera_addtextsecret_function_name = "${var.ephemera_addtextsecret_function_name}"
    	ephemera_getsignedurl_function_name = "${var.ephemera_getsignedurl_function_name}"
    	aws_account_id = "${var.aws_account_id}"
    	public_bucket_url = "${var.public_bucket_url}"
    	api_gateway_name = "${var.api_gateway_name}"
    }
}
output "swagger" {
    value = "${template_file.swagger.rendered}"
}

resource "template_file" "lambda-config" {
    filename = "${path.module}/templates/ephemera-config.js.tpl"
    vars {
    	ephemera_s3_url_signer_access_key = "${aws_iam_access_key.ephemera_s3_url_signer_key.id}"
    	aws_region = "${var.region}"
    	private_bucket_name = "${var.private_bucket_name}"
    	public_bucket_url = "${var.public_bucket_url}"
    	encrypted_s3_url_signer_secret = "${var.encrypted_s3_url_signer_secret}"
    }
}
output "lambda-config" {
    value = "${template_file.lambda-config.rendered}"
}

resource "template_file" "frontend-config" {
    filename = "${path.module}/templates/frontend_config.js.tpl"
    vars {
    	api_url = "${var.api_url}"
    	private_bucket_name = "${var.private_bucket_name}"
    }
}
output "frontend-config" {
    value = "${template_file.frontend-config.rendered}"
}

output "s3_signer_secret_key" {
	value = "${aws_iam_access_key.ephemera_s3_url_signer_key.secret}"
}

output "api_gateway_id" {
	value = "${var.api_gateway_id}"
}

output "aws_region" {
    value = "${var.region}"
}
output "lambda_role_arn" {
    value = "${aws_iam_role.ephemera_lambda_role.arn}"
}