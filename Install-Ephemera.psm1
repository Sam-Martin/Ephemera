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

function Get-Base64KMSEncryptedString{
    param(
        [Parameter(Mandatory=$true)]
        [string]$inputString,
        [Parameter(Mandatory=$true)]
        [string]$kmsKeyID,
        [Parameter(Mandatory=$true)]
        [string]$kmsRegion
    )
    $InputStream = $(Invoke-KMSEncrypt -KeyId $kmsKeyID -Plaintext $(ConvertFrom-StringToMemoryStream $inputString) -region $kmsRegion).CiphertextBlob;
    return ConvertFrom-StreamToBase64 -inputStream $InputStream
}

function Invoke-Terraform{
    param(
        [Parameter(Mandatory=$true)]
        [string]$action,
        [Parameter(Mandatory=$true)]
        [string]$TerraformConfigPath,
        [Parameter(Mandatory=$false)]
        [string[]]$TerraformArgs=''
    )
    
    # Unset Terraform logging level so we can capture our outputs
    $env:TF_LOG = ''

    Push-Location $TerraformConfigPath
    
    switch($action){
        "apply" {
            $result = Invoke-Expression -Command "terraform apply $($TerraformArgs -join ' ')" -ErrorAction Stop
        }
        "output" {
            $result = Invoke-Expression -Command "terraform output $($TerraformArgs -join ' ')"  -ErrorAction Stop
        }
        "taint" {
            $result = Invoke-Expression -Command "terraform taint $($TerraformArgs -join ' ')" -ErrorAction Stop
        }
    }
    
    Pop-Location

    if($LASTEXITCODE -ne 0){throw "Error executing terraform"}
    return $result
}

function Invoke-AWSSwaggerImporter{
    param(
        [Parameter(Mandatory=$true)]
        [string]$swaggerImporterPath,
        [Parameter(Mandatory=$true)]
        [string]$swaggerSpecificationPath,
        [Parameter(Mandatory=$true)]
        [string]$action
    )
    switch($action){
        "create" {
            $result = Invoke-Expression "$swaggerImporterPath\aws-api-import.cmd -c $swaggerSpecificationPath" -ErrorAction Stop
        }
    }
    if($LASTEXITCODE -ne 0){throw "Error executing AWS Swagger importer`r`n$result"}

    return $result
}