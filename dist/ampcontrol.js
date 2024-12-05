"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmpControl = void 0;
const serialport_1 = require("serialport");
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
class AmpControl {
    constructor(serialPortPath, log) {
        this.serialPortPath = serialPortPath;
        this.log = log;
        this.serialController = new serialport_1.SerialPort({
            path: this.serialPortPath,
            baudRate: 9600,
            autoOpen: false
        });
        this.serialController.on("open", () => {
            this.log.info("Serial port connection established");
        });
        this.serialController.on("data", this.serialControllerDataCallback.bind(this));
        this.serialController.on("error", (error) => {
            this.log.error("Serial port error:", error.message);
        });
        this.establishConnection();
    }
    setSource(zoneNum, sourceNum) {
        let source = sourceNum.toString().padStart(2, '0');
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'CH', source);
        this.log.info('Setting source ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }
    setVolume(zoneNum, volLevel) {
        volLevel = Math.round(volLevel / 2.64);
        let vol = volLevel.toString().padStart(2, '0');
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'VO', vol);
        this.log.info('Setting volume ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }
    setZone(zoneNum, state) {
        const zone = this.getZoneMapping(zoneNum);
        const cmd = this.getCommandStr(zone, 'PR', state ? '01' : '00');
        this.log.info('Setting zone ' + cmd);
        this.sendCommandToAmp(cmd);
        return cmd;
    }
    getCommandStr(zone, command, value) {
        return '<' + zone + command + value;
    }
    getZoneMapping(zoneNumber) {
        //1-6 map to 11-16, 7-12 map to 21-26 and 13-18 map to 31-36
        if (zoneNumber <= 6) {
            return "1" + zoneNumber.toString();
        }
        else if (zoneNumber <= 12) {
            return "2" + (zoneNumber - 6).toString();
        }
        else
            return "3" + (zoneNumber - 12).toString();
    }
    sendCommandToAmp(cmd) {
        this.log.info("Writing message to controller: " + cmd);
        this.serialController.write(cmd + '\r', "ascii", (err) => {
            if (err) {
                this.log.error("Failed to send command:", err.message);
            }
        });
    }
    serialControllerDataCallback(data) {
        this.log.info("Received data from controller: " + data.toString());
    }
    establishConnection() {
        this.log.info("Opening serial port...");
        this.serialController.open((err) => {
            if (err) {
                this.log.error("Failed to open serial port:", err.message);
            }
        });
    }
}
exports.AmpControl = AmpControl;
//# sourceMappingURL=ampcontrol.js.map