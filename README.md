# zqueue (fork of pQueue)

This is a FiveM server queue with discord based priority built on [VikingTheDev](https://github.com/VikingTheDev/)'s pQueue work to support zdiscord instead.
You **NEED** [zdiscord](https://github.com/zfbx/zdiscord) for this resource to work.

# Installation
Copy or download the resource in your resource folder, and add `ensure zqueue` to your `server.cfg`

<!--

# Config
The config (`config.js`) file can be found in the ``src`` folder.
In the config file you will find three different sections the first being the settings section:
```js
"settings": {
        "debug": false,
        "alwaysUse": false,
        "graceListTime": 5
    }
```
`debug` Will enable debug messages in your console, such as: users being added to the queue and their priority, users being removed from the queue and the queue itself.

`alwaysUse` If set to true the queue will ALWAYS be used, regardless of the number of people in server, this will only allow one user to connect at a time. If set to false the queue will only take effect if there's < 5 open slots.

`graceListTime` How long a user that has just disconnect/crashed has too reconnect before they will be put at the end of the queue again. (In minutes)


![Alt text](https://i.ibb.co/7CT9rQK/Screenshot-29.png "Adaptive Card Layout")



The third and the final section is the most complicated to set up as it requires an understanding of how [sPerms](https://forum.cfx.re/t/release-sperms-real-time-discord-perms/1686063) and [sDiscord](https://forum.cfx.re/t/release-sdiscord/1680021) works, as well as some experience with working with objects in JS. But if you follow all the following steps you should be able to set everything up without problems:

1. Download and set up sDiscord and sPerms

2. Add the roles you want to set up priority for in the sPerms config file (src/config.json).
In the config file the individual roles are divided into categories, example configuration:
```js
{
  "discordRoles": {
    "administration": {
      "owner": "Discord Role ID",
      "coOwner": "Discord Role ID",
      "headDev": "Disord Role ID"
    },
    "staff": {
      "admin": "Discord Role ID",
      "mod": "Discord Role ID"
    }
  },
  "needDiscord": false
}
```
When sPerms builds the ``perms`` object it checks each individual role, but also the different categories (if you have one role in a category, the category will return as true). We can see the built ``perms`` object by going into the client script in sPerms (src/client/index.js) and adding ``console.log(perms)`` to the ``sPerms:setPerms`` event, this will log the object in the player's console when they first spawn in:

![Alt text](https://i.ibb.co/kgmv3v1/image-2021-01-16-210720.png "Structure of the built perms")

3. Add the roles you want to set up for priority to the ``pQueue`` config file (``queue.config.json``).
```js
{
  "category": "category",
  "role": "roleName",
  "prio": 1
}
```
``category`` If you want to check for an individual role this should be the category the role is under, ex. staff. If you want to check for a whole category this should just be "category"

``role`` If you are checking for a role, this should be the name of the role, ex. owner. If you are checking a whole category it should be the name of the category ex. staff.

``prio`` This is the priority, the lower the number the higher the priority. (Use whole numbers)

If everything has been done correctly, the script should now work as intended. If you have any issues, feel free to reach out to me on Discord (MightyViking#9126)

-->

# Credit

Great thanks to [VikingTheDev](https://github.com/VikingTheDev/pQueue) ♥ who originally build this resource for use with sDiscord and sPerms under the MIT License before I ported it to use zdiscord.
This modified version of the resource will also stay open source under MIT for improvements and inspiration to others.
