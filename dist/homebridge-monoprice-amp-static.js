"use strict";
const ampcontrol_1 = require("./ampcontrol");
const speaker_accessory_1 = require("./speaker-accessory");
const source_accessory_1 = require("./source-accessory");
const composite_source_accessory_1 = require("./composite-source-accessory");
const composite_speaker_accessory_1 = require("./composite-speaker-accessory");
const settings_1 = require("./settings");
let hap;
class MonopriceAmpRS232Platform {
    constructor(log, config, api) {
        this.accessoriesList = [];
        this.log = log;
        this.config = config;
        this.log.debug('Finished initializing platform:', this.config.name);
        this.hap = api.hap;
        if (config['serialPortPath'] === undefined)
            log.error("missing config value 'serialPortPath'");
        this.ampControl = new ampcontrol_1.AmpControl(config['serialPortPath'], this.log);
        this.log.info(settings_1.PLATFORM_NAME + " finished initializing!");
    }
    accessories(callback) {
        var _a, _b, _c;
        this.log.info("starting adding accessories");
        let zoneSourceMap = new Map();
        const zoneNumbers = new Array(this.config.zones.length);
        if (this.accessoriesList.length == 0) {
            this.log.info("zones" + this.config.zones);
            (_a = this.config.zones) === null || _a === void 0 ? void 0 : _a.forEach((zone) => {
                var _a;
                zoneNumbers.push(zone.number);
                this.accessoriesList.push(new speaker_accessory_1.SpeakerAccessory(this.hap, this.log, this.ampControl, zone.name, zone.number));
                zoneSourceMap.set(zone.number, 0);
                (_a = this.config.sources) === null || _a === void 0 ? void 0 : _a.forEach((source) => {
                    this.accessoriesList.push(new source_accessory_1.SourceAccessory(this.hap, this.log, this.ampControl, zone.name + "-" + source.name, zone.number, source.number, zoneSourceMap));
                    this.log.info("Added source " + zone.name + " _ " + zone.number + "_source_" + source.name);
                });
                this.log.info("Added zone " + zone.name + " _ " + zone.number);
            });
            if (this.config.enableMasterControls) {
                (_b = this.config.sources) === null || _b === void 0 ? void 0 : _b.forEach((source) => {
                    this.accessoriesList.push(new composite_source_accessory_1.CompositeSourceAccessory(this.hap, this.log, this.ampControl, "All-" + source.name, zoneNumbers, source.number, zoneSourceMap));
                    this.log.info("Added master source: " + source.name);
                });
                this.accessoriesList.push(new composite_speaker_accessory_1.CompositeSpeakerAccessory(this.hap, this.log, this.ampControl, "AllSpeakers", zoneNumbers));
                this.log.info("Added master on/off");
            }
            (_c = this.config.groups) === null || _c === void 0 ? void 0 : _c.forEach((group) => {
                var _a, _b;
                (_a = this.config.sources) === null || _a === void 0 ? void 0 : _a.forEach((source) => {
                    var _a;
                    this.accessoriesList.push(new composite_source_accessory_1.CompositeSourceAccessory(this.hap, this.log, this.ampControl, group.name + "-" + source.name, (_a = this.config.zones) === null || _a === void 0 ? void 0 : _a.size, source.number, zoneSourceMap));
                    this.log.info("Added group: " + group.name + " source " + source.name);
                });
                this.accessoriesList.push(new composite_speaker_accessory_1.CompositeSpeakerAccessory(this.hap, this.log, this.ampControl, group.name, (_b = this.config.zones) === null || _b === void 0 ? void 0 : _b.size));
                this.log.info("Added group: " + group.name);
            });
        }
        callback(this.accessoriesList);
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(settings_1.PLATFORM_NAME, MonopriceAmpRS232Platform);
};
//# sourceMappingURL=homebridge-monoprice-amp-static.js.map