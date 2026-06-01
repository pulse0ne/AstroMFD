import aperture from "./aperture.svg?raw";
import arrowDown from "./arrow-down.svg?raw";
import arrowLeft from "./arrow-left.svg?raw";
import arrowRight from "./arrow-right.svg?raw";
import arrowUp from "./arrow-up.svg?raw";
import atom from "./atom.svg?raw";
import battery from "./battery.svg?raw";
import breach from "./breach.svg?raw";
import brokenCircle from "./broken-circle.svg?raw";
import capsule from "./capsule.svg?raw";
import cargo from "./cargo.svg?raw";
import chat from "./chat.svg?raw";
import chevronDown from "./chevron-down.svg?raw";
import chevronLeft from "./chevron-left.svg?raw";
import chevronRight from "./chevron-right.svg?raw";
import chevronUp from "./chevron-up.svg?raw";
import circle from "./circle.svg?raw";
import computer from "./computer.svg?raw";
import cooler from "./cooler.svg?raw";
import cross from "./cross.svg?raw";
import crossSection from "./cross-section.svg?raw";
import cursor from "./cursor.svg?raw";
import currency from "./currency.svg?raw";
import danger from "./danger.svg?raw";
import diamond from "./diamond.svg?raw";
import door from "./door.svg?raw";
import doubleChevronDown from "./double-chevron-down.svg?raw";
import doubleChevronLeft from "./double-chevron-left.svg?raw";
import doubleChevronRight from "./double-chevron-right.svg?raw";
import doubleChevronUp from "./double-chevron-up.svg?raw";
import ecg from "./electrocardiogram.svg?raw";
import emp from "./emp.svg?raw";
import fire from "./fire.svg?raw";
import fuel from "./fuel.svg?raw";
import fuel2 from "./fuel2.svg?raw";
import globe from "./globe.svg?raw";
import gravity from "./gravity.svg?raw";
import headlight from "./headlight.svg?raw";
import heat from "./heat.svg?raw";
import hexagon from "./hexagon.svg?raw";
import impulse from "./impulse.svg?raw";
import intake from "./intake.svg?raw";
import landingGear from "./landing-gear.svg?raw";
import laser from "./laser.svg?raw";
import lifeSupport from "./life-support.svg?raw";
import lightBulb from "./light.svg?raw";
import loading from "./loading.svg?raw";
import lock from "./lock.svg?raw";
import maneuveringThrusters from "./maneuvering-thrusters.svg?raw";
import missile from "./missile.svg?raw";
import missileRack from "./missile-rack.svg?raw";
import octagon from "./octagon.svg?raw";
import parallelogram from "./parallelogram.svg?raw";
import pentagon from "./pentagon.svg?raw";
import people from "./people.svg?raw";
import person from "./person.svg?raw";
import power from "./power.svg?raw";
import power2 from "./power2.svg?raw";
import pull from "./pull.svg?raw";
import radar from "./radar.svg?raw";
import repair from "./repair.svg?raw";
import reset from "./reset.svg?raw";
import reticleCross from "./reticle-cross.svg?raw";
import reticleDiamond from "./reticle-diamond.svg?raw";
import reticleOpen from "./reticle-open.svg?raw";
import reticleTri from "./reticle-tri.svg?raw";
import rifle from "./rifle.svg?raw";
import scan from "./scan.svg?raw";
import seat from "./seat.svg?raw";
import shield from "./shield.svg?raw";
import sidearm from "./sidearm.svg?raw";
import skull from "./skull.svg?raw";
import sliders from "./sliders.svg?raw";
import star from "./star.svg?raw";
import star7 from "./star-7-points.svg?raw";
import thrusters from "./thrusters.svg?raw";
import trapezoid from "./trapezoid.svg?raw";
import triangle from "./triangle.svg?raw";
import turret from "./turret.svg?raw";
import unlock from "./unlock.svg?raw";
import weapon from "./weapon.svg?raw";

