const fs = require('fs')
const path = require('path');
const { execSync } = require('child_process');
const info = require('./model/info.json');

function dateToFiletime(date) {
    const EPOCH_DIFFERENCE = 11644473600000; // ms between 1601-01-01 and 1970-01-01
    const msSince1601 = date.getTime() + EPOCH_DIFFERENCE;
    return msSince1601 * 10000; // convert ms → 100ns
}

function generateDdsJson(filepath) {
    var stat = fs.statSync(filepath);
    var date = dateToFiletime(stat.mtime);
    var ddsinfo = { "Version": 2, "SourceFileDate": date, "Flags": ["FL_BITMAP_COMPRESSION", "FL_BITMAP_MIPMAP"] };
    fs.writeFileSync(`${filepath}.json`, JSON.stringify(ddsinfo));
}

function convertPngToDds(srcpng, destdds) {
    console.log(execSync(`"tool\\texconv.exe" -y -f BC7_UNORM_SRGB -m 0 -o "." "${srcpng}" `, { encoding: 'utf8' }));
    let generatedDDS = path.basename(srcpng, '.png') + '.dds';
    fs.renameSync(generatedDDS, destdds);
    generateDdsJson(destdds);
}

let communityDirectoryName = `flybywire-aircraft-a320-neo-livery-${info.liveryId}`;
let fullLiveryName = `FlyByWire_A320_NEO_${info.liveryId}`;
let airplaneDirectory = `output/${communityDirectoryName}/SimObjects/AirPlanes/${fullLiveryName}`;
let title = `${info.liveryName} livery`;

let manifest = {
    "dependencies": [],
    "content_type": "AIRCRAFT",
    "title": title,
    "manufacturer": info.manufacturer,
    "creator": info.creator,
    "package_version": "0.1.0",
    "minimum_game_version": "1.38.2",
    "release_notes": {
        "neutral": {
            "LastUpdate": "",
            "OlderHistory": ""
        }
    }
};

const aircraftCFG = `[VERSION]
major = 1
minor = 0

[VARIATION]
base_container = "../FlyByWire_A320_NEO"

;===================== FLTSIM =====================

[FLTSIM.0]
title = "FBW Airbus A320 Neo ${info.liveryName}" ; Variation name
model = "${info.liveryId}" ; model folder
panel = "" ; panel folder
sound = "" ; sound folder
texture = "${info.liveryId}" ; texture folder
wip_indicator = 0 ; know if the variation is good to go or still WIP : -1=Disabled, 0=Rough, 1=1st Pass, 2=Finished
ui_type = "A320neo ${info.liveryName}" ; e.g. 747-400, 172
ui_variation = "${info.liveryName}" ; e.g. World Air, IFR Panel
ui_typerole = "Commercial Airliner" ; e.g. Single Engine Prop, Twin Engine Prop, Rotorcraft, etc
ui_createdby = "Asobo Studio" ; e.g. Asobo Studio, Microsoft, FSAddonCompany, etc
ui_thumbnailfile = "" ; app relative path to ThumbNail image file
ui_certified_ceiling = 39800 ; service ceiling / max certified operating altitude (ft)
ui_max_range = 3500 ; max distance the aircraft can fly between take-off and landing in (NM)
ui_autonomy = 7 ; max duration the aircraft can fly between take-off and landing in (Hrs)
ui_fuel_burn_rate = 5300 ; average fuel consumption per hour (lbs/hr) - reminder: fuel density is ~6.7lbs per US gallon
atc_id = " " ; tail number
atc_id_enable = 1 ; enable tail number
atc_airline = "${info.liveryName}" ; airline name
icao_airline = "${info.liveryIcao}" ; airline icao code
atc_flight_number = "${info.liveryFlightNumber}" ; flight number
atc_heavy = 1 ; heavy?
atc_parking_types = "GATE,RAMP,CARGO" ; "ANY" / "RAMP" / "CARGO" / "MIL_CARGO" / "MIL_COMBAT" / "GATE" / "DOCK"
atc_parking_codes = "" ; Comma separated and may be as small as one character each
atc_id_color = "" ; color for the tail number : i.e. "#ffff00ff"
atc_id_font = "" ; font for the tail number
isAirTraffic = 0 ; Is the plane usable for air traffic
isUserSelectable = 1 ; Is the plane selectable by the user`;

const modelCFG = `[model.options]
withExterior_showInterior=TRUE
withExterior_showInterior_hideFirstLod=TRUE
withInterior_forceFirstLod=TRUE
withInterior_showExterior=TRUE

[models]
normal=../../FlyByWire_A320_NEO/model/A320_NEO.xml
interior=../../FlyByWire_A320_NEO/model/A320_NEO_INTERIOR.xml`;

const textureCFG = `[fltsim]

fallback.1=../../FlyByWire_A320_NEO/TEXTURE
fallback.2=../../../../texture/DetailMap
fallback.3=../../../../texture/Glass
fallback.4=../../../../texture/Interiors
fallback.5=../../../../texture
fallback.6=../texture`;

fs.mkdirSync(`${airplaneDirectory}`, { recursive: true });
fs.writeFileSync(`${airplaneDirectory}/aircraft.cfg`, aircraftCFG);

fs.mkdirSync(`${airplaneDirectory}/model.${info.liveryId}`, { recursive: true });
fs.writeFileSync(`${airplaneDirectory}/model.${info.liveryId}/model.cfg`, modelCFG);

fs.mkdirSync(`${airplaneDirectory}/texture.${info.liveryId}`, { recursive: true });
convertPngToDds(`tool/transparent.png`, `${airplaneDirectory}/texture.${info.liveryId}/A320NEO_AIRFRAME_LIVERY_TEXTS_ALBD.PNG.dds`);
convertPngToDds(`tool/transparent.png`, `${airplaneDirectory}/texture.${info.liveryId}/A320NEO_AIRFRAME_LIVERY_ALBD.PNG.dds`);
convertPngToDds(`model/textures/a320neo_airframe_engines_albd.png`, `${airplaneDirectory}/texture.${info.liveryId}/A320NEO_AIRFRAME_ENGINES_ALBD.PNG.dds`);
convertPngToDds(`model/textures/a320neo_airframe_fuselage_albd.png`, `${airplaneDirectory}/texture.${info.liveryId}/A320NEO_AIRFRAME_FUSELAGE_ALBD.PNG.dds`);
convertPngToDds(`model/textures/a320neo_airframe_wings_albd.png`, `${airplaneDirectory}/texture.${info.liveryId}/A320NEO_AIRFRAME_WINGS_ALBD.PNG.dds`);

fs.writeFileSync(`${airplaneDirectory}/texture.${info.liveryId}/texture.cfg`, textureCFG);
fs.copyFileSync(`model/thumbnail.jpg`, `${airplaneDirectory}/texture.${info.liveryId}/thumbnail.jpg`)

fs.writeFileSync(`output/${communityDirectoryName}/manifest.json`, JSON.stringify(manifest));
console.log(execSync(`"tool\\MSFSLayoutGenerator.exe" "output/${communityDirectoryName}/layout.json" `, { encoding: 'utf8' }));