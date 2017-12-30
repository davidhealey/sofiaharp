namespace articulationEditor
{
	inline function onInitCB()
	{
		reg keyswitches = []; //User customisable values (unused ones will be set to -1 by script)
		reg programs = [1, 40, 9, 17, 10]; //UACC and Program Change numbers for articulations
		const var articulationNames = instrumentData.getArticulationNames(instrumentName); //Instrument's articulations
		
		const var envelopeIds = Synth.getIdList("Simple Envelope");
		const var muterIds = Synth.getIdList("MidiMuter");
		
		reg containers = []; //Containers whose IDs match articulation names
		reg muters = [];
		reg envelopes = {};
	
		//Get articulation containers
		for (c in containerIds) //containerIDs is in main script
		{
			if (instrumentData.allArticulations.indexOf(c) != -1)
			{
				containers.push(Synth.getChildSynth(c));
			}
		}
		
		//GUI
		const var cmbKs = [];
		const var sliArtVol = [];
		const var sliAtk = [];
		const var sliRel = [];
				
		const var cmbArt = Content.getComponent("cmbArt");
		ui.comboBoxPanel("cmbArt", paintRoutines.comboBox, articulationNames);
	
		Content.setPropertiesFromJSON("lblArt", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblKs", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblArtVol", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblAtk", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblRel", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		
		for (i = 0; i < instrumentData.allArticulations.length; i++)
		{
			cmbKs.push(Content.getComponent("cmbKs"+i));
			ui.comboBoxPanel("cmbKs"+i, paintRoutines.comboBox, noteNames);
			Content.setPropertiesFromJSON("cmbKs"+i, {x:90});
	
			sliAtk.push(Content.getComponent("sliAtk"+i));
			Content.setPropertiesFromJSON("sliAtk"+i, {x:90, bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
	
			sliRel.push(Content.getComponent("sliRel"+i));
			Content.setPropertiesFromJSON("sliRel"+i, {x:90, bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
	
			sliArtVol.push(Content.getComponent("sliArtVol"+i));
			Content.setPropertiesFromJSON("sliArtVol"+i, {x:90, bgColour:Theme.SLIDER.bg, itemColour:Theme.SLIDER.fg});
	
			//Get MIDI muter for each articulation
			for (m in muterIds) //Each MIDI muter ID
			{
				if (m.indexOf(instrumentData.allArticulations[i]) != -1) //MIDI muter ID contains articulation name
				{
					muters[i] = Synth.getMidiProcessor(m); //Get muter for articulation
					break; //Exit inner loop
				}
			}
	
			//Find envelopes for each articulation - ignore those with Release or Without envelope in the ID
			for (e in envelopeIds)
			{
				if (e.indexOf(instrumentData.allArticulations[i]) != -1 && e.indexOf("nvelope") != -1 && e.indexOf("Release") == -1)
				{
					if (envelopes[i] == undefined) envelopes[i] = []; //An articulation may have more than one envelope
					envelopes[i].push(Synth.getModulator(e));
				}
			}
		}
	}
	
	inline function onNoteCB()
	{
		local idx = keyswitches.indexOf(Message.getNoteNumber()); //Check for index in keyswitches array
		
		if (idx != -1) //Keyswitch triggered the callback
		{
			changeArticulation(idx);
			colourPlayableKeys();
			cmbArt.setValue(idx+1); //Change displayed selected articulation
			cmbArt.repaint(); //Async repaint
			showArticulationControls(idx); //Change displayed articulation controls	
		}
	}
	
	inline function onControllerCB()
	{
		local v; //For converting the CC value (0-127) to the correct slider value
		local skewFactor = 5.0; //values > 1 will yield more resolution at the lower end
		local normalised = Message.getControllerValue() / 127.0;
		
		switch (Message.getControllerNumber())
		{		
			case 32: //UACC
				local idx = programs.indexOf(Message.getControllerValue()); //Lookup program number
				
				if (idx != -1) //Assigned program number triggered callback
				{
					changeArticulation(idx);
					colourPlayableKeys();
					cmbArt.setValue(idx+1); //Change displayed selected articulation
					cmbArt.repaint(); //Async repaint
					showArticulationControls(idx); //Change displayed articulation controls	
				}
			break;
			
			case 73: //MIDI attack CC
				v = (Math.pow(normalised, skewFactor)) * 20000.0;
				sliAtk[cmbArt.getValue()-1].setValue(v);
				setEnvelopeAttack(cmbArt.getValue()-1, v);
			break;
			
			case 72: //MIDI release CC
				v = (Math.pow(normalised, skewFactor)) * 20000.0;
				sliRel[cmbArt.getValue()-1].setValue(v);
				setEnvelopeRelease(cmbArt.getValue()-1, v);
			break;
		}
	}
	
	inline function onControlCB(number, value)
	{
		if (number == cmbArt)
		{
			changeArticulation(value-1);
			colourPlayableKeys();
			showArticulationControls(value-1);
		}

		for (i = 0; i < instrumentData.allArticulations.length; i++)
		{
			if (number == cmbKs[i]) //Key switch
			{
				local r = instrumentData.getRange(instrumentName); //Full playable range of instrument
				
				if (value <= r[0] || value >= r[1]) //Outside playable range
				{
					Engine.setKeyColour(keyswitches[i], Colours.withAlpha(Colours.white, 0.0)); //Reset current KS colour
					keyswitches[i] = value-1; //Update KS
					Engine.setKeyColour(keyswitches[i], Colours.withAlpha(Colours.red, 0.3)); //Update KS colour			
				}
				else 
				{
					cmbKs[i].setValue(keyswitches[i]+1); //Revert to previous KS
					cmbKs[i].repaintImmediately();
				}
				break;
			}
			else if (number == sliArtVol[i]) //Articulation volume
			{
				containers[i].setAttribute(0, Engine.getGainFactorForDecibels(value));
				break;
			}
			else if (number == sliAtk[i])
			{
				setEnvelopeAttack(i, value);
				break;
			}
			else if (number == sliRel[i])
			{
				setEnvelopeRelease(i, value);
				break;
			}
		}
	}
	
	inline function setEnvelopeAttack(idx, value)
	{
		for (e in envelopes[idx]) //Each envelope for the articulation (i)
		{
			e.setAttribute(e.Attack, value);
		}
	}
	
	inline function setEnvelopeRelease(idx, value)
	{
		for (e in envelopes[idx]) //Each envelope for the articulation (i)
		{
			e.setAttribute(e.Release, value);
		}
	}
	
	inline function showArticulationControls(a)
	{
		for (i = 0; i < instrumentData.allArticulations.length; i++)
		{
			//Hide all articulations controls
			cmbKs[i].set("visible", false);
			sliArtVol[i].set("visible", false);
			sliAtk[i].set("visible", false);
			sliRel[i].set("visible", false);
		}
		
		//Show controls for current articulation (a)
		cmbKs[a].set("visible", true);
		sliArtVol[a].set("visible", true);
		sliAtk[a].set("visible", true);
		sliRel[a].set("visible", true);		
	}
	
	inline function changeArticulation(a)
	{
		if (a > -1) //Sanity check
		{
			//Mute every articulation
			for (m in muters) //Each Midi muter
			{
				m.setAttribute(0, 1);
			}
		
			muters[a].setAttribute(0, 0); //Unmute articulation (a)	
		}
	}
	
	inline function colourPlayableKeys()
	{
		local instRange = instrumentData.getRange(instrumentName); //Full playable range of instrument
		local a = articulationNames[cmbArt.getValue()-1]; //Current articulation name
		local r = instrumentData.getArticulationRange(instrumentName, a); //Range of current articulation

		for (i = instRange[0]; i < instRange[1]; i++) //Each potentially playable key
		{
			Engine.setKeyColour(i, Colours.withAlpha(Colours.white, 0.0)); //Reset key colour
			
			if (i >= r[0] && i <= r[1]) //i is in articulation's range
			{
				Engine.setKeyColour(i, Colours.withAlpha(Colours.blue, 0.3)); //Update KS colour	
			}
		}
	}
}