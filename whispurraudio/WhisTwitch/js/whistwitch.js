// var chanName = "{{chanName}}";
// var imgSize = "{{imgsizeDropdown}}";

let userCurrency,
    userLocale = "en-US",
    showName = false,
    dataFields = [],
    fieldData,
    twitchChannel,
    twitchGameImgSize,
    twitchChannelURL,
    removeSelector,
    addition,
    customNickColor,
    hideBadges,
    provider;
let totalMessages = 0;
let messagesLimit = 0;
let nickColor = "user";
let animationIn = "bounceIn";
let animationOut = "bounceOut";
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];

let loadTwitchGameData = (url, imgSize) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    var res = xmlHttp.responseText;
    $("#nowPlayingName").html(res);
    // document.getElementById("nowPlayingName").textContent = res;

    var encoded =
        "https://static-cdn.jtvnw.net/ttv-boxart/" + encodeURI(res) + imgSize;

    $("#nowPlayingArt").attr("src", encoded);
    // document.getElementById("nowPlayingArt").src = encoded;
};

let updateEvent = (data, eventType, field) => {
    $(field.textElementID).html(field.eventText);
    if (showName) {
        if (typeof data[eventType] === undefined) return;
        if (!data[eventType]["name"].length) return;
        if (eventType.indexOf("tip") !== -1) {
            $(field.valueElementID).html(
                data[eventType]["name"] +
                    " " +
                    data[eventType]["amount"].toLocaleString(userLocale, {
                        style: "currency",
                        currency: userCurrency,
                    })
            );
        } else if (
            eventType.indexOf("subscriber-resub-latest") !== -1 ||
            eventType.indexOf("subscriber-latest") !== -1
        ) {
            $(field.valueElementID)
                .html(data[eventType]["name"])
                .toLocaleString(userLocale);
        } else if (
            eventType.indexOf("subscriber-gifted") !== -1
        ) {
            $(field.valueElementID)
                .html(
                    data[eventType]["sender"] +
                        '<span style="font-weight: 300"> ×' +
                        data[eventType]["amount"] +
                        "</div>"
                )
                .toLocaleString(userLocale);
        } else if (
            eventType.indexOf("sub") !== -1 ||
            eventType.indexOf("cheer") !== -1
        ) {
            $(field.valueElementID)
                .html(
                    data[eventType]["name"] +
                        '<span style="font-weight: 300"> ×' +
                        data[eventType]["amount"] +
                        "</div>"
                )
                .toLocaleString(userLocale);
        } else if (
            eventType.indexOf("raid") !== -1 ||
            eventType.indexOf("host") !== -1
        ) {
            $(field.valueElementID)
                .html(
                    data[eventType]["name"] + " ×" + data[eventType]["amount"]
                )
                .toLocaleString(userLocale);
        } else {
            $(field.valueElementID).html(data[eventType]["name"]);
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
            $(field.valueElementID).html(
                count.toLocaleString(userLocale, {
                    style: "currency",
                    currency: userCurrency,
                })
            );
        } else {
            $(field.valueElementID).html(count.toLocaleString(userLocale));
        }
    }
};

let getLabelFieldData = (labelNumber, fieldData) => {
    var labelFieldData = {
        eventText: fieldData["label" + labelNumber + "Text"],
        eventType: fieldData["label" + labelNumber + "Type"],
        eventPeriod: fieldData["label" + labelNumber + "Period"],
        valueElementID: "#label" + labelNumber + "Value",
        textElementID: "#label" + labelNumber + "Text",
    };
    return labelFieldData;
};

function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text.replace(/([^\s]*)/gi, function (m, key) {
        let result = data.filter((emote) => {
            return html_encode(emote.name) === key;
        });
        if (typeof result[0] !== "undefined") {
            let url = result[0]["urls"][1];
            if (provider === "twitch") {
                return `<img class="emote" " src="${url}"/>`;
            } else {
                if (typeof result[0].coords === "undefined") {
                    result[0].coords = { x: 0, y: 0 };
                }
                let x = parseInt(result[0].coords.x);
                let y = parseInt(result[0].coords.y);

                let width = "{emoteSize}px";
                let height = "auto";

                if (provider === "mixer") {
                    if (result[0].coords.width) {
                        width = `${result[0].coords.width}px`;
                    }
                    if (result[0].coords.height) {
                        height = `${result[0].coords.height}px`;
                    }
                }
                return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
            }
        } else return key;
    });
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function addMessage(username, badges, message, isAction, uid, msgId) {
    totalMessages += 1;
    let actionClass = "";
    if (isAction) {
        actionClass = "action";
    }
    const element = $.parseHTML(`
    <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated" id="msg-${totalMessages}">
        <div class="user-box ${actionClass}">${
        badges == "yes" ? badges : ""
    }${username}</div>
        <div class="user-message ${actionClass}">${message}</div>
    </div>`);
    if (addition === "append") {
        if (hideAfter !== 999) {
            $(element)
                .appendTo(".chat-container")
                .delay(hideAfter * 1000)
                .queue(function () {
                    $(this)
                        .removeClass(animationIn)
                        .addClass(animationOut)
                        .delay(1000)
                        .queue(function () {
                            $(this).remove();
                        })
                        .dequeue();
                });
        } else {
            $(element).appendTo(".chat-container");
        }
    } else {
        if (hideAfter !== 999) {
            $(element)
                .prependTo(".chat-container")
                .delay(hideAfter * 1000)
                .queue(function () {
                    $(this)
                        .removeClass(animationIn)
                        .addClass(animationOut)
                        .delay(1000)
                        .queue(function () {
                            $(this).remove();
                        })
                        .dequeue();
                });
        } else {
            $(element).prependTo(".chat-container");
        }
    }

    if (totalMessages > messagesLimit) {
        removeRow();
    }
}

