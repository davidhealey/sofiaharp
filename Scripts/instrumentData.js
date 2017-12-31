namespace instrumentData
{	
	const var allArticulations = ["normal", "staccato", "fingernail", "table", "harmonics"];
	const var articulationDisplayNames = ["Normal", "Staccato", "Fingernail", " Prés de la table", "Harmonics"];
	reg articulationIndex = []; //Instrument's articulations indexed against allArticulations

	//Instrument database
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

	//Instrument loading functions
	inline function loadInstrument(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		articulationIndex = indexArticulations(name);
		loadSampleMaps(name, entry);
	}
	
	inline function loadSampleMaps(name, entry)
	{
		for (id in samplerIds) //Each sampler ID
		{
			local s = Synth.getSampler(id); //Get the sampler
		
			for (a in entry.articulations) //Each of the entry's articulations
			{
				if (id.indexOf(a) != -1) //Sample ID contains articulation name
				{
					s.setBypassed(false);
					s.loadSampleMap(name + "_" + id); //Load sample map for this instrument
					break; //Exit inner loop
				}
				else 
				{
					s.setBypassed(true); //Bypass unused sampler
					s.loadSampleMap("empty"); //Load empty sample map
				}
			}
		}
	}
		
	//Returns the data entry for the given instrument
	inline function getData(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		return entry;
	}
	
	//Returns the full range of the instrument (maximum range of all articulations)
	inline function getRange(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		return entry.range;
	}
	
	//Returns the range of the specified articulation
	inline function getArticulationRange(name, articulation)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		return entry.articulations[articulation].range;
	}
	
	/**
	* Indexes the instrument's articulations agains all available articulations.
	*/
	inline function indexArticulations(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local index = [];

		for (k in entry.articulations)
		{
			if (allArticulations.contains(k))
			{
				index.push(allArticulations.indexOf(k));
			}
		}
		
		return index;
	}
	
	//Returns the number of articulations the insturment uses
	inline function getNumArticulations(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local i = 0;
		
		for (k in entry.articulations)
		{
			i++;
		}
		
		return i;
	}
	
	//Returns an array containing the names of all of the insturment's articulations
	inline function getArticulationNames(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local n = [];
		
		for (k in entry.articulations)
		{
			n.push(k);
		}
		
		return n;
	}
	
	//Returns an array containing the names of all of the insturment's articulations display names
	inline function getArticulationDisplayNames(name)
	{
		local entry = database[name]; //Get instrument entry from the database
		
		Console.assertIsObjectOrArray(entry); //Error if entry not found
		
		local n = [];
		
		for (k in entry.articulations) //Each of the insturment's articulations
		{
			n.push(articulationDisplayNames[allArticulations.indexOf(k)]);
		}
		
		return n;
	}
	
	//Returns the name of the articulation specified by the given index
	inline function getArticulationNameByIndex(idx)
	{
		return allArticulations[articulationIndex[idx]];
	}
	
	inline function getArticulationIndex(idx)
	{
		return articulationIndex[idx];
	}
}