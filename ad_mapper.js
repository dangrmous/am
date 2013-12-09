/**
 * Created with JetBrains PhpStorm.
 * User: geoff
 * Date: 12/5/13
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */

adMapper.markers = [];

function makeApiCall() {
    queryAccounts();
}

function queryAccounts() {
    console.log('Querying Accounts.');

    // Get a list of all Google Analytics accounts for this user
    gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}

function handleAccounts(results) {
    if (!results.code) {
        if (results && results.items && results.items.length) {

            // Get the first Google Analytics account
            var firstAccountId = results.items[0].id;

            // Query for Web Properties
            queryWebproperties(firstAccountId);

        } else {
            console.log('No accounts found for this user.')
        }
    } else {
        console.log('There was an error querying accounts: ' + results.message);
    }
}

function queryWebproperties(accountId) {
    console.log('Querying Webproperties.');

    // Get a list of all the Web Properties for the account
    gapi.client.analytics.management.webproperties.list({'accountId': accountId}).execute(handleWebproperties);
}

function handleWebproperties(results) {
    if (!results.code) {
        if (results && results.items && results.items.length) {
            console.log("results length is: " + results.items.length);


            console.log('Result of web properties query: ');
            console.dir(results);


            // Get the first Google Analytics account
            var firstAccountId = results.items[0].accountId;

            // Get the first Web Property ID
            var firstWebpropertyId = results.items[0].id;

            // Query for Views (Profiles)
            queryProfiles(firstAccountId, firstWebpropertyId);

        } else {
            console.log('No webproperties found for this user.');
        }
    } else {
        console.log('There was an error querying webproperties: ' + results.message);
    }
}

function queryProfiles(accountId, webpropertyId) {
    console.log('Querying Views (Profiles).');

    // Get a list of all Views (Profiles) for the first Web Property of the first Account
    gapi.client.analytics.management.profiles.list({
        'accountId': accountId,
        'webPropertyId': webpropertyId
    }).execute(getAdViewLocations(adMapper.gaProfile));
}

function queryForAds() {
    facebookAdId = $("#ad-id").val();

    profile = $("#profile-id").val();
    adMapper.gaProfile = 'ga:' + profile;
    console.log('queryForAds has profile id value: ' + adMapper.gaProfile);
    gapi.client.analytics.data.ga.get({
        'ids': adMapper.gaProfile,
        'start-date': '2013-11-11',
        'end-date': '2013-12-12',
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:medium',
        'filters': 'ga:medium=~[0-9]'
    }).execute(createAdList);
}


function createAdList(results) {
    adMapper.fbAdList = new Array();
    console.log('createAdList results:');
    console.dir(results);
    for (ad in results.rows) {
        adMapper.fbAdList.push(results.rows[ad][0]);
        $("#ad-list").append('<label for="' + results.rows[ad][0] + '"> <input id="' + results.rows[ad][0] + '" type="checkbox" name="'
            + results.rows[ad][0] + '">' + results.rows[ad][0] + '</label><br>');

        $("#" + results.rows[ad][0]).click(function () {
            adMapper.adFilters = 'ga:medium==' + this.id;
            adMapper.adNumber = this.id;
            adMapper.markers[adMapper.adNumber] = new Array ();
            handleAdClick();
        });

        console.log (adMapper.markers[adMapper.adNumber]);

    }

    console.log('fbAdList is: ' + adMapper.fbAdList);

}

function handleAdClick() {
    if ($("input#" + adMapper.adNumber + ":checked").val()) {
        makeApiCall();
    }

    else {
        removeMarker(adMapper.adNumber);
    }
}

function getAdViewLocations(profileId) {
    console.log("getAdViewLocations called");
    console.log("adMapper.adFilters is: " + adMapper.adFilters);
    console.log('profileId in getAdViewLocations ' + profileId);


    console.log('Querying Core Reporting API.');

    // Use the Analytics Service Object to query the Core Reporting API
    gapi.client.analytics.data.ga.get({
        'ids': profileId,
        'start-date': '2013-11-11',
        'end-date': '2013-12-12',
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:latitude,ga:longitude',
        'filters': adMapper.adFilters
    }).execute(handleCoreReportingResults);
}

function handleCoreReportingResults(results) {
    if (results.error) {
        console.log('There was an error querying core reporting API: ' + results.message);
    } else {
        printResults(results);
    }
}

function printResults(results) {
    if (results.rows && results.rows.length) {
        console.dir(results);
        console.log('View (Profile) Name: ', results.profileInfo.profileName);
        for (rownumber in results.rows) {
            //console.log('Latitude: ' + results.rows[rownumber][0] + ' Longitude: ' + results.rows[rownumber][1]);
            addMarkerToMap(results.rows[rownumber][0], results.rows[rownumber][1]);

        }

    } else {
        console.log('No results found');
    }
}

function createMap() {
    var latlng = new google.maps.LatLng(39.114221, -94.626805);
    var mapOpts = {
        zoom: 4,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    adMapper.map = new google.maps.Map(document.getElementById("map_canvas"), mapOpts);

}

function addMarkerToMap(latitude, longitude) {
    console.log("addMarkerToMap called");
    //if ((latitude != 0) && (longitude != 0))
    {
        var latlng = new google.maps.LatLng(latitude, longitude);
        var opts = {
            map: adMapper.map,
            position: latlng
        }
        var marker = new google.maps.Marker(opts);
        console.log("addMarkerToMap called. Value of adMapper.adNumber is: " + adMapper.adNumber);

        adMapper.markers[adMapper.adNumber].push(marker);
        console.log("adMapper.markers[adMapper.adNumber is: ]" + adMapper.markers[adMapper.adNumber]);
    }
}

function removeMarker(adNumber) {
    console.log("removeMarker called with adNumber value: " + adNumber);
    if (adMapper.markers[adNumber].length) {
        for (var i = 0; i < adMapper.markers[adNumber].length; i++) {

            adMapper.markers[adNumber][i].setMap(null);
        }

    }
    adMapper.markers[adNumber] = [];
}