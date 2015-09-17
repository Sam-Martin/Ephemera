resource "aws_lambda_function" "ephemera-getsignedurl" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "ephemera-getsignedurl"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-getsignedurl/ephemera-getsignedurl.handler"
}

resource "aws_lambda_function" "ephemera-addtextsecret" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "ephemera-addtextsecret"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-addtextsecret/ephemera-addtextsecret.handler"
}

resource "aws_lambda_function" "ephemera-getsecret" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "ephemera-getsecret"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-getsecret/ephemera-getsecret.handler"
}