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
console.log("currentDate.formatted = " + currentDate.formatted);

function queryForAds() {

    profile = $("#profile-id").val();
    adMapper.gaProfile = 'ga:' + profile;
    //console.log('queryForAds has profile id value: ' + adMapper.gaProfile);
    gapi.client.analytics.data.ga.get({
        'ids': adMapper.gaProfile,
        'start-date': '2013-11-11',
        'end-date': currentDate.formatted,
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:medium',
        'filters': 'ga:medium=~[0-9]'
    }).execute(createAdArray);
}

function createAdArray(results){ //creates an array of FB ad ID's
    adMapper.fbAdList = [];
    for (ad in results.rows){
        adMapper.fbAdList.push(results.rows[ad][0]);
    }
    //console.log('fbAdList is: ' + adMapper.fbAdList);
    createAdLists();
}

function createAdLists() {
    $("#map-type-radio").show();
    $("#heatmap").click(function(){
        showHeatMap();
    });
    $("#dots").click(function(){
        showDotsMap();
    });
    removeAllMarkers();
    $("#ad-list").empty();
    $("#ad-list-heatmap").empty();
    $("span#adListLabel").css("visibility", "");
    //adMapper.fbAdList = new Array();
    //console.log('createAdLists results:');
    //console.dir(results);
    for (ad in adMapper.fbAdList) {
        adMapper.colors[adMapper.fbAdList[ad]] = getAColor(ad);
        adMapper.markers[adMapper.fbAdList[ad]] = [];
        //adMapper.markers[results.rows[ad][0]].color = getAColor(ad);
        //adMapper.fbAdList.push(results.rows[ad][0]);
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
        $("#" + adMapper.fbAdList[ad] + '-heatmap').click(function(){
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
    //console.log("Index was: " + index + " and color string is: " + hslColor);
    return hslColor;

}

function handleDotAdClick() {
    if ($("input#" + adMapper.adNumber + ":checked").val()) {
        getAdViewLocations(adMapper.gaProfile);

    }

    else {
        removeMarker(adMapper.adNumber);
    }
}

function handleHeatmapAdClick(){

}

function getAdViewLocations(profileId) {

    adMapper.test = gapi.client.analytics.data.ga.get({
        'ids': profileId,
        'start-date': '2013-11-11',
        'end-date': currentDate.formatted,
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:latitude,ga:longitude',
        'filters': adMapper.adFilters
    }).execute(handleAdViewLocations);

}

function handleAdViewLocations(results){
    console.log("adMapper.test is:");
    console.dir(adMapper.test);
    adMapper.adViews = results;
    console.log("adMapper.adViews is:");
    console.dir(adMapper.adViews);
    console.dir("adMapper.adViews is: " + adMapper.adViews);
    displayViewsOnMap();
}

function displayViewsOnMap() {
    console.log("displayViewsOnMap called");
    if (adMapper.adViews.rows && adMapper.adViews.rows.length) {
        //console.dir(results);
        //console.log('View (Profile) Name: ', results.profileInfo.profileName);
        for (rownumber in adMapper.adViews.rows) {
            //console.log('Latitude: ' + results.rows[rownumber][0] + ' Longitude: ' + results.rows[rownumber][1]);
            addMarkerToMap(adMapper.adViews.rows[rownumber][0], adMapper.adViews.rows[rownumber][1]);

        }

    } else {
        console.log('No results found');
    }
}

function showHeatMap(){
    console.log("showHeatMap called");
    removeAllMarkers();
    $("#ad-list").hide();
    $("#ad-list-heatmap").show();
}

function showDotsMap(){
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
    //console.log("addMarkerToMap called");
    //if ((latitude != 0) && (longitude != 0))
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
        //console.log("addMarkerToMap called. Value of adMapper.adNumber is: " + adMapper.adNumber);

        adMapper.markers[adMapper.adNumber].push(marker);
        adMapper.markerAdded.push(adMapper.adNumber);
        //console.log("adMapper.markers[adMapper.adNumber is: ]");
        //console.dir(adMapper.markers[adMapper.adNumber]);
    }
}

function removeMarker(adNumber) {
    //console.log("removeMarker called with adNumber value: " + adNumber);
    //console.log("Value of adMapper.markers is: ");
    //console.dir(adMapper.markers);
    if (adMapper.markers[adNumber].length) {
        for (var i = 0; i < adMapper.markers[adNumber].length; i++) {

            adMapper.markers[adNumber][i].setMap(null);
        }

    }
    adMapper.markers[adNumber] = [];
}

function removeAllMarkers() {
    //console.log("removeAllMarkers called. adMapper.markerAdded is: ");
    //console.dir(adMapper.markerAdded);
    for (i = 0; i < adMapper.markerAdded.length; i++) {

        removeMarker(adMapper.markerAdded[i]);

    }
}