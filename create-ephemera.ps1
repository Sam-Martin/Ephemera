# Stolen from http://ctrlf5.net/?p=263 and http://www.dailycoding.com/posts/convert_image_to_base64_string_and_base64_string_to_image.aspx
function ConvertFrom-StringToMemoryStream{
    param(
        [parameter(Mandatory)]
        [string]$InputString
    )
    $stream = New-Object System.IO.MemoryStream;
    $writer = New-Object System.IO.StreamWriter($stream);
    $writer.Write($InputString);
    $writer.Flush();
    return $stream
}

function ConvertFrom-Base64toMemoryStream{
    param(
        [parameter(Mandatory)]
        [string]$Base64Input
    )

    [byte[]]$bytearray = [System.Convert]::FromBase64String($Base64Input)
    $stream = New-Object System.IO.MemoryStream($bytearray,0,$bytearray.Length)
    return $stream
}

function ConvertFrom-StreamToBase64{
    param(
        [parameter(Mandatory)]
        [System.IO.MemoryStream]$inputStream
    )
    $reader = New-Object System.IO.StreamReader($inputStream);
    $inputStream.Position = 0;
    return  [System.Convert]::ToBase64String($inputStream.ToArray())
}


function ConvertFrom-StreamToString{
    param(
        [parameter(Mandatory)]
        [System.IO.MemoryStream]$inputStream
    )
    $reader = New-Object System.IO.StreamReader($inputStream);
    $inputStream.Position = 0;
    return $reader.ReadToEnd()
}

function ZipFiles
{
    param( $zipfilename, $sourcedir )
    Add-Type -Assembly System.IO.Compression.FileSystem 
    $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir,
        $zipfilename, $compressionLevel, $true) 
}

# Get the params we need
$swaggerImporterPath = Read-Host "Path to aws swagger importer"
$kmsKeyID = Read-Host "KMS Key ID"
$global:terraformVars = @()

# Unset logging level so we can capture our outputs
$env:TF_LOG = ''

# Check the output folder exists
if(!(Test-Path $PSScriptRoot\output)){New-Item $PSScriptRoot\output -ItemType container}

Push-Location $PSScriptRoot\terraform

# Do the initial create with placeholders
Invoke-Expression -Command "terraform apply" -ErrorAction Stop
if($LASTEXITCODE -ne 0){throw "Error executing terraform"}

# Encrypt the S3 user's API Secret Key for use in signing URLs
$APISecretKey = terraform output s3_signer_secret_key
$encryptedOutput = (ConvertFrom-StreamToBase64 -inputStream $(Invoke-KMSEncrypt -KeyId $kmsKeyID -Plaintext $(ConvertFrom-StringToMemoryStream $APISecretKey) -region us-east-1).CiphertextBlob)
$global:terraformVars += "-var 'encrypted_s3_url_signer_secret=$encryptedOutput'"

# Populate the lambda config
Invoke-Expression -Command "terraform apply $($global:terraformVars -join ' ')"  -ErrorAction Stop
$lambdaConfig = terraform output lambda-config
$lambdaConfig | Set-Content $PSScriptRoot\lambda\common\ephemera-config.js 

# Create the lambda zip
Remove-Item $PSScriptRoot\ephemera.zip -Force -ErrorAction SilentlyContinue
ZipFiles -zipfilename $PSScriptRoot\ephemera.zip -sourcedir $PSScriptRoot\lambda\

# Taint the lambda functions so they get recreated
terraform taint aws_lambda_function.ephemera-getsignedurl
terraform taint aws_lambda_function.ephemera-addtextsecret
terraform taint aws_lambda_function.ephemera-getsecret

# Recreate the lambda functions with the new config
Invoke-Expression -Command "terraform apply $($global:terraformVars -join ' ')" -ErrorAction Stop

# Populate the swagger file
$swaggerFile = terraform output swagger
$swaggerFile | Set-Content -Path $PSScriptRoot\output\ephemera-swagger-spec.json


# Cleanup any old api gateways
$global:apiID = terraform output api_gateway_id
if($apiID -ne 'placeholder'){
    Remove-AGRestApi -RestApiId $global:apiID -Force -ErrorAction SilentlyContinue 
}

# Execute the swagger importer to create the api gateway
Write-Host "Creating new API Gateway" -ForegroundColor Red
Push-Location $swaggerImporterPath
$swaggerImporterOutput = Invoke-Expression "$swaggerImporterPath\aws-api-import.cmd  -c $PSScriptRoot\output\ephemera-swagger-spec.json" -ErrorAction Stop
$swaggerImporterOutput
if($LASTEXITCODE -ne 0){throw "Error creating API"}

# Extract the api ID and add it to the global terraform vars
$swaggerImporterOutput | %{$_ -match "api id \w{10,10}"} | Out-Null
$apiID = $matches[$matches.length-1] -replace 'api id ',''
$global:terraformVars += "-var 'api_gateway_id=$apiID'"

Pop-Location

# Update terraform with the API ID
$(Get-Content "$PSScriptRoot\terraform\terraform.tfvars" | Where-Object {$_ -notmatch 'api_gateway_id' -and $_ -notmatch "api_url"}) | Set-Content "$PSScriptRoot\terraform\terraform.tfvars"
"api_gateway_id = `"$apiID`"" | Add-Content "$PSScriptRoot\terraform\terraform.tfvars"
"api_url = `"https://$apiID.execute-api.$(terraform output aws_region).amazonaws.com/prod/v1`"" | Add-Content "$PSScriptRoot\terraform\terraform.tfvars"
Invoke-Expression -Command "terraform apply $($global:terraformVars -join ' ')"  -ErrorAction Stop
if($LASTEXITCODE -ne 0){throw "Error executing terraform"}


# Publish the API Gateway
New-AGDeployment -RestApiId $apiID -StageName "prod" -ErrorAction Stop | Out-Null

# Generate frontend config
terraform output frontend-config | Set-content $PSScriptRoot\output\frontend_config.js -Force -ErrorAction SilentlyContinue
$global:terraformVars += "-var 'frontend_config_location=output\frontend_config.js'"

# Upload the latest files
Invoke-Expression -Command "terraform apply $($global:terraformVars -join ' ')"  -ErrorAction Stop
if($LASTEXITCODE -ne 0){throw "Error executing terraform"}

Pop-Location
