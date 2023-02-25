// var chanName = "{{chanName}}";
// var imgSize = "{{imgsizeDropdown}}";

let userCurrency,
    userLocale = "en-US",
    showName = false,
    fieldData;

var dataFields = [
    {
        eventType: "subscriber-latest",
        eventPeriod: "total",
        elementID: "#newSubscriberValue",
    },
    {
        eventType: "follower-latest",
        eventPeriod: "total",
        elementID: "#newFollowerValue",
    },
    {
        eventType: "subscriber-alltime-gifter",
        eventPeriod: "total",
        elementID: "#topSubGifterValue",
    },
    {
        eventType: "cheer-monthly-top-donator",
        eventPeriod: "month",
        elementID: "#topCheererValue",
    },
];

var chanName = "whispurraudio";
var imgSize = "-136x190.jpg";

var url = "https://decapi.me/twitch/game/" + chanName;

function loadXMLDoc() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    var res = xmlHttp.responseText;
    document.getElementById("nowPlayingName").textContent = res;

    var game = res;
    var encoded =
        "https://static-cdn.jtvnw.net/ttv-boxart/" + encodeURI(game) + imgSize;

    document.getElementById("nowPlayingArt").src = encoded;
}

let updateEvent = (data, eventType, field) => {
    if (showName) {
        if (typeof data[eventType] === undefined) return;
        if (!data[eventType]["name"].length) return;
        if (eventType.indexOf("tip") !== -1) {
            $(field.elementID).html(
                data[eventType]["name"] +
                    " " +
                    data[eventType]["amount"].toLocaleString(userLocale, {
                        style: "currency",
                        currency: userCurrency,
                    })
            );
        } else if (eventType.indexOf("subscriber-resub-latest") !== -1) {
            $(field.elementID)
                .html(data[eventType]["name"])
                .toLocaleString(userLocale);
        } else if (
            eventType.indexOf("sub") !== -1 ||
            eventType.indexOf("cheer") !== -1
        ) {
            $(field.elementID)
                .html(
                    data[eventType]["name"] + " ✕" + data[eventType]["amount"]
                )
                .toLocaleString(userLocale);
        } else if (
            eventType.indexOf("raid") !== -1 ||
            eventType.indexOf("host") !== -1
        ) {
            $(field.elementID)
                .html(
                    data[eventType]["name"] + " ✕" + data[eventType]["amount"]
                )
                .toLocaleString(userLocale);
        } else {
            $(field.elementID).html(data[eventType]["name"]);
        }
    } else {
        let count = 0;
        if (typeof data[eventType] !== "undefined") {
            if (
                field["eventPeriod"] === "goal" ||
                field["eventType"] === "cheer" ||
                field["eventType"] === "tip" ||
                field["eventType"] === "subscriber-points"
            ) {
                count = data[eventType]["amount"];
            } else {
                count = data[eventType]["count"];
            }
        }
        if (field["eventType"] === "tip") {
            $(field.elementID).html(
                count.toLocaleString(userLocale, {
                    style: "currency",
                    currency: userCurrency,
                })
            );
        } else {
            $(field.elementID).html(count.toLocaleString(userLocale));
        }
    }
};

window.addEventListener("onSessionUpdate", function (obj) {
    const data = obj.detail.session;
    updateEvent(data);
});

window.addEventListener("onWidgetLoad", function (obj) {
    // document.addEventListener("DOMContentLoaded", function () {
    loadXMLDoc();
    setInterval(loadXMLDoc, 15000);

    const data = obj.detail.session.data;
    userCurrency = obj.detail.currency.code;
    fieldData = obj.detail.fieldData;
    dataFields.forEach((field) => {
        var eventType = field.eventType + "-" + field.eventPeriod;
        if (field.eventType.indexOf("-") !== -1) {
            if (field.eventType !== "subscriber-points") {
                showName = true;
            }
            eventType = field.eventType;
        }
        updateEvent(data, eventType, field);
    });
});
