/**
 * Created with JetBrains PhpStorm.
 * User: geoff
 * Date: 12/5/13
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */


console.log ("API key in ad_mapper.js is: " + adMapper.apiKey);

function queryForAds() {
    facebookAdId = $("#ad-id").val();
                adMapper.adFilters = 'ga:medium==' + facebookAdId;
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


function getAdViewLocations(profileId) {
    console.log ("getAdViewLocations called");
    console.log('profileId in getAdViewLocations ' + profileId);


    console.log('Querying Core Reporting API.');

    // Use the Analytics Service Object to query the Core Reporting API
    gapi.client.analytics.data.ga.get({
        'ids': 'ga:' + profileId,
        'start-date': '2013-11-11',
        'end-date': '2013-12-12',
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:latitude,ga:longitude',
        'filters': adMapper.adFilters
    }).execute(handleCoreReportingResults);
}

function createAdList(results) {
    adMapper.fbAdList = new Array();
    console.log('createAdList results:');
    console.dir(results);
    for(ad in results.rows){
        adMapper.fbAdList.push(results.rows[ad][0]);
        $("#ad-list").append('<label for="' + results.rows[ad][0] + '"> <input id="' + results.rows[ad][0] + '" type="checkbox" name="'
            + results.rows[ad][0] + '">' + results.rows[ad][0] + '</label><br>');
        $("#" + results.rows[ad][0]).click(function(){getAdViewLocations(results.rows[ad][0])});

    }
    console.log('fbAdList is: ' + adMapper.fbAdList);

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
        //createMap();
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
    //if ((latitude != 0) && (longitude != 0))
    {
        var latlng = new google.maps.LatLng(latitude, longitude);
        var opts = {
            map: adMapper.map,
            position: latlng
        }
        var marker = new google.maps.Marker(opts);
    }
}