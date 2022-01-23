// Originally written by devpetrikov for use in Sunshine State RP (discord.gg/ssrp)
// Modified by zfbx for compatibility with zdiscord

const config = require(`${GetResourcePath(GetCurrentResourceName())}/config`);
const utils = require(`${GetResourcePath("zdiscord")}/server/utils`);

StopResource("hardcap");
StopResource("connectqueue");
let msg;

const graceList = [];

on("playerConnecting", async (name, setKickReason, deferrals) => {
    const src = global.source;

    deferrals.defer();
    await utils.sleep(1);
    deferrals.update(`Hello ${name}. We're putting you in the loading queue`);

    const discordIdentifier = utils.getPlayerDiscordId(src);
    addToQueue(discordIdentifier, src);
    const intervalId = setInterval(() => {
        // stops the interval if the user is no longer in the queue
        if (!isUserInQueue(discordIdentifier)) {
            return clearInterval(intervalId);
        }
        if (GetNumPlayerIndices() < GetConvar("sv_maxclients")) {
            // Checks if there's more than 5 open slots
            if (GetConvar("sv_maxclients") - GetNumPlayerIndices() > 4) {
                // checks if the alwaysUse setting is enabled
                if (config.alwaysUse) {
                    // checks if the user is number 1 in the queue
                    if (priorityQueue.front().element == discordIdentifier) {
                        deferrals.done();
                        console.log(`Connecting: ${name}`);
                        clearInterval(intervalId);
                    }
                    else {
                        msg = `You are in queue [${findInQueue(discordIdentifier) + 1}/${priorityQueue.items.length}]`;
                        // call the function to update the adaptive card content
                        updateCard(callback => {
                            deferrals.presentCard(callback);
                        });
                    }
                }
                else {
                    // if there's more than 5 open slots and the alwaysUse setting is not disabled allow the user to connect without going through the queue
                    deferrals.done();
                }
            }
            // checks if the user is number 1 in the queue
            else if (priorityQueue.front().element == discordIdentifier) {
                deferrals.done();
                console.log(`Connecting: ${name}`);
                clearInterval(intervalId);
            }
            else {
                msg = `You are in queue [${findInQueue(discordIdentifier) + 1}/${priorityQueue.items.length}]`;
                updateCard(callback => {
                    deferrals.presentCard(callback);
                });
            }
        }
        else {
            msg = `You are in queue [${findInQueue(discordIdentifier) + 1}/${priorityQueue.items.length}]`;
            updateCard(callback => {
                deferrals.presentCard(callback);
            });
        }
    }, 500);
});

on("playerDropped", (reason) => {
    const src = global.source;
    const discordIdentifier = utils.getPlayerDiscordId(src);
    graceList.push(discordIdentifier);
    debugLog(`${discordIdentifier} has been added to the grace list.`);
    setTimeout(function() {
        graceListRemove(discordIdentifier);
    }, config.graceListTime * 60 * 1000);
});

// Removes the user in posistion 1 once they have connected to the server
onNet("zqueue:shiftQueue", () => {
    debugLog(`${priorityQueue.front().element} has been removed from the queue.`);
    priorityQueue.remove();
});

// checks for and removes ghost users every 15 seconds
setInterval(function removeGhostUsers() {
    for (let i = 0; i < priorityQueue.items.length; i++) {
        if (GetPlayerName(priorityQueue.items[i].source) == null) {
            debugLog(`Removed ghost user: ${priorityQueue.items[i].element}`);
            removeFromQueue(priorityQueue.items[i].element);
        }
    }
    debugLog(`Queue: ${priorityQueue.printQueue()}`);
}, 15000);

// Checks if the user is still in the queue
function isUserInQueue(identifier) {
    let b = false;
    for (let i = 0; i < priorityQueue.items.length; i++) {
        if (priorityQueue.items[i].element == identifier) {
            b = true;
            return b;
        }
    }
}

// adds a user to the queue
function addToQueue(identifier, src) {
    if (graceList.includes(identifier)) {
        priorityQueue.insert(identifier, 1, src);
        return debugLog(`${identifier} has been added to the queue with priority 1 for being on the grace list`);
    }
    const roles = global.exports.zdiscord.getRoles(identifier);
    for (let i = 0; i < config.priorityList.length; i++) {
        for (const role of config.priorityList[i].roles) {
            if (roles.includes(role)) {
                priorityQueue.insert(identifier, i, src);
                return debugLog(`${identifier} has been added to the queue as ${config.priorityList[i].title} with priority ${i}`);
            }
        }
    }
}

