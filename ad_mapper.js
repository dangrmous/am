/**
 * Created with JetBrains PhpStorm.
 * User: geoff
 * Date: 12/5/13
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */

adMapper.markers = []; //Array of known Ad Id's, each with an array of markers (if any)
adMapper.colors = [];
adMapper.markerAdded = new Array();

var currentDate = new Date();
var currentMonth = (((currentDate.getMonth() + 1) < 10) ? "0" : "") + (currentDate.getMonth() + 1); //This formats the month with a leading zero if needed, require for GA
var currentDay = (((currentDate.getDate()) < 10) ? "0" : "") + currentDate.getDate();
currentDate.formatted = currentDate.getFullYear() + "-" + currentMonth + "-" + currentDay;


function queryForAds() {

    profile = $("#profile-id").val();
    adMapper.gaProfile = 'ga:' + profile;

    gapi.client.analytics.data.ga.get({
        'ids': adMapper.gaProfile,
        'start-date': '2013-07-01',
        'end-date': currentDate.formatted,
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:medium',
        'filters': 'ga:medium=~[0-9]'
    }).execute(createAdArray);
}

function createAdArray(results) { //creates an array of FB ad ID's
    adMapper.fbAdList = [];
    for (ad in results.rows) {
        adMapper.fbAdList.push(results.rows[ad][0]);
    }

    createAdLists();
}

function createAdLists() {
    $("#map-type-radio").show();
    $("#heatmap").click(function () {
        showHeatmapAdList();
    });
    $("#dots").click(function () {
        showDotsAdList();
    });
    removeAllMarkers();
    $("#ad-list").empty();
    $("#ad-list-heatmap").empty();
    $("span#adListLabel").css("visibility", "");

    for (ad in adMapper.fbAdList) {
        adMapper.colors[adMapper.fbAdList[ad]] = getAColor(ad);
        adMapper.markers[adMapper.fbAdList[ad]] = [];

        $("#ad-list").append('<label for="' + adMapper.fbAdList[ad] + '"> <input id="' + adMapper.fbAdList[ad] + '" type="checkbox" name="'
            + adMapper.fbAdList[ad] + '">' + adMapper.fbAdList[ad] + '<span style="background-color: ' + adMapper.colors[adMapper.fbAdList[ad]] + ';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></label><br>');

        $("#" + adMapper.fbAdList[ad]).click(function () {
            adMapper.adFilters = 'ga:medium==' + this.id;
            adMapper.adNumber = this.id;
            handleDotAdClick();
        });

        //Build the radio button list for heatmap ads

        $("#ad-list-heatmap").append('<input id="' + adMapper.fbAdList[ad] + '-heatmap" type="radio" name="heatmap-radio" value="' + adMapper.fbAdList[ad] + '">'
            + adMapper.fbAdList[ad] + '<br>');
        $("#" + adMapper.fbAdList[ad] + '-heatmap').click(function () {
            adMapper.adFilters = 'ga:medium==' + this.value;
            adMapper.adNumber = this.value;
            handleHeatmapAdClick();
        })

    }


}


function getAColor(index) {
    //Returns a hex color value starting at #D2D2FF and getting more saturated based on index
    h = 15 * index;
    var hslColor = new String;
    hslColor = "hsl(" + h + ",100%,50%)";

    return hslColor;

}

function handleDotAdClick() {
    if ($("input#" + adMapper.adNumber + ":checked").val()) {
        var deferred = $.Deferred();
        getAdViewLocations(adMapper.gaProfile, deferred);
        deferred.done(function (results) {

            handleAdViewLocations(results);
            displayViewsOnMap();
        });

    }

    else {
        removeMarker(adMapper.adNumber);
    }
}

function handleHeatmapAdClick() {
    var deferred = $.Deferred();
    getAdViewLocations(adMapper.gaProfile, deferred);
    deferred.done(function (results) {
        handleAdViewLocations(results);
        displayViewsOnHeatmap();
    });
}

function displayViewsOnHeatmap() {
    removeHeatmap();
    var heatMapArray = [];

    for (rownumber in adMapper.adViews.rows) {

        heatMapArray.push(new google.maps.LatLng(adMapper.adViews.rows[rownumber][0], adMapper.adViews.rows[rownumber][1]));
    }

    adMapper.heatmap = new google.maps.visualization.HeatmapLayer(
        {
            data: heatMapArray
        }
    );

    adMapper.heatmap.set('radius', 25);
    adMapper.heatmap.setMap(adMapper.map);


}

function getAdViewLocations(profileId, deferred) {

    gapi.client.analytics.data.ga.get({
        'ids': profileId,
        'start-date': '2013-11-11',
        'end-date': currentDate.formatted,
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:latitude,ga:longitude',
        'filters': adMapper.adFilters
    }).execute(function (results) {

            deferred.resolve(results);
        });

}

function handleAdViewLocations(results) {

    adMapper.adViews = results;

}

function displayViewsOnMap() {

    if (adMapper.adViews.rows && adMapper.adViews.rows.length) {

        for (rownumber in adMapper.adViews.rows) {

            addMarkerToMap(adMapper.adViews.rows[rownumber][0], adMapper.adViews.rows[rownumber][1]);

        }

    } else {
        console.log('No results found');
    }
}

function showHeatmapAdList() {

    removeAllMarkers();
    $("#ad-list :checkbox").prop('checked', false);
    $("#ad-list").hide();
    $("#ad-list-heatmap").show();
}

function showDotsAdList() {
    removeHeatmap();
    $("#ad-list-heatmap :radio").prop('checked',false);
    $("#ad-list-heatmap").hide();
    $("#ad-list").show();
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

    {
        var latlng = new google.maps.LatLng(latitude, longitude);

        var opts = {
            map: adMapper.map,
            position: latlng,
            icon: { path: google.maps.SymbolPath.CIRCLE,
                fillColor: adMapper.colors[adMapper.adNumber],
                fillOpacity: 1,
                strokeColor: "grey",
                strokeOpacity: 1,
                strokeWeight: 2,
                scale: 3
            }
        }
        var marker = new google.maps.Marker(opts);

        adMapper.markers[adMapper.adNumber].push(marker);
        adMapper.markerAdded.push(adMapper.adNumber);

    }
}


function removeMarker(adNumber) {

    if (adMapper.markers[adNumber].length) {
        for (var i = 0; i < adMapper.markers[adNumber].length; i++) {

            adMapper.markers[adNumber][i].setMap(null);
        }

    }
    adMapper.markers[adNumber] = [];
}

function removeAllMarkers() {

    for (i = 0; i < adMapper.markerAdded.length; i++) {

        removeMarker(adMapper.markerAdded[i]);

    }
}

function removeHeatmap() {
    if (adMapper.heatmap) {
        adMapper.heatmap.setMap(null);
    }
}