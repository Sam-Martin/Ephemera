properties {
    if(!$stage){
        $global:stage = 'dev';
    }else{
        $global:stage = $stage;
    }
}
task default -depends prerequisites,build, deploy-serverless, configure-frontend, deploy-s3bucketcontents, test

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
    if(!(Get-Command 'Invoke-Pester' -EA SilentlyContinue)){
        throw "Pester not found! Please run 'Install-Module -name pester'"
    }
    Write-Verbose "Pre-requisites checked successfully"
}

task build {
    Push-Location lambda
    npm install
    Pop-Location
}

task deploy-serverless {
    
    Push-Location serverless-ephemera
    serverless deploy --stage $stage
    Pop-Location
}

task configure-frontend {
    Push-Location serverless-ephemera
    $ServerlessInfo = &"serverless" "info" "--stage" $stage | Out-String
    Pop-Location
    
    $ServerlessInfo -match 'POST - (?<url>.*/v2)' | Out-Null
    $APIUrl = $Matches.url
    
    Write-Verbose "Configuring frontend_config.js to reflect api url of '$APIUrl'";
    Set-Content .\frontend\js\frontend_config.js -Value "`$.apiUrl = '$APIUrl';"
}

task deploy-s3bucketcontents { 
    $ConfigFile = Get-Content 'serverless-ephemera\config.yml' | Out-String
    $Config = ConvertFrom-Yaml -Yaml $ConfigFile
    $PublicFiles = Get-ChildItem frontend -Recurse | ?{!$_.psiscontainer}
    foreach ($File in $PublicFiles) {
        $RelativePath = $File.fullname -replace [Regex]::Escape($PSScriptRoot+'\frontend'), ''
        Write-Verbose "Uploading $file to $RelativePath in $($config.public_bucket_name)"
	    Write-S3Object -BucketName $Config.public_bucket_name -File $file.fullname -Key $RelativePath -Region $Config.region -CannedACLName public-read
    }

}

task test {
    $testResultsFile = 'TestsResults.xml'
    $testResults = Invoke-Pester -OutputFormat NUnitXml -OutputFile $testResultsFile -PassThru
    
    if ($env:APPVEYOR){
        Write-Host "Uploading test results to AppVeyor..."
        (New-Object 'System.Net.WebClient').UploadFile("https://ci.appveyor.com/api/testresults/nunit/$($env:APPVEYOR_JOB_ID)", (Resolve-Path $testResultsFile))
    }
    
    if ($testResults.FailedCount -gt 0) {
        $testResults | Format-List
        Write-Error -Message 'One or more Pester tests failed. Build cannot continue!'
    }
}

task destroy {
    $ConfigFile = Get-Content 'serverless-ephemera\config.yml' | Out-String
    $Config = ConvertFrom-Yaml -Yaml $ConfigFile

    while(Get-S3Object -BucketName $config.public_bucket_name | Remove-S3Object -Force -region $config.region -BucketName $config.public_bucket_name){
       Write-Host "Deleting objects from public s3 bucket..."
    }

    while(Get-S3Object -BucketName $config.private_bucket_name | Remove-S3Object -Force -region $config.region -BucketName $config.private_bucket_name){
       Write-Host "Deleting objects from private s3 bucket..."
    }

    Push-Location serverless-ephemera
    serverless remove --stage $stage
    Pop-Location
}
   