export type ShapePreset = {
  name: string;
  svg: string;
};

export const shapePresets: ShapePreset[] = [
  { name: "Circle", svg: circle },
  { name: "Triangle", svg: triangle },
  { name: "Diamond", svg: diamond },
  { name: "Pentagon", svg: pentagon },
  { name: "Hexagon", svg: hexagon },
  { name: "Octagon", svg: octagon },
  { name: "Star", svg: star },
  { name: "Cross", svg: cross },
  { name: "Capsule", svg: capsule },
  { name: "Trapezoid", svg: trapezoid },
  { name: "Parallelogram", svg: parallelogram },
  { name: "Arrow Down", svg: arrowDown },
  { name: "Arrow Left", svg: arrowLeft },
  { name: "Arrow Right", svg: arrowRight },
  { name: "Arrow Up", svg: arrowUp },
  { name: "Aperture", svg: aperture },
  { name: "Atom", svg: atom },
  { name: "Battery", svg: battery },
  { name: "Breach", svg: breach },
  { name: "Broken Circle", svg: brokenCircle },
  { name: "Cargo", svg: cargo },
  { name: "Chat", svg: chat },
  { name: "Chevron Down", svg: chevronDown },
  { name: "Chevron Right", svg: chevronRight },
  { name: "Chevron Left", svg: chevronLeft },
  { name: "Chevron Up", svg: chevronUp },
  { name: "Computer", svg: computer },
  { name: "Cooler", svg: cooler },
  { name: "Cross Section", svg: crossSection },
  { name: "Cursor", svg: cursor },
  { name: "Currency", svg: currency },
  { name: "Danger Pattern", svg: danger },
  { name: "Door", svg: door },
  { name: "Double Chevron Down", svg: doubleChevronDown },
  { name: "Double Chevron Left", svg: doubleChevronLeft },
  { name: "Double Chevron Right", svg: doubleChevronRight },
  { name: "Double Chevron Up", svg: doubleChevronUp },
  { name: "ECG", svg: ecg },
  { name: "EMP", svg: emp },
  { name: "Fire", svg: fire },
  { name: "Fuel", svg: fuel },
  { name: "Fuel2", svg: fuel2 },
  { name: "Globe", svg: globe },
  { name: "Gravity", svg: gravity },
  { name: "Headlight", svg: headlight },
  { name: "Heat", svg: heat },
  { name: "Impulse", svg: impulse },
  { name: "Intake", svg: intake },
  { name: "Landing Gear", svg: landingGear },
  { name: "Laser", svg: laser},
  { name: "Life Support", svg: lifeSupport },
  { name: "Lightbulb", svg: lightBulb },
  { name: "Loading", svg: loading },
  { name: "Locked", svg: lock },
  { name: "Maneuvering Thrusters", svg: maneuveringThrusters },
  { name: "Missile", svg: missile },
  { name: "Missile Rack", svg: missileRack },
  { name: "People", svg: people },
  { name: "Person", svg: person },
  { name: "Power", svg: power },
  { name: "Power2", svg: power2 },
  { name: "Pull", svg: pull },
  { name: "Radar", svg: radar },
  { name: "Repair", svg: repair },
  { name: "Reset", svg: reset },
  { name: "Reticle Cross", svg: reticleCross },
  { name: "Reticle Diamond", svg: reticleDiamond },
  { name: "Reticle Open", svg: reticleOpen },
  { name: "Reticle Tri", svg: reticleTri },
  { name: "Rifle", svg: rifle },
  { name: "Scan", svg: scan },
  { name: "Seat", svg: seat },
  { name: "Shield", svg: shield },
  { name: "Sidearm", svg: sidearm },
  { name: "Sliders", svg: sliders },
  { name: "Skull", svg: skull },
  { name: "7-pointed Star", svg: star7 },
  { name: "Thrusters", svg: thrusters },
  { name: "Turret", svg: turret },
  { name: "Unlocked", svg: unlock },
  { name: "Weapon", svg: weapon },
];
