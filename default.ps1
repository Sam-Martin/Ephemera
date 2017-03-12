task default -depends prerequisites,deploy-serverless,deploy-s3bucketcontents

task prerequisites {
    if(!(Get-Command 'npm')){
        throw "NPM not found! Please install nodejs"
    }
    if(!(Get-Command 'serverless' -EA SilentlyContinue)){
        throw "serverless not found! Please run 'npm install serverless'"
    }
    if(!(Get-Command 'Write-S3Object' -EA SilentlyContinue)){
        throw "AWS cmdlets not found! Please install AWS PowerShell cmdlets"
    }
    if(!(Get-Command 'ConvertFrom-YAML' -EA SilentlyContinue)){
        throw "Powershell-Yaml not found! Please run 'Install-Module -Name powershell-yaml'";
    }
    Write-Verbose "Pre-requisites checked successfully"
}

task deploy-serverless {
    
    Push-Location serverless-ephemera
    serverless deploy
    Pop-Location
}

task configure-frontend {
    Push-Location serverless-ephemera
    $ServerlessInfo = &"serverless" "info" | Out-String
    Pop-Location
    
    $ServerlessInfo -match 'POST - (?<url>.*/v1)' | Out-Null
    $APIUrl = $Matches.url
    
    Write-Verbose "Configuring frontend_config.js to reflect api url of '$APIUrl'";
    Set-Content .\frontend\js\frontend_config.js -Value "`$.apiUrl = '$APIUrl';"
}

task deploy-s3bucketcontents{ 
    $ConfgFile = Get-Content 'serverless-ephemera\config.yml' | Out-String
    $config = ConvertFrom-Yaml -Yaml $ConfgFile
    $publicFiles = Get-ChildItem frontend -Recurse | ?{!$_.psiscontainer}
    foreach ($file in $publicFiles) {
        $RelativePath = $file.fullname -replace [Regex]::Escape($PSScriptRoot+'\frontend'), ''
        Write-Verbose "Uploading $file to $RelativePath in $($config.public_bucket_name)"
	    Write-S3Object -BucketName $config.public_bucket_name -File $file.fullname -Key $RelativePath -Region $config.region -CannedACLName public-read
    }

}
   