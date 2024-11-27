
sap.ui.define(
  [
    "./BaseController",
    //"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox", 
    "sap/ui/core/Fragment",
  ],
  function (Controller,JSONModel,MessageToast,MessageBox,Fragment) {
   "use strict";

  return Controller.extend("com.app.astra.controller.View1", {
    onInit: function () {},

    onOpenPopover: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "com.app.astra.fragments.PopOver",
					controller: this
				}).then(function(oPopover){
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			this._pPopover.then(function(oPopover){
				oPopover.openBy(oButton);
			});
		},

    //LOADING FRAGMENT OF ADDSTAR
    onCreateBtnPress: async function () {
      if (!this.oCreateStarDialog) {
        this.oCreateStarDialog = await this.loadFragment("AddStar");
      }
      this.oCreateStarDialog.open();
    },
    
     //CREATE DATA
     onCreateStar: async function () {
      debugger;

      // Retrieve OData model and get user input values
      var oModel = this.getView().getModel("ModelV2");   
 
      var oIDInput = this.byId("idIDInput").getValue();
      var oStarNameInput = this.byId("idStarNameInput").getValue();
      var oConstellationInput = this.byId("idConstellationInput").getValue();
      var oTypeInput = this.byId("idTypeInput").getValue();
      var oDescriptionInput = this.byId("idDescriptionInput").getValue();

      // Fetch the list of star to check for existing IDs
      let allStarList;
      try{
        allStarList = await new Promise((resolve, reject) => {
          oModel.read("/Star", {
             success: function (oData) {
              resolve(oData.results);
             },
             error: function (oError) {
               reject(oError);
             },
            });
        });
      } catch(error) {
        MessageBox.error("Unable to fetch existing stars. Please try again");
        return;
      }

      // Check if the Star name already exists in the list
      const bAlReadExistedName = allStarList.some(oName => oName.StarName === oStarNameInput);
      if(bAlReadExistedName) {
        MessageBox.error("Star Name Already Exists");
        this.getView().byId("idStarNameInput").setValueState(sap.ui.core.ValueState.Error);
        this.getView().byId("idStarNameInput").setValueStateText("Star name should be unique.");
        return;
      }

      // Validation: Check if all fields have at least 3 characters
      if (oStarNameInput.length < 3 ||oConstellationInput.length < 3 ||oTypeInput.length < 3 ||oDescriptionInput.length < 3) {
        MessageBox.error("All fields must contain at least 3 characters.");
        return;
      }

      // Create payload object
      var oPayload = {
        ID: oIDInput,
        StarName: oStarNameInput,
        Constellation: oConstellationInput,
        Type: oTypeInput,
        Description: oDescriptionInput,
      };

      try {
         // Attempt to create a new star
        await this.createData(oModel, oPayload, "/Star");
        this.getView().byId("idStarTable").getBinding("items").refresh();
        this.byId("idCreateStarDialog").close();
      } catch (error) {
        MessageBox.error("Duplicate ID are not allowed! Please Enter the ID correctly");
        return;
      }

      // Clear input fields after successful creation
      this.getView().byId("idIDInput").setValue("");
      this.getView().byId("idStarNameInput").setValue("");
      this.getView().byId("idConstellationInput").setValue(""); 
      this.getView().byId("idTypeInput").setValue("");
      this.getView().byId("idDescriptionInput").setValue("");

     
    },
    // Clear input fields
    onCloseDialog: function () {
      this.getView().byId("idIDInput").setValue("");
      this.getView().byId("idStarNameInput").setValue("");
      this.getView().byId("idConstellationInput").setValue(""); 
      this.getView().byId("idTypeInput").setValue("");
      this.getView().byId("idDescriptionInput").setValue("");
      this.byId("idCreateStarDialog").close();
    },


    //UPDATE STAR
    onPressUpdateBtn: async function () {

      var oTable = this.byId("idStarTable");
        var aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          MessageBox.warning("Please select a record to edit.");
          return;
        } else if (aSelectedItems.length > 1) {
          MessageBox.warning("Please select only one record to edit.");
          return;
        }

        // Get selected record data
        var oSelectedItem = aSelectedItems[0];
        var oContext = oSelectedItem.getBindingContext();
        var oData = oContext.getObject();

        //LOADING UPDATE FRAGMENT 
        if (!this._oEditDialog) {
          this._oEditDialog = await this.loadFragment("UpdateStar");
        }

        //Open dialog and set the existing data to inputs
        this.byId("idIDInput1").setValue(oData.ID);
        this.byId("idStarNameInput1").setValue(oData.StarName);
        this.byId("idConstellationInput1").setValue(oData.Constellation);
        this.byId("idTypeInput1").setValue(oData.Type);
        this.byId("idDescriptionInput1").setValue(oData.Description);

        this._oEditDialog.open();
      },

      onUpdateStar: async function () {
        // Retrieve the input fields and their values
        var sStarName = this.byId("idStarNameInput1").getValue();
        var sConstellation = this.byId("idConstellationInput1").getValue();
        var sType = this.byId("idTypeInput1").getValue();
        var sDescription = this.byId("idDescriptionInput1").getValue();

        // Initialize validation flag
        var bValidationPassed = true;

        // Validate that all fields are required and at least 3 characters long
        if (sStarName.length < 3) {
          this.byId("idStarNameInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idStarNameInput1").setValueStateText("StarName must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idStarNameInput1").setValueState(sap.ui.core.ValueState.None);
        }

        if (sConstellation.length < 3) {
          this.byId("idConstellationInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idConstellationInput1").setValueStateText("Constellation must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idConstellationInput1").setValueState(sap.ui.core.ValueState.None);
        }

        if (sType.length < 3) {
          this.byId("idTypeInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idTypeInput1").setValueStateText("Type must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idTypeInput1").setValueState(sap.ui.core.ValueState.None);
        }

        if (sDescription.length < 3) {
          this.byId("idDescriptionInput1").setValueState(sap.ui.core.ValueState.Error);
          this.byId("idDescriptionInput1").setValueStateText("Description must contain at least 3 characters.");
          bValidationPassed = false;
        } else {
          this.byId("idDescriptionInput1").setValueState(sap.ui.core.ValueState.None);
        }

        // If any validation fails, stop execution
        if (!bValidationPassed) {
          MessageBox.error("Please fill all fields with at least 3 characters.");
          return;
        }
                                                    
        // Proceed with update if validation passed
        var oModel = this.getView().getModel("ModelV2");
        var oTable = this.byId("idStarTable");

        // Create payload with updated data
        var oPayload = {
          StarName: sStarName,
          Constellation: sConstellation,
          Type: sType,
          Description: sDescription,
        };

        // Define the update path for the selected item
        var sPath = oTable.getSelectedItem().getBindingContext().getPath();

        try {
          // Update the entry
          await new Promise((resolve, reject) => {
            oModel.update(sPath, oPayload, {
              success: resolve,
              error: reject,
            });
          });

          // Refresh table data and close the dialog
          oTable.getBinding("items").refresh();
          this._oEditDialog.close();
          MessageBox.success("Record updated successfully.");
        } catch (error) {
          MessageBox.error("Failed to update record.");
        }
      },

      onCloseDialog1: function () {
        this._oEditDialog.close();
      },


    //   var oSelected = this.byId("idStarTable").getSelectedItems();
    //   if (oSelected.length > 0) {

    //     var oIDInput = this.byId("idStarTable").getSelectedItem().getBindingContext().getProperty("ID");
    //     var oStarNameInput = this.byId("idStarTable").getSelectedItem().getBindingContext().getProperty("StarName");
    //     var oConstellationInput = this.byId("idStarTable").getSelectedItem().getBindingContext().getProperty("Constellation");
    //     var oTypeInput = this.byId("idStarTable").getSelectedItem().getBindingContext().getProperty("Type");
    //     var oDescriptionInput = this.byId("idStarTable").getSelectedItem().getBindingContext().getProperty("Description");
         
    //     var newStar = new JSONModel({
    //       ID: oIDInput,
    //       StarName: oStarNameInput,
    //       Constellation: oConstellationInput,
    //       Type: oTypeInput,
    //       Description: oDescriptionInput,

    //     });
    //     this.getView().setModel(newStar, "newStar1");

    //     // LOADING FRAGMENT OF UPDATE Star
    //     if (!this.oUpdateStarDialog) {
    //       this.oUpdateStarDialog = await this.loadFragment("UpdateStar");
    //     }
    //     this.oUpdateStarDialog.open();
    //   } else {
    //     MessageToast.show("Please select Atleast one field");
    //   }
    // },date
    // onCloseDialog1: function () {
    //   this.byId("idCreateStarDialog1").close();
    // },

    // onUpdateStar: function () {
    //   var oPayload = this.getView().getModel("newStar1").getData();
    //   var oDataModel = this.getOwnerComponent().getModel("ModelV2"); // Assuming this is your OData V2 model

    //   try {
    //     // Assuming your update method is provided by your OData V2 model
    //     oDataModel.update("/Star(" + oPayload.ID + ")", oPayload, {
    //       success: function () {
    //         this.getView().byId("idStarTable").getBinding("items").refresh();
    //         this.oUpdateStarDialog.close();
    //         sap.m.MessageBox.success("Updated successfully");
    //       }.bind(this),
    //       error: function (oError) {
    //         this.oUpdateStarDialog.close();
    //       }.bind(this),
    //     });
    //   } catch (error) {
    //     this.oUpdateStarDialog.close();
    //     sap.m.MessageBox.error("Some technical Issue");
    //   }
    //},


    //DELETE DATA
    onPressDeleteBtn: function () {
      debugger;
      const oTable = this.byId("idStarTable");
      const aSelectedItems = oTable.getSelectedItems();

      if (aSelectedItems.length === 0) {
        sap.m.MessageBox.error("Please select at least one star to delete!");
        return;
      }

      // Gather names of selected stars
      const aStarNames = aSelectedItems.map((item) => item.getBindingContext().getObject().StarName);
      const sStarList = aStarNames.join(", ");
      const oModel = this.getView().getModel("ModelV2");
      const oThis = this;

      // Show confirmation dialog with names of selected stars
      sap.m.MessageBox.confirm(
        `Are you sure you want to delete the following stars: ${sStarList}?`,
        {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.YES) {
              let totalCount = aSelectedItems.length; // Total items to delete
              let successCount = 0; // Track successful deletions
              let hasDisplayedMessage = false; // Flag for success message

              aSelectedItems.forEach((item) => {
                const oContext = item.getBindingContext();
                const sPath = oContext.getPath();

                oModel.remove(sPath, {
                  success: function () {
                    successCount++;
                    oThis.getView().byId("idStarTable").getBinding("items").refresh();

                    // Check if all deletions are successful
                    if (successCount === totalCount && !hasDisplayedMessage) {
                      sap.m.MessageBox.success("Stars deleted successfully.");
                      hasDisplayedMessage = true; // Set the flag to true
                    }
                  },
                  error: function () {
                    sap.m.MessageToast.error("Failed to delete stars.");
                  },
                });
              });
            }
          },
        }
      );
    },

    onSelectParticularStar: function(oEvent) {
      const { ID } = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView2", {id: ID})
    }

  });
});
