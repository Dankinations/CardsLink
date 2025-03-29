// ==UserScript==
// @name        CardsLink
// @version     1.0.6
// @author      Dankinations
// @description Stylising chat (Requires underscript)
// @homepage    https://github.com/Dankinations/CardsLink
// @supportURL  https://github.com/Dankinations/CardsLink
// @match       https://*.undercards.net/*
// @updateURL   https://github.com/Dankinations/CardsLink/releases/latest/download/CardsLink.user.js
// @downloadURL https://github.com/Dankinations/CardsLink/releases/latest/download/CardsLink.user.js
// @grant       none
// @icon        https://www.google.com/s2/favicons?sz=64&domain=undercards.net
// @require https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @require https://raw.githubusercontent.com/Dankinations/DLib/refs/heads/main/Externals/Checker.js
// @run-at      document-idle
// ==/UserScript==

let allCards;
var cardNames = [];
var cardAliases = {
    "8": "mommy",
    "30": "bp",
    "38": "rg1",
    "39": "rg2",
    "60": "paps",
    "62": "asdree",
    "64": "mttex mtt ex",
    "66": "wtf",
    "68": "achance",
    "69": "fmemory",
    "71": "fenergy",
    "82": "merchire",
    "88": "btreat",
    "89": "pgas polgas pollgas pollugas",
    "92": "fon",
    "95": "tow",
    "106": "undyne the undying",
    "110": "mttneo mtt neo",
    "117": "of",
    "140": "polibear",
    "145": "db1",
    "146": "db2",
    "150": "ncg",
    "183": "pod",
    "201": "dmtt",
    "203": "aod",
    "214": "casdyne",
    "237": "phamster moni!!!",
    "239": "snowsign",
    "254": "cpaps",
    "258": "bq",
    "262": "mmm",
    "267": "crystomb ctomb",
    "296": "wormjar wormsjar jow",
    "299": "polibear",
    "315": "rg3",
    "316": "rg4",
    "318": "falvin",
    "414": "pmascot",
    "421": "astruck asstruck",
    "437": "shyagent sagent ralsei neo",
    "453": "cotg",
    "455": "phouse",
    "471": "cblaster",
    "490": "pod",
    "503": "libloox",
    "504": "blancer",
    "505": "skris",
    "508": "hoodsei hsei",
    "515": "hhathy",
    "520": "absart abs art",
    "531": "ttoriel",
    "532": "etdb",
    "533": "gertomb gtomb",
    "573": "elimduck elim duck",
    "579": "bqueen",
    "581": "gmascot",
    "642": "pblook",
    "661": "cws cyber sign",
    "673": "bplush",
    "700": "vb",
    "707": "captn rouxl",
    "714": "cjester",
    "716": "rpaps",
    "717": "sneo",
    "726": "pkris",
    "734": "cwire",
    "742": "cg1",
    "743": "cg2",
    "754": "fheads",
    "756": "spamshop sshop",
    "758": "bneo",
    "760": "butsei",
    "761": "bstatue",
    "763": "cpanel",
    "767": "bdancer baldancer balancer",
    "772": "jfs",
    "773": "shytomb stomb",
    "774": "dlancer dancer",
    "775": "galadino",
    "776": "tlights",
    "782": "talphys",
    "794": "gq",
    "815": "dalvdrobe",
    "828": "mommy",
    "838": "zmartlet",
    "848": "sansino csans",
    "853": "chutomb ctomb",
    "869": "galadino"
};
const underscript = window.underscript;
const plugin = underscript.plugin("CardsLink", GM_info.version);

// Settings

const types = [
    'array', // stores an array of strings
    'boolean', // default
    'color', // color selector
    'list', // drag-drop list items
    'map', // key -> value list
    'password', // hidden input box
    'remove', // deletes itself when selected
    'select', // drop down menu
    'slider', // sliding bar
    'text', // input box
];

const AliasesEnabled = plugin.settings().add({
    key: "AliasesEnabled",
    name: "Link Cards Using Aliases",
    type: "boolean",
    note: "Determines whether card aliases should be highlighted in chat.",
    default: true,
    category: "Main Settings"
});

const RarityColoring = plugin.settings().add({
    key: "RarityColoring",
    name: "Rarity Coloring",
    type: "boolean",
    note: "Determines whether card highlights in chat should be colored based on rarity.",
    default: true,
    category: "Color Settings",
    onChange: () => BaseColor.refresh(),
});

const BaseColor = plugin.settings().add({
    key: "BaseColor",
    name: "Base color for card mentions in chat.",
    type: "select",
    note: "Determines the card highlights' color.",
    default: "Perseverance",
    category: "Color Settings",
    options: [
        "Kindness",
        "Justice",
        "Bravery",
        "Perseverance",
        "Integrity",
        "Patience",
        "Determination",
        "Gray"
    ],
    disabled: () => RarityColoring.value(),
});

BaseColor.refresh()

// Other things

