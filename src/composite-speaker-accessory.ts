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

export class CompositeSpeakerAccessory implements AccessoryPlugin {

    private readonly log: Logging;

    private on = false;
    private volume = 50;
    private mute = false;
    private preMuteVolume = 50;

    name: string;

    private readonly service: Service;
    private readonly informationService: Service;
    private readonly ampControl: AmpControl;
    private readonly zoneNumbers: number[];

    constructor(hap: HAP, log: Logging, ampControl: AmpControl, name: string, zoneNumbers: number[]) {
        this.zoneNumbers = zoneNumbers;
        this.log = log;
        this.name = name;
        this.zoneNumbers = zoneNumbers;
        this.ampControl = ampControl;

        this.service = new hap.Service.Lightbulb(name);

        this.service.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                log.info("Current state of the switch was returned: " + (this.on ? "ON" : "OFF"));
                callback(undefined, this.on);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
                this.on = value as boolean;
                if (this.on) {
                    for (let i = 0; i < this.zoneNumbers.length; i++) {
                        ampControl.setZone(this.zoneNumbers[i], this.on);
                        ampControl.setVolume(this.zoneNumbers[i], this.volume);
                    }
                } else {
                    for (let i = 0; i < this.zoneNumbers.length; i++) {
                        ampControl.setZone(this.zoneNumbers[i], this.on);
                    }
                }
                log.info("Active state was set to: " + (this.on ? "ON" : "OFF"));
                callback();
            });

        this.service.addCharacteristic(hap.Characteristic.Brightness)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                log.info("Current state of the volume was returned: " + this.volume);
                callback(undefined, this.volume);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
                this.volume = value as number;
                for (let i = 0; i < this.zoneNumbers.length; i++) {
                    ampControl.setVolume(this.zoneNumbers[i], this.volume);
                }
                log.info("volume state was set to: " + this.volume);
                callback();
            });

        this.service.addCharacteristic(hap.Characteristic.Mute)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                log.info("Current state of the mute was returned: " + this.mute);
                callback(undefined, this.mute);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
                this.mute = value as boolean;
                if (this.mute) {
                    this.preMuteVolume = this.volume;
                    this.volume = 0;
                    for (let i = 0; i < this.zoneNumbers.length; i++) {
                        ampControl.setVolume(this.zoneNumbers[i], 0);
                    }
                } else {
                    this.volume = this.preMuteVolume;
                    for (let i = 0; i < this.zoneNumbers.length; i++) {
                        ampControl.setVolume(this.zoneNumbers[i], this.volume);
                    }
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