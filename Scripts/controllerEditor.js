namespace controllerEditor
{
	inline function onInitCB()
	{
		const var parameters = ["Velocity", "Expression"];
		const var userCc = [-1, 11]; //User assigned controllers
		const var realCc = [-1, 11]; //Real CCs forwarded internally. -1 = velocity

		const var cmbParam = Content.getComponent("cmbParam");
		ui.comboBoxPanel("cmbParam", paintRoutines.comboBox, parameters, "Parameter");

		const var cmbCc = []; //Controller number selection combo boxes
		const var tblCc = []; //Controller value tables

		for (i = 0; i < parameters.length; i++)
		{
			//Controller selection
			cmbCc[i] = Content.addPanel("cmbCc"+i, 90, 76);
			Content.setPropertiesFromJSON("cmbCc"+i, {width:100, height:25, parentComponent:"pnlRightZone"});
			ui.comboBoxPanel("cmbCc"+i, paintRoutines.comboBox, ccNums, "Controller");
	
			//Response table
			tblCc[i] = Content.addTable("tblCc"+i, 10, 111);
			Content.setPropertiesFromJSON("tblCc"+i, {width:180, height:100, parentComponent:"pnlRightZone"});
		}
	}
	
	inline function onControlCB(number, value)
	{
		if (number == cmbParam)
		{
			for (i = 0; i < parameters.length; i++)
			{
				cmbCc[i].set("visible", false);
				tblCc[i].set("visible", false);
			}
			cmbCc[value-1].set("visible", true);
			tblCc[value-1].set("visible", true);
		}
		else 
		{
			for (i = 0; i < parameters.length; i++)
			{
				if (number == cmbCc[i])
				{
					if (realCc[i] != -1) //Velocity (ui control should be disabled anyway)
					{
						userCc[i] = value;
					}
					break; //Exit loop
				}
			}
		}
	}
}