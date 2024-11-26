sap.ui.define(
    [
        "./BaseController"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("com.app.astra.controller.View2", {
        onInit: function() {
            const oRouter = this.getOwnerComponent().getRouter();  
            oRouter.attachRoutePatternMatched(this.onResourceDetailsLoad, this);
        },

        //READ OPERATION
        onResourceDetailsLoad: function (oEvent1) {
            const { id } = oEvent1.getParameter("arguments");  // Retrieve the ID from route arguments
            this.ID =parseInt(id) ;  // Save ID for later 
            var oModel=this.getOwnerComponent().getModel("ModelV2");
            var that=this;
            oModel.read(`/Star(${that.ID})`, { 
              success: function (odata) {
                  that.getView().byId("IDD").setValue(that.ID);
                  that.getView().byId("StarName").setValue(odata.StarName);
                  that.getView().byId("Constellation").setValue(odata.Constellation);
                  that.getView().byId("Description").setValue(odata.Description);
                  that.getView().byId("Type").setValue(odata.Type);
                  // that.getView().byId("TypeIN").setValue(odata.Type);
              },
              error: function (oError) {
                  // Handle error if star is not found
              }
          });
            
        },
        handleCancelPress: function () {
          window.history.back();
        },
        
      });
      
    }
  );
  