function isInsideSpan(txt, htmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    const spans = tempDiv.querySelectorAll('span');

    for (const span of spans) {
        if (span.textContent.toLowerCase().includes(txt.toLowerCase())) {
            return true;
        }
    }

    return false;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
}

function handleChatMessage(message) {
    let content = message.innerText;

    // Coloring Cards

    cardNames.forEach(data => {
        let regexString = `\\b${data.name}\\b`
        let regex = new RegExp(regexString, 'gi');
        let color = data.soul

        if (AliasesEnabled.value()) {
            regexString = `\\b(${data.name}|${data.alias})\\b`;
        };

        if (!RarityColoring.value()) {
            color = BaseColor.value().toUpperCase()
            if (BaseColor.value() == "Gray") {
                color = "gray"
            }
        }

        if (content.match(regex)) {
            content = content.replaceAll(regex, (match) => {
                if (isInsideSpan(match, content)) {
                    return match
                }

                let span = `<span onmouseover="displayCardHelp(this,${data.id}, false);" onmouseleave="removeCardHover();" class="${color}">${match}</span>`
                return span
            });
        }
    });

    // Coloring G/ATK/HP

    let goldRegex = new RegExp("\\d+\\s?g", "gi");
    content = content.replaceAll(goldRegex, (match) => {
        let span = `<span class="JUSTICE">${match}</span>`;
        return span;
    })

    let hpRegex = new RegExp("\\d+\\s?hp", "gi");
    content = content.replaceAll(hpRegex, (match) => {
        let span = `<span class="KINDNESS">${match}</span>`;
        return span;
    })

    let atkRegex = new RegExp("\\d+\\s?atk", "gi");
    content = content.replaceAll(atkRegex, (match) => {
        let span = `<span class="DETERMINATION">${match}</span>`;
        return span;
    })

    // Coloring card stats

    let fullStatsRegex = new RegExp("([+-]?\\d+)\\/([+-]?\\d+)(?:\\/([+-]?\\d+))?", "g");
    content = content.replaceAll(fullStatsRegex, (match) => {
        let split = match.split("/");
        let span;

        if (split[2] !== undefined) {
            span = `<span class="PATIENCE">${split[0]}</span>/<span class="DETERMINATION">${split[1]}</span>/<span class="KINDNESS">${split[2]}</span>`;
        }
        else {
            span = `<span class="DETERMINATION">${split[0]}</span>/<span class="KINDNESS">${split[1]}</span>`;
        }

        return span;
    })

    message.innerHTML = message.innerHTML.replace(message.innerText, content);
}

function chatInstanceAdded(node) {

    function chatObserverCallback(mutationsList, observer) {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.classList.contains("message-group")) {
                        plugin.events.emit("onChatMessage", { instance: node.getElementsByClassName("chat-message")[0] });
                    }
                }
            }
        });
    }

    const bodyObserver = new MutationObserver(chatObserverCallback);
    const config = { childList: true };
    bodyObserver.observe(node.getElementsByClassName("chat-messages")[0], config);
    const messageHolder = node.getElementsByClassName("chat-messages")[0];

    for (x in messageHolder.childNodes) {
        message = messageHolder.childNodes[x];
        if (typeof (message) === "object") {
            handleChatMessage(message.getElementsByClassName("chat-message")[0]);
        }
    }

}

// function bodyObserverCallback(mutationsList, observer) {
//     mutationsList.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//             for (let node of mutation.addedNodes) {
//                 if (node.classList.contains("chat-box")) {
//                     chatInstanceAdded(node);
//                 }
//             }
//         }
//     });
// }

// const bodyObserver = new MutationObserver(bodyObserverCallback);
// const config = { childList: true };
// bodyObserver.observe(document.body, config);

plugin.events.on("Chat:Connected", () => {
    console.log("Chat connected")
})

plugin.events.on("Chat:Reconnected", () => {
    console.log("reconnected")
})

plugin.events.on("onChatMessage", (data) => {
    handleChatMessage(data.instance)
});

plugin.events.on('allCardsReady', () => {
    allCards = window.allCards
    plugin.events.on("translation:loaded", (data) => {
        let RarityToColor = {
            BASE: "gray",
            COMMON: "PATIENCE",
            RARE: "INTEGRITY",
            EPIC: "PERSEVERANCE",
            LEGENDARY: "JUSTICE",
            DETERMINATION: "DETERMINATION",
            TOKEN: "KINDNESS"
        };

        allCards.forEach(card => {
            var soul = "PATIENCE";
            var alias = card.name;

            if (card["soul"] !== undefined) {
                soul = card["soul"]["name"];
            }
            else {
                soul = RarityToColor[card.rarity];
            }

            if (cardAliases[card.fixedId.toString()] !== undefined) {
                alias = cardAliases[card.fixedId.toString()];
            }

            cardNames.push({
                id: card.id,
                soul: soul,
                name: $.i18n(`card-name-${card.id}`, 1),
                alias: alias
            });

        });
        cardNames.sort((a, b) => b.name.length - a.name.length);
    });
});