// removes a user from the queue
function removeFromQueue(identifier) {
    for (let i = 0; i < priorityQueue.items.length; i++) {
        if (priorityQueue.items[i].element == identifier) {
            priorityQueue.items.splice(i, 1);
            debugLog(`${identifier} has been removed from the queue.`);
            break;
        }
    }
}

// find the user's placement in the queue
function findInQueue(identifier) {
    for (let i = 0; i < priorityQueue.items.length; i++) {
        if (priorityQueue.items[i].element == identifier) {
            return i;
        }
    }
}

function graceListRemove(id) {
    for (let i = 0; i < graceList.length; i++) {
        if (graceList[i] == id) {
            graceList.splice(i, 1);
            debugLog(`${discordIdentifier} has been removed from the grace list.`);
        }
    }
}

// User defined class
// to store elements and its priority
class QElement {
    constructor(element, priority, source) {
        this.element = element;
        this.priority = priority;
        this.source = source;
    }
}

// PriorityQueue class
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    insert(element, priority, source) {
        const qElement = new QElement(element, priority, source);

        // iterating through the entire item array to add element at the correct location of the Queue
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is inserted
                this.items.splice(i, 0, qElement);
                return;
            }
        }
        // default to end of queue
        this.items.push(qElement);
    }

    // return the remove element and remove it. If the queue is empty returs UnderFlow
    remove() {
        if (this.isEmpty()) return "UnderFlow";
        return this.items.shift();
    }

    // returns the highest priority element in the priority queue wightout removing it
    front() {
        if (this.isEmpty()) return "No elements in Queue";
        return this.items[0];
    }

    // returns the lowest priority element of the queue
    rear() {
        if (this.isEmpty()) return "No elements in Queue";
        return this.items[this.items.length - 1];
    }

    // return true if the queue is empty.
    isEmpty() {
        return this.items.length == 0;
    }

    // print all the elements of the queue
    printQueue() {
        return this.items.join(", ");
    }
}

const priorityQueue = new PriorityQueue();

function updateCard(callback) {
    const card = {
        "type": "AdaptiveCard",
        "body": [
            {
                "type": "Image",
                "url": config.adaptiveCard.card_header,
                "horizontalAlignment": "Center",
            },
            {
                "type": "Container",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": config.adaptiveCard.card_title,
                        "wrap": true,
                        "fontType": "Default",
                        "size": "ExtraLarge",
                        "weight": "Bolder",
                        "color": "light",
                        "horizontalAlignment": "Center",
                        "isVisible": config.adaptiveCard.card_title !== "",
                    },
                    {
                        "type": "TextBlock",
                        "text": msg,
                        "wrap": true,
                        "size": "Large",
                        "weight": "Bolder",
                        "color": "Light",
                        "horizontalAlignment": "Center",
                    },
                    {
                        "type": "TextBlock",
                        "text": config.adaptiveCard.card_description,
                        "wrap": true,
                        "color": "Light", "size": "Medium",
                        "horizontalAlignment": "Center",
                    },
                    {
                        "type": "ColumnSet", "height": "stretch",
                        "minHeight": "35px", "bleed": true,
                        "horizontalAlignment": "Center",
                        "columns": [
                            {
                                "type": "Column",
                                "width": "stretch",
                                "items": [
                                    {
                                        "type": "ActionSet",
                                        "actions": [
                                            {
                                                "type": "Action.OpenUrl",
                                                "title": config.adaptiveCard.button1_title,
                                                "style": "positive",
                                            },
                                        ],
                                    },
                                ],
                                "height": "stretch",
                            },
                            {
                                "type": "Column", "width": "stretch",
                                "items": [
                                    {
                                        "type": "ActionSet",
                                        "actions": [
                                            {
                                                "type": "Action.OpenUrl",
                                                "title": config.adaptiveCard.button2_title,
                                                "style": "positive",
                                                "url": config.adaptiveCard.button2_url,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                "style": "default",
                "bleed": true,
                "height": "automatic",
                "isVisible": true,
            },
        ],
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.3",
    };
    callback(card);
}

function debugLog(debugMessage) {
    if (config.debug) {
        utils.log.write(debugMessage, { tag: "DBG" });
    }
}
