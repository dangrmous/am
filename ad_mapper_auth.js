/**
 * Created with JetBrains PhpStorm.
 * User: geoff
 * Date: 12/5/13
 * Time: 3:21 PM
 * To change this template use File | Settings | File Templates.
 */

var adMapper = {};


adMapper.clientId = clientId;
adMapper.apiKey = apiKey;
adMapper.scopes = 'https://www.googleapis.com/auth/analytics.readonly';

// This function is called after the Client Library has finished loading
function handleClientLoad() {

    // 1. Set the API Key
    gapi.client.setApiKey(adMapper.apiKey);

    // 2. Call the function that checks if the user is Authenticated. This is defined in the next section
    window.setTimeout(checkAuth, 1);
}

function checkAuth() {
    // Call the Google Accounts Service to determine the current user's auth status.
    // Pass the response to the handleAuthResult callback function
    gapi.auth.authorize({client_id: adMapper.clientId, scope: adMapper.scopes, immediate: true}, handleAuthResult);
}

function handleAuthResult(authResult) {
    if (authResult) {
        // The user has authorized access
        // Load the Analytics Client. This function is defined in the next section.
        createMap();
        loadAnalyticsClient();
    } else {
        // User has not Authenticated and Authorized
        handleUnAuthorized();
    }
}


// Authorized user
function handleAuthorized() {
    var authorizeButton = document.getElementById('authorize-button');
    var profileIdDiv = document.getElementById('profile-id-div');
    var adList = document.getElementById('ad-list');
    var getAdListButton = document.getElementById('get-ad-list');

    // Show the 'Get Visits' button and hide the 'Authorize' button;
    profileIdDiv.style.visibility = '';
    adList.style.display = 'none';
    getAdListButton.style.visibility = '';
    authorizeButton.style.visibility = 'hidden';

    // When the 'Get FB Ads' button is clicked, call the makeApiCall function
    getAdListButton.onclick = queryForAds;

}


// Unauthorized user
function handleUnAuthorized() {
    var authorizeButton = document.getElementById('authorize-button');
    var makeApiCallButton = document.getElementById('make-api-call-button');

    // Show the 'Authorize Button' and hide the 'Get Visits' button

    authorizeButton.style.visibility = '';

    // When the 'Authorize' button is clicked, call the handleAuthClick function
    authorizeButton.onclick = handleAuthClick;
}

function handleAuthClick(event) {
    gapi.auth.authorize({client_id: adMapper.clientId, scope: adMapper.scopes, immediate: false}, handleAuthResult);
    return false;
}

function loadAnalyticsClient() {
    // Load the Analytics client and set handleAuthorized as the callback function
    gapi.client.load('analytics', 'v3', handleAuthorized);
}