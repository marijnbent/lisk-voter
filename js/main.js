var VERSION = 0.1;
var DELEGATENAME_AUTHOR = "liskfaucets";
var HOST = "http://45.76.35.175:7000";
var voteForAuthor;
var passphrase;
var secondPassphrase;
var delegateDatabase = [];
var publicKeys = [];
var offset = 0;
var requests = 0;
var publicKeyArrays = [];

$(function () {
    $("#vote-form").submit(function (event) {
        event.preventDefault();
        generateDelegateDatabase();
        passphrase = $('#inputPassphrase').val();
        secondPassphrase = $('#inputPassphrase2').val();
        $('.voting').hide();
        $('.console').show();
        $('.submit').prop('disabled', 'true');
    });
});


/**
 * Generate internal database with all delegates (top 1000)
 */
function generateDelegateDatabase() {
    addToConsole("Generating delegate database...");
    for (var y = 0; y < 1000; y = y + 100) {
        requests--;
        $.get(HOST + "/api/delegates?limit=100&offset=" + y)
            .done(function (data) {
                for (var e = 0; e < data['delegates'].length; e++) {
                    delegateDatabase.push(data['delegates'][e]);
                }
                requests++;
                if (requests === 0) loopVotes();
            });
    }
}

/**
 * Loop through internal database and find public keys
 */
function loopVotes() {
    addToConsole("Database generated");
    var votes = $('#list-of-votes').val().split('\n');
    addToConsole("Vote list generated");
    while (votes.length > 0) {
        addToConsole('Getting information for ' + votes[0]);
        for (var x = 0; x < delegateDatabase.length; x++) {
            if (delegateDatabase[x]['username'] === votes[0]) {
                publicKeys.push("+" + delegateDatabase[x]['publicKey']);
                addToConsole('Public key for ' + votes[0] + ' is found.');
                votes.splice(0, 1);
                break;
            }
        }
        if (votes.length == 0) split();
    }
}

function generateVotedDatabase () {

}

/**
 * Splits array into chunks of 33
 */
function split() {
    addToConsole("All info collected.");
    //TODO: Check already voted

    //Split in chunks of 33 votes
    console.log(publicKeys);
    while (publicKeys.length > 0)
        publicKeyArrays.push(publicKeys.splice(0, 33));
    vote();
}

/**
 * Send PUT request for each batch of 33 votes
 */
function vote() {
    for (var i = 0; i < publicKeyArrays.length; i++) {
        var data;
        if (secondPassphrase != "") {
            data = {"secret": passphrase, "secondSecret": secondPassphrase, "delegates": publicKeyArrays[i]}
        } else {
            data = {"secret": passphrase, "delegates": publicKeyArrays[i]}
        }
        console.log(data);
        console.log(passphrase);
        console.log(publicKeyArrays[i]);

        $.ajax({
            url: HOST + '/api/accounts/delegates',
            type: 'PUT',
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(result) {
                console.log('Success: ' + result.success);
                if (result.success == true) {
                  addToConsole('Successfully voted');
                } else {
                  addToConsole('Vote not successfull. Please check the console of your browser and ask for help on lisk.chat');
                }
            }
        });
    }
}

/**
 * Add text to the console
 * @param string
 */
function addToConsole(string) {
    $('#vote-console').append('<p>' + string + '</p>');
}
