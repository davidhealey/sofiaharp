namespace instData
{	
	const var allArticulations = ["normal", "staccato", "fingernail", "table", "harmonics"];
	const var articulationDisplayNames = ["Normal", "Staccato", "Fingernail", "Prés de la table", "Harmonics"];
	reg programs = [1, 40, 9, 17, 10]; //UACC and Program Change numbers for articulations

	const var database = {
		harp:
		{
			range:[26, 96], //Maximum range of instrument
			keyswitches:[98, 99, 100, 101, 102], //Default keyswitches (unused should be set to -1)
			articulations:
			{
				normal:{range:[26, 96]},
				staccato:{range:[26, 96]},
				fingernail:{range:[26, 96]},
				table:{range:[26, 96]},
				harmonics:{range:[40, 88]}
			}
		},
		test:
		{
			range:[50, 88], //Maximum range of instrument
			keyswitches:[98, 99, -1, 101, 102], //Default keyswitches
			articulations:
			{
				normal:{range:[50, 88]},
				staccato:{range:[50, 88]},
				//fingernail:{range:[26, 96]},
				table:{range:[60, 88]},
				harmonics:{range:[72, 82]}
			}
		}
		
	};
}