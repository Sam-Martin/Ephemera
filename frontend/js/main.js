var isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

// Stolen from http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var populateSecretURL = function(secretURL) {
    $('#secretURL').val(secretURL);

    // Clear out the secret field
    $('#secretText').val('');

    // Slide down the output
    $('#secretUrlOutput').slideDown();
};
$(document).ready(function() {

    populateDom()
});

var populateDom = function() {
    urlVars = getUrlVars();
    if (typeof urlVars != 'undefined' && urlVars.bucket) {
        populateSecretURL(window.location.origin + '?key=' + urlVars.key);
    } else if (typeof urlVars != 'undefined' && urlVars.key) {
        getSecret();
    }
    // Enable copy to clipboard
    $('#copySecretURL').click(function(){copyToClipboard('secretURL')})
    $('#copySecretOutput').click(function(){copyToClipboard('secretOutput')})

    if(isiOSDevice){
      $('#copySecretURL').hide()
    }

    // Upload a string
    $('#textForm').submit(uploadSecret);
}

function copyToClipboard(id){
  console.log(id)

  var el = document.getElementById(id);
  console.log($(el).val())
  el.select();
  document.execCommand('copy');
}

function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

var uploadSecret = function(ev) {
    ev.preventDefault();
    if ($('#secretText').val().length == 0) {
        return
    }
    $('#secretText').prop('disabled', true);
    $('#textForm  > :submit').prop('disabled', true).val('Please Wait...');
    getConfig(function(config) {
        var post_addr = config['apiUrl'] + '/addTextSecret'
        $.ajax({
            url: post_addr,
            method: 'POST',
            data: JSON.stringify({
                'secretText': $('#secretText').val()
            }),
            contentType: "application/json"
        }).done(function(result) {
            $('#secretText').prop('disabled', false);
            $('#textForm > :submit').prop('disabled', false).val('Submit');
            if (result.ErrorMessage) {
                alert(result.ErrorMessage);
            } else {
                populateSecretURL(window.location.origin + '?key=' + result.key);
            }
        });
    });
}

var getSecret = function() {
    $('#secretInput').hide()
    var secretArea = $('#secretDisplay');
    $('#pageSubtitle p').text('Displaying a secret once...');
    secretArea.show();
    $('#title > div >  h1').text('Loading Secret...');
    getConfig(function(config) {
        $.get(config.apiUrl + '/getSecret', {
            key: urlVars.key
        }, function(result) {
            $('#title > div >  h1').text('Secret');
            if (result.message) {
                $('#secretOutput').replaceWith(
                  $('<div class="alert alert-danger" role="alert"/>')
                    .text(result.message).prepend($('<strong>').text('Error: '))
                );
            } else {
                $('#secretOutput').text(result.secretText);
                auto_grow(document.getElementById('secretOutput'))
                if(!isiOSDevice){
                  $('#copySecretOutput').show();
                }
            }
        }, 'json');
    });
}


var getConfig = function(callback) {
    $.getJSON('js/config.json', callback)
}
