import {AccessoryPlugin, API, HAP, Logging, PlatformConfig, StaticPlatformPlugin,} from "homebridge";
import {ZoneAccessory} from "./zone-accessory";
import {AmpControl} from "./ampcontrol";
import {Zone} from "./configTypes";
import {PLATFORM_NAME} from "./settings";

let hap: HAP;

export = (api: API) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, MonopriceAmpPlatform);
};

class MonopriceAmpPlatform implements StaticPlatformPlugin {

    private readonly log: Logging;
    private readonly config: PlatformConfig;
    private readonly ampControl: AmpControl;
    private readonly hap: HAP;
    private accessoriesList: ZoneAccessory[] = [];

    constructor(log: Logging, config: PlatformConfig, api: API) {
        this.log = log;
        this.config = config;
        this.log.debug('Finished initializing platform:', this.config.name);
        this.hap = api.hap;

        if (config['itachFlexIp'] === undefined) log.error("missing config value 'itachFlexIp'")
        this.ampControl = new AmpControl(config['itachFlexIp'], this.log);
        log.info(PLATFORM_NAME + " finished initializing!");
    }

    accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
        this.log.info("starting adding accessories")
        if (this.accessoriesList.length == 0) {
            this.log.info("zones" + this.config.zones);
            this.config.zones?.forEach((zone: Zone) => {
                this.accessoriesList.push(new ZoneAccessory(this.hap, this.log, this.ampControl, this.config.sources, zone.name, zone.number));
                this.log.info("Added zone " + zone.name + " _ " + zone.number)
            });
        }
        callback(this.accessoriesList);
    }

}