import {
    AccessoryPlugin,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    HAP,
    Logging,
    Service
} from "homebridge";
import {AmpControl} from "./ampcontrol";

export class SourceAccessory implements AccessoryPlugin {

    private readonly log: Logging;


    private readonly zone: number;
    private readonly sourceIndex: number;
    private volume = 50;
    private mute = false;
    private preMuteVolume = 50;

    name: string;

    private readonly service: Service;
    private readonly informationService: Service;
    private ampControl: AmpControl;
    private zoneSourceMap: Map<number, number>;

    constructor(hap: HAP, log: Logging, ampControl: AmpControl, name: string, zoneNumber: number, sourceNumber: number, zoneActiveSourceMap: Map<number, number>) {
        this.log = log;
        this.name = name;
        this.sourceIndex = sourceNumber;
        this.zone = zoneNumber;
        this.ampControl = ampControl;
        this.zoneSourceMap = zoneActiveSourceMap;

        this.service = new hap.Service.Switch(name);

        this.service.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                let on = this.zoneSourceMap.get(zoneNumber) == sourceNumber;
                log.info("Current state of the source was returned: " + (on ? "ON" : "OFF") );
                callback(undefined, on);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
                let on = value as boolean;
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
    identify(): void {
        this.log("Identify!");
    }

    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices(): Service[] {
        return [
            this.informationService,
            this.service,
        ];
    }
}