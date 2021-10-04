import {Logging} from "homebridge";
import * as net from 'net';

const serverPort = 4999;

/*
    Command details from https://downloads.monoprice.com/files/manuals/10761_Manual_131209.pdf
        Control request format: <xxPPuu'CR'
        Control response format: >xxPPuu'CR'
        xx 10-30, eg 12 is Zone 2 of Unit 1, 10 is ALL Unit 1
        PP command from this list
            PR: Power PR00-PR01 off/on
            MU: Mute MU00-MU01 off/on
            DT: DND DT0-DT01 off/on
            VO: Volume VO00-VO38
            TR: Treble TR00-TR14
            BS: Bass BS00-BS14
            BL: Balance BL00-BL20
            CH: zone source

        Inquiry request format: ?xx'CR'
        Inquiry response format: ?xxaabbccddeeffgghhiijj'CR'

 */

export class AmpControl {
    private readonly itachFlexIp: string;
    private log: Logging;
    private serverController: net.Socket;

    constructor(itachFlexIp: string, log: Logging) {
        this.itachFlexIp = itachFlexIp;
        this.log = log;
        this.serverController = new net.Socket();
        this.serverController.setEncoding("ascii");
        this.serverController.on('data', this.serverControllerDataCallback.bind(this));
        this.establishConnection();
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

    getCommandStr(zone: string, command: string, value: string): string {
        return '<' + zone + command + value;
    }

    getZoneMapping(zoneNumber: number): string {
        //1-6 map to 11-16, 7-12 map to 21-26 and 13-18 map to 31-36
        if (zoneNumber <= 6) {
            return "1" + zoneNumber.toString();
        } else if (zoneNumber <= 12) {
            return "2" + (zoneNumber - 6).toString();
        } else
            return "3" + (zoneNumber - 12).toString();
    }

    //todo implement get current state

    sendCommandToAmp(cmd: string) {
        this.viaSocket(cmd);
    }

    viaSocket(cmd: string) {
        this.log.info("writing message to controller: " + cmd);
        this.serverController.write(cmd + '\r', "ascii");
    }

    // viaHttp(cmd: String) {
    //     const axios = require('axios');
    //     const url = 'http://' + this.itachFlexIp + '/api/host/modules/1/ports/1/data' + "";
    //     this.log.debug("using url " + url)
    //     axios.post(url, {
    //
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Content-Length': cmd.length
    //         },
    //         data: cmd
    //     })
    //         .then(function (response: any) {
    //             console.log(response);
    //         })
    //         .catch(function (error: any) {
    //             console.error(error);
    //         });
    // }

    serverControllerDataCallback(data: Buffer) {
        this.log.info(data.toString());
        // this.serverController.end();
    }

    private establishConnection() {
        this.log.info("connecting to controller");
        this.serverController.connect({host: this.itachFlexIp, port: serverPort});
    }
}

