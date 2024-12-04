import {AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin,} from "homebridge";
import {AmpControl} from "./ampcontrol";
import {Group, Source, Zone} from "./configTypes";
import {SpeakerAccessory} from "./speaker-accessory";
import {SourceAccessory} from "./source-accessory";
import {CompositeSourceAccessory} from "./composite-source-accessory";
import {CompositeSpeakerAccessory} from "./composite-speaker-accessory";
import {PLATFORM_NAME} from "./settings";

let hap: HAP;

export = (api: API) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, MonopriceAmpRS232Platform);
};

class MonopriceAmpRS232Platform implements StaticPlatformPlugin {

    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly ampControl: AmpControl;
    private readonly hap: HAP;
    private readonly accessoriesList: AccessoryPlugin[] = [];

    constructor(log: Logging, config: PlatformConfig, api: API) {
        this.log = log;
        this.config = config;
        this.log.debug('Finished initializing platform:', this.config.name);
        this.hap = api.hap;

        if (config['serialPortPath'] === undefined) log.error("missing config value 'serialPortPath'")
        this.ampControl = new AmpControl(config['serialPortPath'], this.log);
        this.log.info(PLATFORM_NAME + " finished initializing!");
    }

    accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
        this.log.info("starting adding accessories")
        let zoneSourceMap = new Map<number, number>();
        const zoneNumbers: number[] = new Array(this.config.zones.length);
        if (this.accessoriesList.length == 0) {
            this.log.info("zones" + this.config.zones);
            this.config.zones?.forEach((zone: Zone) => {
                zoneNumbers.push(zone.number);
                this.accessoriesList.push(new SpeakerAccessory(this.hap, this.log, this.ampControl, zone.name, zone.number));
                zoneSourceMap.set(zone.number, 0);
                this.config.sources?.forEach((source: Source) => {
                    this.accessoriesList.push(new SourceAccessory(this.hap, this.log, this.ampControl, zone.name + "-" + source.name, zone.number, source.number, zoneSourceMap));
                    this.log.info("Added source " + zone.name + " _ " + zone.number + "_source_" + source.name);
                });

                this.log.info("Added zone " + zone.name + " _ " + zone.number)
            });
            if (this.config.enableMasterControls) {
                this.config.sources?.forEach((source: Source) => {
                    this.accessoriesList.push(new CompositeSourceAccessory(this.hap, this.log, this.ampControl, "All-" + source.name, zoneNumbers, source.number, zoneSourceMap));
                    this.log.info("Added master source: " + source.name);
                });
                this.accessoriesList.push(new CompositeSpeakerAccessory(this.hap, this.log, this.ampControl, "AllSpeakers", zoneNumbers));
                this.log.info("Added master on/off");
            }
            this.config.groups?.forEach((group: Group) => {
                this.config.sources?.forEach((source: Source) => {
                    this.accessoriesList.push(new CompositeSourceAccessory(this.hap, this.log, this.ampControl, group.name + "-" + source.name, this.config.zones?.size, source.number, zoneSourceMap));
                    this.log.info("Added group: " + group.name + " source " + source.name);
                });
                this.accessoriesList.push(new CompositeSpeakerAccessory(this.hap, this.log, this.ampControl, group.name, this.config.zones?.size));
                this.log.info("Added group: " + group.name );
            })
        }
        callback(this.accessoriesList);
    }

}