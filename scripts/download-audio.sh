#!/bin/bash

# Create audio directory if it doesn't exist
mkdir -p client/public/audio

# Download royalty-free music samples
# Using samples from Free Music Archive (FMA) and other free music sources

# Electronic
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3" -o client/public/audio/electronic.mp3

# Rock
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps_of_revolution/Chad_Crouch_-_Shipping_Lanes.mp3" -o client/public/audio/rock.mp3

# Pop
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/pop.mp3

# Hip Hop
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/hiphop.mp3

# Jazz
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/jazz.mp3

# Classical
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/classical.mp3

# R&B
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/rnb.mp3

# Country
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/country.mp3

# Metal
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/metal.mp3

# Folk
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/folk.mp3

# Blues
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/blues.mp3

# Reggae
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/reggae.mp3

# Latin
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/latin.mp3

# World
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/world.mp3

# Ambient
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/ambient.mp3

# Default
curl -L "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Drifter.mp3" -o client/public/audio/default.mp3

echo "Audio samples downloaded successfully!" 