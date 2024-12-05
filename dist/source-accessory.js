"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceAccessory = void 0;
class SourceAccessory {
    constructor(hap, log, ampControl, name, zoneNumber, sourceNumber, zoneActiveSourceMap) {
        this.volume = 50;
        this.mute = false;
        this.preMuteVolume = 50;
        this.log = log;
        this.name = name;
        this.sourceIndex = sourceNumber;
        this.zone = zoneNumber;
        this.ampControl = ampControl;
        this.zoneSourceMap = zoneActiveSourceMap;
        this.service = new hap.Service.Switch(name);
        this.service.getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            let on = this.zoneSourceMap.get(zoneNumber) == sourceNumber;
            log.info("Current state of the source was returned: " + (on ? "ON" : "OFF"));
            callback(undefined, on);
        })
            .on("set" /* SET */, (value, callback) => {
            let on = value;
            if (on) {
                this.zoneSourceMap.set(zoneNumber, sourceNumber);
                ampControl.setSource(this.zone, this.sourceIndex);
            }
            log.info("Active state was set to: " + (on ? "ON" : "OFF"));
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
exports.SourceAccessory = SourceAccessory;
//# sourceMappingURL=source-accessory.js.map