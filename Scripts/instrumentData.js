namespace instData
{	
	const var allArticulations = ["normal", "staccato", "fingernail", "table", "harmonics"];
	const var articulationDisplayNames = ["Normal", "Staccato", "Fingernail", "Prés de la table", "Harmonics"];
	reg programs = [1, 40, 9, 17, 10]; //UACC and Program Change numbers for articulations
	reg keyswitches = [0, 1, 2, 3, 4]; //User customisable values (unused ones will be set to -1 by script)

	const var database = {
		harp:
		{
			range:[26, 96], //Maximum range of instrument
			articulations:
			{
				normal:{range:[26, 96]},
				staccato:{range:[26, 96]},
				fingernail:{range:[26, 96]},
				table:{range:[26, 96]},
				harmonics:{range:[40, 88]}
			}
		}
	};
}