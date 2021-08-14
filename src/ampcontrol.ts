import {Logging} from "homebridge";

export class AmpControl {
    private readonly itachFlexIp: String;
    private log: Logging;

    constructor(itachFlexIp: String, log: Logging) {
        this.itachFlexIp = itachFlexIp;
        this.log = log;
    }

    /**
     *
     * @param zoneNum number 1-18
     * @param sourceNum number 1-6
     */
    setSource(zoneNum: number, sourceNum: number): String {
        let source = sourceNum.toString();
        if (source.length === 1) source = '0' + source;
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'CH', source);
        this.log.info('setting source ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }

    /**
     * @param zoneNum number 0-18
     * @param volLevel number 0-100
     */
    setVolume(zoneNum: number, volLevel: number): String {
        volLevel = Math.round(volLevel / 2.64);
        let vol = volLevel.toString();
        if (vol.length === 1) vol = '0' + vol;
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'VO', vol);
        this.log.info('setting volume ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }

    /**
     * @param zoneNum number 0 - 18
     * @param state either 'on' or 'off'
     */
    setZone(zoneNum: number, state: boolean): String {
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'PR', (state ? '01' : '00'));
        this.log.info('setting zone ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }

    getCommandStr(zone: String, command: String, value: String): String {
        return '<' + zone + command + value;
    }

    getZoneMapping(zoneNumber: number): String {
        //1-6 map to 11-16, 7-12 map to 21-26 and 13-18 map to 31-36
        if (zoneNumber <= 6) {
            return "1" + zoneNumber.toString();
        } else if (zoneNumber <= 12) {
            return "2" + (zoneNumber - 6).toString();
        } else
            return "3" + (zoneNumber - 12).toString();
    }

    //todo implement get current state

    sendCommandToAmp(cmd: String) {
        const axios = require('axios');
        const url = 'http://' + this.itachFlexIp + '/api/host/modules/1/ports/1/data' + "";
        this.log.debug("using url " + url)
        axios.post(url, {

            headers: {
                'Content-Type': 'application/json',
                'Content-Length': cmd.length
            },
            data: cmd
        })
            .then(function (response: any) {
                console.log(response);
            })
            .catch(function (error: any) {
                console.error(error);
            });
    }

}

