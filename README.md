## Homebridge plugin for the Monoprice 6 Zone Home Audio Multizone Controller

Copyright © 2021 Richard Pack. All rights reserved.

### Introduction
This plugin exposes the zones on the Monoprice Multizone 
Controller/Amplifier as accessories in Homekit through Homebridge.

It supports:
- Toggling zones on and off
- Setting the volume of a zone 

Coming soon:
- Zone source selection
- Zone muting

### Prerequisites

- Monoprice 6 Zone Home Audio Multizone Controller
- iTachFlexIp for IP control of the amplifier over RS232
- Homebridge

### Example Config
```
{
  "platform": "MonopriceAmp",
  "itachFlexIp": "192.168.1.1", //itachflex ip address
  "zones": [
    {
      "name": "Zone 1",
      "number": 1
    },
    {
      "name": "Zone 2",
      "number": 2
    }
  ],
  "sources": [
    "sonos",
    "airplay"
  ]
}
```
This adds 2 zones and 2 sources (source control still a work in progress).

### Disclaimer
This is a hobby project with no warranty provided or implied whatsoever. 
Although I have deployed this and use it every day, your mileage may vary.
