namespace articulationEditor
{
	inline function onInitCB()
	{
		reg keyswitches = []; //User customisable values (unused ones will be set to -1 by script)
		const var programs = [1, 40, 9, 17, 10]; //UACC and Program Change numbers for articulations
		
		const var cmbKs = [];
		const var sliArtVol = [];
		const var sliAtk = [];
		const var sliRel = [];
		reg muters = [];
		reg envelopes = {};
	
		const var cmbArt = Content.getComponent("cmbArt");
		ui.comboBoxPanel("cmbArt", paintRoutines.comboBox, instrumentData.articulationDisplayNames, "Articulation");
	
		Content.setPropertiesFromJSON("lblArt", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblKs", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblArtVol", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblAtk", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		Content.setPropertiesFromJSON("lblRel", {fontName:Theme.H2.fontName, fontSize:Theme.H2.fontSize});
		
		for (i = 0; i < instrumentData.articulations.length; i++)
		{
			cmbKs.push(Content.getComponent("cmbKs"+i));
			ui.comboBoxPanel("cmbKs"+i, paintRoutines.comboBox, noteNames, "Key Switch");
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
				if (m.indexOf(instrumentData.articulations[i]) != -1) //MIDI muter ID contains articulation name
				{
					muters[i] = Synth.getMidiProcessor(m); //Get muter for articulation
					break; //Exit inner loop
				}
			}
	
			//Find envelopes for each articulation - ignore those with Release or Without envelope in the ID
			for (e in envelopeIds)
			{
				if (e.indexOf(instrumentData.articulations[i]) || e.indexOf("Release") == -1 || e.indexOf("Envelope"))
				{
					if (envelopes[i] == undefined) envelopes[i] = []; //An articulation may have more than one envelope
					envelopes[i].push(Synth.getModulator(e));
					break; //Exit inner loop
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
			cmbArt.setValue(idx+1); //Change displayed selected articulation
			cmbArt.repaint(); //Async repaint
			showArticulationControls(idx); //Change displayed articulation controls
			
		}
	}
	
	inline function onControlCB(number, value)
	{
		if (number == cmbArt)
		{
			changeArticulation(value-1);
			showArticulationControls(value-1);
		}

		for (i = 0; i < instrumentData.articulations.length; i++)
		{
			if (number == cmbKs[i]) //Key switch
			{
				if (value <= instrumentData.range[0] || value >= instrumentData.range[1]) //Outside playable range
				{
					Engine.setKeyColour(keyswitches[i], Colours.withAlpha(Colours.white, 0.0)); //Reset current KS colour
					keyswitches[i] = value-1; //Update KS
					Engine.setKeyColour(keyswitches[i], Colours.withAlpha(Colours.red, 0.3)); //Update KS colour			
					Console.print(value);
				}
				else 
				{
					cmbKs[i].setValue(keyswitches[i]+1); //Revert to previous KS
					cmbKs[i].repaintImmediately();
				}
				break;
			}
		}
	}
	
	inline function showArticulationControls(a)
	{
		for (i = 0; i < instrumentData.articulations.length; i++)
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
}