fx_version "adamant"
game "gta5"

name "zqueue"
description "FiveM queue with priority based on discord roles (Requires zdiscord)"
author "Petrikov/zfbx"
version "1.0.0"

server_script 'server/**'
client_script 'client/**'

dependency 'zdiscord'
provide 'connectqueue'
