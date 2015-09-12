
var apiUrl = 'https://licotqtmvg.execute-api.eu-west-1.amazonaws.com/staging/v1/getSecretUploadSignature'
var valuesSet
$(document).ready(function () {
    
    $('#file-form').submit(function(ev){
        if(valuesSet){
            return true;
        }
            ev.preventDefault();
        
        $.get(apiUrl,{'Content-Type':$('#file-select')[0].files[0].type}, function(result){
            
            $('#file-form [name=AWSAccessKeyId]').val(result.AWSAccessKeyId)
            $('#file-form [name=key]').val(result.key)
            $('#file-form [name=acl]').val(result.acl)
            $('#file-form [name=success_action_redirect]').val(result.success_action_redirect)
            $('#file-form [name=policy]').val(result.policy)
            $('#file-form [name=signature]').val(result.signature)
            $('#file-form [name=Content-Type]').val(result['Content-Type'])
            valuesSet = true
            $('#file-form').submit();
            valuesSet = false;
        })
    })
}); 