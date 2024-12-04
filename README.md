## Homebridge plugin for the Monoprice 6 Zone Home Audio Multizone Controller

Copyright © 2021 Richard Pack. All rights reserved.

### Introductions
This plugin exposes the zones on the Monoprice Multizone 
Controller/Amplifier as accessories in Homekit through Homebridge.

It supports:
- Toggling zones on and off
- Setting the volume of a zone
- Setting the source for a zone
- All zones On/Off Control
- The ability to create speaker groups

### Prerequisites

- Monoprice 6 Zone Home Audio Multizone Controller
- iTachFlexIp for IP control of the amplifier over RS232
- Homebridge

### Example Config
```
{
  "platform": "MonopriceAmpRS232",
  "serialPortPath": "/dev/usbserial1",
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
  ],
  "enableMasterControls": true,
   "groups": [
      {
        "name": "Sample 1",
        "zones": [1, 2, 3, 4]
      }
   ]
}
```
This adds 2 zones and 2 sources, with enabling an "All On/Off" Speaker and a All Zones Source control as well as a group 
speaker control with source control for that group.

### Disclaimer
This is a hobby project with no warranty provided or implied whatsoever. 
Although I have deployed this and use it every day, your mileage may vary.