function removeRow() {
    if (!$(removeSelector).length) {
        return;
    }
    if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(removeSelector).dequeue();
        } else {
            $(removeSelector)
                .addClass(animationOut)
                .delay(1000)
                .queue(function () {
                    $(this).remove().dequeue();
                });
        }
        return;
    }

    $(removeSelector).animate(
        {
            height: 0,
            opacity: 0,
        },
        "slow",
        function () {
            $(removeSelector).remove();
        }
    );
}

window.addEventListener("DOMContentLoaded", (event) => {
    setInterval(function () {
        loadTwitchGameData(twitchChannelURL, twitchGameImgSize);
    }, 15000);
});

window.addEventListener("onSessionUpdate", function (obj) {
    const data = obj.detail.session;
  console.log("Session Data");
  console.log(data)
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

window.addEventListener("onEventReceived", function (obj) {
  console.log(obj.detail);
    if (obj.detail.event.listener === "widget-button") {
        if (obj.detail.event.field === "testMessage") {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message",
                    event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod",
                            },
                            nick: twitchChannel,
                            userId: "100135110",
                            displayName: twitchChannel,
                            displayColor: "#5B99FF",
                            badges: [
                                {
                                    type: "moderator",
                                    version: "1",
                                    url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                    description: "Moderator",
                                },
                                {
                                    type: "partner",
                                    version: "1",
                                    url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                                    description: "Verified",
                                },
                            ],
                            channel: twitchChannel,
                            text: "Howdy! My name is Bill and I am here to serve Kappa",
                            isAction: !1,
                            emotes: [
                                {
                                    type: "twitch",
                                    name: "Kappa",
                                    id: "25",
                                    gif: !1,
                                    urls: {
                                        1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                        2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                        4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0",
                                    },
                                    start: 46,
                                    end: 50,
                                },
                            ],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142",
                        },
                        renderedText:
                            'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">',
                    },
                },
            });
            window.dispatchEvent(emulated);
        }
        return;
    }
    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        $(`.message-row[data-msgid=${msgId}]`).remove();
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const sender = obj.detail.event.userId;
        $(`.message-row[data-sender=${sender}]`).remove();
        return;
    }

    if (obj.detail.listener !== "message") return;
    let data = obj.detail.event.data;
    if (data.text.startsWith("!") && hideCommands === "yes") return;
    if (ignoredUsers.indexOf(data.nick) !== -1) return;
    let message = attachEmotes(data);
    let badges = "",
        badge;
    if (provider === "mixer") {
        data.badges.push({ url: data.avatar });
    }
    for (let i = 0; i < data.badges.length; i++) {
        badge = data.badges[i];
        badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
    }
    let username = data.displayName + ":";
    if (nickColor === "user") {
        const color =
            data.displayColor !== ""
                ? data.displayColor
                : "#" + md5(username).slice(26);
        username = `<span style="color:${color}">${username}</span>`;
    } else if (nickColor === "custom") {
        const color = customNickColor;
        username = `<span style="color:${color}">${username}</span>`;
    } else if (nickColor === "remove") {
        username = "";
    }
    addMessage(
        username,
        badges,
        message,
        data.isAction,
        data.userId,
        data.msgId
    );
});

window.addEventListener("onWidgetLoad", function (obj) {
    const data = obj.detail.session.data;
    userCurrency = obj.detail.currency.code;
    fieldData = obj.detail.fieldData;
    twitchGameImgSize = fieldData.twitchPosterSize;
    twitchChannel = fieldData.twitchChannelName;
    twitchChannelURL = "https://decapi.me/twitch/game/" + twitchChannel;

    loadTwitchGameData(twitchChannelURL, twitchGameImgSize);

    Array.apply(null, { length: 4 })
        .map(Number.call, Number)
        .forEach((number) => {
            dataFields.push(getLabelFieldData(number + 1, fieldData));
        });
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

    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    hideBadges = fieldData.hideBadges;
    fetch(
        "https://api.streamelements.com/kappa/v2/channels/" +
            obj.detail.channel.id +
            "/"
    )
        .then((response) => response.json())
        .then((profile) => {
            provider = profile.provider;
        });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector =
            ".message-row:nth-child(n+" + (messagesLimit + 1) + ")";
    } else {
        addition = "append";
        removeSelector =
            ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")";
    }

    ignoredUsers = fieldData.ignoredUsers
        .toLowerCase()
        .replace(" ", "")
        .split(",");
});
