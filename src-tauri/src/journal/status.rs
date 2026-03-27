use serde::Serialize;
use serde_json::Error;

#[derive(Debug, Serialize, Clone)]
pub struct BitFlag {
    pub key: &'static str,
    pub description: &'static str,
}

impl BitFlag {
    pub fn serialize(&self) -> Result<String, Error> {
        return serde_json::to_string(self);
    }
}

struct FlagBits(u32, u32);

impl FlagBits {
    const FLAG1_DESCRIPTIONS: [BitFlag; 32] = [
        BitFlag {
            key: "docked",
            description: "Docked",
        },
        BitFlag {
            key: "landed",
            description: "Landed",
        },
        BitFlag {
            key: "landinggeardown",
            description: "Landing Gear Down",
        },
        BitFlag {
            key: "shieldsup",
            description: "Shields Up",
        },
        BitFlag {
            key: "supercruise",
            description: "Supercruise",
        },
        BitFlag {
            key: "flightassistoff",
            description: "FlightAssist Off",
        },
        BitFlag {
            key: "hardpointsdeployed",
            description: "Hardpoints Deployed",
        },
        BitFlag {
            key: "inwing",
            description: "In Wing",
        },
        BitFlag {
            key: "lightson",
            description: "Lights On",
        },
        BitFlag {
            key: "cargoscoop",
            description: "Cargo Scoop Deployed",
        },
        BitFlag {
            key: "silentrunning",
            description: "Silent Running",
        },
        BitFlag {
            key: "scoopingfuel",
            description: "Scooping Fuel",
        },
        BitFlag {
            key: "srvhandbrake",
            description: "SRV Handbrake",
        },
        BitFlag {
            key: "srvturret",
            description: "SRV Turret View",
        },
        BitFlag {
            key: "srvturretretracted",
            description: "SRV Turret Retracted",
        },
        BitFlag {
            key: "srvdriveassist",
            description: "SRV Drive Assist",
        },
        BitFlag {
            key: "fsdmasslocked",
            description: "FSD Mass Locked",
        },
        BitFlag {
            key: "fsdcharging",
            description: "FSD Charging",
        },
        BitFlag {
            key: "fsdcooldown",
            description: "FSD Cooldown",
        },
        BitFlag {
            key: "lowfuel",
            description: "Low Fuel",
        },
        BitFlag {
            key: "overheating",
            description: "Overheating",
        },
        BitFlag {
            key: "haslatlong",
            description: "Has LatLong",
        },
        BitFlag {
            key: "indanger",
            description: "In Danger",
        },
        BitFlag {
            key: "interdiction",
            description: "Being Interdicted",
        },
        BitFlag {
            key: "inship",
            description: "In Ship",
        },
        BitFlag {
            key: "infighter",
            description: "In Fighter",
        },
        BitFlag {
            key: "insrv",
            description: "In SRV",
        },
        BitFlag {
            key: "hudanalysis",
            description: "HUD in Analysis Mode",
        },
        BitFlag {
            key: "nightvision",
            description: "Night Vision",
        },
        BitFlag {
            key: "altfromavgradius",
            description: "Altitude from Average Radius",
        },
        BitFlag {
            key: "fdsjump",
            description: "FSD Jump",
        },
        BitFlag {
            key: "srvhighbeam",
            description: "SRV HighBeam",
        },
    ];

    const FLAG2_DESCRIPTIONS: [BitFlag; 20] = [
        BitFlag {
            key: "onfoot",
            description: "On Foot",
        },
        BitFlag {
            key: "intaxi",
            description: "In Taxi",
        },
        BitFlag {
            key: "inmulti",
            description: "In Multicrew",
        },
        BitFlag {
            key: "footstation",
            description: "On Foot In Station",
        },
        BitFlag {
            key: "footplanet",
            description: "On Foot On Planet",
        },
        BitFlag {
            key: "ads",
            description: "Aiming Down Sight",
        },
        BitFlag {
            key: "lowoxygen",
            description: "Low Oxygen",
        },
        BitFlag {
            key: "lowhealth",
            description: "Low Health",
        },
        BitFlag {
            key: "cold",
            description: "Cold",
        },
        BitFlag {
            key: "hot",
            description: "Hot",
        },
        BitFlag {
            key: "verycold",
            description: "Very Cold",
        },
        BitFlag {
            key: "veryhot",
            description: "Very Hot",
        },
        BitFlag {
            key: "glidemode",
            description: "Glide Mode",
        },
        BitFlag {
            key: "foothangar",
            description: "On Foot In Hangar",
        },
        BitFlag {
            key: "footsocial",
            description: "On Foot In Social Space",
        },
        BitFlag {
            key: "footexterior",
            description: "On Foot Exterior",
        },
        BitFlag {
            key: "breathableatmo",
            description: "Breathable Atmosphere",
        },
        BitFlag {
            key: "telepresencemulti",
            description: "Telepresense Multicrew",
        },
        BitFlag {
            key: "physicalmulti",
            description: "Physical Multicrew",
        },
        BitFlag {
            key: "fsdhypercharging",
            description: "FSD Hyperdrive Charging",
        },
    ];

    pub fn enumerate() -> Vec<BitFlag> {
        let mut flags = Self::FLAG1_DESCRIPTIONS.to_vec();
        let mut flags2 = Self::FLAG2_DESCRIPTIONS.to_vec();
        flags.append(&mut flags2);
        return flags;
    }

    pub fn get_flags(&self) -> Vec<BitFlag> {
        let flags1value = self.0;
        let flags2value = self.1;

        let mut flags = Vec::new();
        for i in 0..Self::FLAG1_DESCRIPTIONS.len() {
            let mask = 1 << i;
            if (flags1value & mask) != 0 {
                flags.push(Self::FLAG1_DESCRIPTIONS[i].clone());
            }
        }

        for i in 0..Self::FLAG2_DESCRIPTIONS.len() {
            let mask = 1 << i;
            if (flags2value & mask) != 0 {
                flags.push(Self::FLAG2_DESCRIPTIONS[i].clone());
            }
        }

        return flags;
    }
}

#[test]
fn get_flags_returns_set_flags() {
    let rawflags = FlagBits(0b1101, 0b0000);

    let flags = rawflags.get_flags();

    assert_eq!(flags.len(), 3);
    assert_eq!(flags[0].key, "docked");
    assert_eq!(flags[1].key, "landinggeardown");
    assert_eq!(flags[2].key, "shieldsup");
}
