"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeakerAccessory = void 0;
class SpeakerAccessory {
    constructor(hap, log, ampControl, name, zone) {
        this.on = false;
        this.volume = 50;
        this.mute = false;
        this.preMuteVolume = 50;
        this.log = log;
        this.name = name;
        this.zone = zone;
        this.ampControl = ampControl;
        this.service = new hap.Service.Lightbulb(name);
        this.service.getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            log.info("Current state of the switch was returned: " + (this.on ? "ON" : "OFF"));
            callback(undefined, this.on);
        })
            .on("set" /* SET */, (value, callback) => {
            this.on = value;
            ampControl.setZone(this.zone, this.on);
            if (this.on) {
                ampControl.setVolume(this.zone, this.volume);
            }
            log.info("Active state was set to: " + (this.on ? "ON" : "OFF"));
            callback();
        });
        this.service.addCharacteristic(hap.Characteristic.Brightness)
            .on("get" /* GET */, (callback) => {
            log.info("Current state of the volume was returned: " + this.volume);
            callback(undefined, this.volume);
        })
            .on("set" /* SET */, (value, callback) => {
            this.volume = value;
            this.ampControl.setVolume(this.zone, this.volume);
            log.info("volume state was set to: " + this.volume);
            callback();
        });
        this.service.addCharacteristic(hap.Characteristic.Mute)
            .on("get" /* GET */, (callback) => {
            log.info("Current state of the mute was returned: " + this.mute);
            callback(undefined, this.mute);
        })
            .on("set" /* SET */, (value, callback) => {
            this.mute = value;
            if (this.mute) {
                this.preMuteVolume = this.volume;
                this.volume = 0;
                this.ampControl.setVolume(this.zone, 0);
            }
            else {
                this.volume = this.preMuteVolume;
                this.ampControl.setVolume(this.zone, this.volume);
            }
            log.info("mute was set to " + this.mute + ", volume set to: " + this.volume);
            callback();
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, "Monoprice")
            .setCharacteristic(hap.Characteristic.Model, "6 Channel Amp");
        this.log.info("Zone accessory created", name);
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log("Identify!");
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [
            this.informationService,
            this.service,
        ];
    }
}
exports.SpeakerAccessory = SpeakerAccessory;
//# sourceMappingURL=speaker-accessory.js.map