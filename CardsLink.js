// ==UserScript==
// @name        CardsLink
// @version     1.0
// @author      Dankinations
// @description Whenever a card is mentioned in chat, highlight it!
// @homepage    https://github.com/Dankinations/CardsLink
// @supportURL  https://github.com/elytrafae/CardsLink
// @match       https://*.undercards.net/*
// @updateURL   https://github.com/Dankinations/CardsLink/releases/latest/download/CardsLink.js
// @downloadURL https://github.com/Dankinations/CardsLink/releases/latest/download/CardsLink.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

let en;
let cardNames;
const underscript = window.underscript;
const plugin = underscript.plugin("CardsLink", GM_info.version);

// Checking for added stuff in body

function handleChatMessage(message) {
    var content = message.innerText
    for (key in cardNames){
        split = cardNames[key].split("|")
        cardName = split[1]
        let regex = new RegExp(`\\b${cardName}\\b`, 'gi');
        if (content.match(regex)) {
            console.log("matches")
            span = `<span onmouseover="displayCardHelp(this,${key}, false);" onmouseleave="removeCardHover();" class="PATIENCE">${content.match(regex)[0]}</span>`
            content = content.replace(regex, span);
        }
    }
    message.innerHTML = content
}

function chatInstanceAdded(node) {

    function chatObserverCallback(mutationsList, observer) {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.classList.contains("message-group")) {
                        plugin.events.emit(":onChatMessage",{instance:node.getElementsByClassName("chat-message")[0]});
                    }   
                }
            }
        });
    }

    const bodyObserver = new MutationObserver(chatObserverCallback);
    const config = { childList: true };
    bodyObserver.observe(node.getElementsByClassName("chat-messages")[0], config);

}

function bodyObserverCallback(mutationsList, observer) {
    mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList') {
            for (let node of mutation.addedNodes) {
                if (node.classList.contains("chat-box")) {
                    chatInstanceAdded(node);
                }
            }
        }
    });
}

const bodyObserver = new MutationObserver(bodyObserverCallback);
const config = { childList: true };
bodyObserver.observe(document.body, config);

plugin.events.on(":onChatMessage", (data) => {
    handleChatMessage(data.instance)
})

plugin.events.on(':preload', () => {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json'
    xhr.open("GET","https://undercards.net/translation/en.json")
    xhr.onload = function() {
        if (xhr.status == 200) {
            en = xhr.response;
            cardNames = [];
            for (key in en) {
                if (key.match("card-name")) {
                    var idx = Number(key.replace("card-name-",""));
                    cardNames[idx] = en[key];
                }
            }
        }
    }
    xhr.send();
});