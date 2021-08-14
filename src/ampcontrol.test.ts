import {AmpControl} from "./ampcontrol";


test('zone 1 on', () => {
    let cntrl = new AmpControl("192.168.1.165");
    expect(cntrl.setZone(1, true)).toBe("<11PR01");
});

test('zone 8 on', () => {
    let cntrl = new AmpControl("192.168.1.165");
    expect(cntrl.setZone(1, true)).toBe("<11PR01");
});

test('zone 13 on', () => {
    let cntrl = new AmpControl("192.168.1.165");
    expect(cntrl.setZone(1, true)).toBe("<11PR01");
});

test('volume 1 @ 100', () => {
    let cntrl = new AmpControl("192.168.1.165");
    expect(cntrl.setVolume(1, 100)).toBe("<11VO36");
});

