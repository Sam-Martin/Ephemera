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
    $('#secretURL').text(secretURL);

    // Clear out the secret field
    $('#secret-text').val('');

    // Slide down the output
    $('#secretOutput').slideDown();
};
$(document).ready(function() {

    populateDom()
});

var populateDom = function() {
    urlVars = getUrlVars();
    if (typeof urlVars != 'undefined' && urlVars.bucket) {

        // if bucket is defined as a GET variable we've just uploaded something
        populateSecretURL(window.location.origin + '?key=' + urlVars.key);
    } else if (typeof urlVars != 'undefined' && window.location.href.match(/getSecret.html/)) {

        // if we don't have a secret key, but we're on getSecret.html, tell the user they can't do anything useful here
        $('#secretOutput').html(`<div class="alert alert-danger" role="alert">
          <strong>Error:</strong>
           No secret key defined. If you\'re trying to upload a secret, you may not have access to do so.</html>
        `);

        // Slide down the output
        $('#secretOutput').slideDown();

    } else if (typeof urlVars != 'undefined' && urlVars.key) {
        getSecret();
    }

    // Upload a string
    $('#text-form').submit(function(ev) {
        ev.preventDefault();
        $('#secret-text').prop('disabled', true);
        getConfig(function(config) {
          var post_addr = config['apiUrl'] + '/addTextSecret'
          console.log(post_addr)
          $.ajax(
                {
                url: post_addr,
                method: 'POST',
                data: JSON.stringify({
                    'secretText': $('#secret-text').val()
                }),
                contentType: "application/json"

            }).done(function(result) {
                $('#secret-text').prop('disabled', false);
                if (result.ErrorMessage) {
                    alert(result.ErrorMessage);
                } else {
                    populateSecretURL(window.location.origin + '?key=' + result.key);
                }
            });
        });
    });
}

var getSecret = function() {
    // if key is defined without bucket then we're retrieving a secret
    var secretArea = $('#pageBody');
    $('#pageSubtitle p').text('Displaying a secret once...');
    secretArea.html('<h1>Loading Secret...</h1>');
    getConfig(function(config) {
        $.get(config.apiUrl + '/getSecret', {
            key: urlVars.key
        }, function(result) {
            secretArea.html('<h1>Secret</h1>');
            if (result.message) {
                secretArea.append(result.message);
            } else {
                secretArea.append("<pre>" + result.secretText + "</pre>");
            }
        }, 'json');
    });
}


var getConfig = function(callback) {
    $.getJSON('js/config.json', callback)
}
