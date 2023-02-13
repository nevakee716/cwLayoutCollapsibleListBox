/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function (cwApi, $) {
  "use strict";
  var cwLayoutCollapsibleListBox;

  cwLayoutCollapsibleListBox = function (options, viewSchema) {
    cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
    this.drawOneMethod = cwApi.cwLayouts.cwLayoutList.drawOne.bind(this);
    cwApi.registerLayoutForJSActions(this);
    this.viewSchema = viewSchema;
    if (this.options.CustomOptions["title"] !== "") {
      this.title = this.options.CustomOptions["title"];
    } else {
      this.title = cwApi.mapToTranslation(this.mmNode.NodeName);
    }
    this.collapse = this.options.CustomOptions["collapse"];
    if (this.options.CustomOptions["complementary-node"] == "") {
      this.complementaryNode = [];
    } else {
      try {
        this.complementaryNode = this.options.CustomOptions["complementary-node"].split(",");
      } catch (e) {
        this.complementaryNode = [];
      }
    }
  };

  cwLayoutCollapsibleListBox.prototype.drawAssociations = function (output, associationTitleText, object) {
    /*jslint unparam:true*/
    this.drawListBox(output, object);
  };

  cwLayoutCollapsibleListBox.prototype.drawListBox = function (output, object) {
    var l, listBoxNameFromNode, associationTypeScriptName, associationTargetNode, objectId, canAddAssociation, ot, nodeSchema, layout;
    var self = this;
    layout = this;
    nodeSchema = this.mmNode;

    if (cwApi.isNull(object)) {
      // Is a creation page therefor a real object does not exist
      if (!cwApi.isUndefined(layout.mmNode.AssociationsTargetObjectTypes[layout.nodeID])) {
        objectId = 0;
        associationTargetNode = layout.mmNode.AssociationsTargetObjectTypes[layout.nodeID];
        nodeSchema = cwApi.ViewSchemaManager.getNodeSchemaById(this.viewSchema.ViewName, associationTargetNode.nodeID);
      } else {
        return;
      }
    } else {
      if (!cwApi.isUndefined(object.associations[layout.nodeID])) {
        objectId = object.object_id;
        associationTargetNode = object.associations[layout.nodeID];
      } else {
        return;
      }
    }

    if (this.options.CustomOptions["title_display"] && associationTargetNode.length === 0) return;
    output.push("<div");

    associationTypeScriptName = nodeSchema.AssociationTypeScriptName;

    output.push(" data-association-scriptname='", associationTypeScriptName, "'");
    output.push(" data-target-scriptname='", nodeSchema.ObjectTypeScriptName.toLowerCase(), "'");
    output.push(" data-node-id='", nodeSchema.NodeID, "'");
    if (!cwApi.isUndefined(objectId)) {
      output.push(" data-source-id='", objectId, "'");
    } else {
      objectId = Math.floor(Math.random() * 10000000);
    }
    output.push(" class='property-box ", layout.nodeID, "-node-box property-box-asso collapsible-list-box");

    if (
      associationTargetNode.length > 0 ||
      cwApi.queryObject.isEditMode() ||
      (this.complementaryNode &&
        this.complementaryNode.some(function (nodeID) {
          return object.associations && object.associations[nodeID] && object.associations[nodeID].length > 0;
        }))
    ) {
      output.push(" cw-visible");
    } else {
      output.push(" cw-hidden");
    }
    output.push("'>");
    output.push('<ul class="htmlbox-container property-details ', layout.nodeID, "-details ", layout.nodeID, "-", objectId, '-details">');
    this.htmlID = layout.nodeID + "-" + objectId;
    output.push(
      '<li id="htmlbox-header-',
      layout.nodeID,
      "-",
      objectId,
      '" class="htmlbox-header property-details ',
      layout.nodeID,
      "-details property-title ",
      layout.nodeID,
      "-title ",
      layout.nodeID,
      "-",
      objectId,
      '-details"'
    );
    if (associationTargetNode.length !== 0) output.push(" onClick=\"cwAPI.cwLayouts.cwLayoutCollapsibleListBox.click('", this.htmlID, "')\"");
    output.push(">");

    output.push('<div class="cw-property-details-left">');
    output.push('<div class="htmlbox-header-icon">');

    if (this.options.CustomOptions["notcollapsible"] !== true && associationTargetNode.length !== 0) {
      output.push('<div id="htmlbox-', this.nodeID, "-", objectId, '" class="');
      if (this.options.CustomOptions["collapse"] === true) {
        output.push("fa fa-plus");
      } else {
        output.push("fa fa-minus");
      }
      output.push('"></div>');
    }
    output.push('<label class="cw-property-title-displayname">', this.title, "</label></div>");
    output.push("</div>");

    output.push('<div class="cw-property-details-right">');

    canAddAssociation = cwApi.cwEditProperties.canAddAssociationInput(layout.nodeID);

    if (canAddAssociation === true) {
      if (!cwApi.cwEditProperties.isObjectTypeForbiddenToAdd(nodeSchema.ObjectTypeScriptName)) {
        cwApi.cwEditProperties.appendAddNewAssociationInput(
          output,
          layout.nodeID,
          objectId,
          layout,
          nodeSchema.NodeName,
          nodeSchema.ObjectTypeScriptName
        );
      }
      ot = cwApi.mm.getObjectType(nodeSchema.ObjectTypeScriptName.toLowerCase());
      cwApi.cwEditProperties.appendAssociationActionLink(output, layout.nodeID, objectId, ot.name);
    }

    output.push("</div>");
    if (canAddAssociation === true) {
      cwApi.cwEditProperties.appendAssociationSelect(output, layout.nodeID, objectId);
    }
    output.push("</li>");
    output.push(
      "<li id='",
      layout.nodeID,
      "-",
      objectId,
      "-value' class='property-details property-value ",
      layout.nodeID,
      "-details ",
      layout.nodeID,
      "-value ",
      layout.nodeID,
      "-",
      objectId,
      "-details' "
    );
    if (this.options.CustomOptions["collapse"] === true) {
      output.push('style="display:none;"');
    }
    output.push(">");

    l = cwApi.cwEditProperties.getLayoutWithTemplateOptions(this);
    l.drawAssociations(output, this.title, object);

    // complementary node
    this.complementaryNode.forEach(function (nodeID) {
      let compSchema = cwApi.ViewSchemaManager.getNode(self.viewSchema, nodeID);
      if (!compSchema) return;
      var compLayout = new cwApi.cwLayouts[compSchema.LayoutName](compSchema.LayoutOptions, self.viewSchema);
      cwApi.extend(compLayout, cwApi.cwLayouts.CwLayout, compSchema.LayoutOptions, self.viewSchema);
      l = cwApi.cwEditProperties.getLayoutWithTemplateOptions(compLayout);
      l.drawAssociations(output, self.title, object);
    });

    output.push("</li>");
    output.push("</ul>");
    output.push("</div>");
  };

  cwLayoutCollapsibleListBox.click = function (htmlID) {
    const listBoxHtml = document.getElementById("htmlbox-" + htmlID);
    const isShrinking = listBoxHtml.className.indexOf("minus") !== -1;
    const box = $("#htmlbox-" + htmlID);
    const row = $("#htmlbox-" + htmlID).parents("tr");
    const uid = row.attr("data-uid");
    cwLayoutCollapsibleListBox.heights = cwLayoutCollapsibleListBox.heights ?? {};
    cwLayoutCollapsibleListBox.heights[uid] = cwLayoutCollapsibleListBox.heights[uid] ?? box.parents("tr").height();
    const height =  cwLayoutCollapsibleListBox.heights[uid];

    if (cwApi.queryObject.isEditMode() && isShrinking) {
      return;
    }
    $("#" + htmlID + "-value").toggle("100", function () {
      $("#htmlbox-" + htmlID)
        .toggleClass("fa fa-minus")
        .toggleClass("fa fa-plus");
      $("#htmlbox-" + htmlID)
        .parent()
        .parent()
        .parent()
        .parent()
        .parent()
        .toggleClass("collapsed");
    });
    setTimeout(function () {
     
      if (row === undefined) return;
      let box = $("#htmlbox-" + htmlID);

      if(!isShrinking){
        $('[data-uid="' + uid + '"]').height(box.parents(".collapsible-list-box cw-visible").height() + 12);
        setTimeout(function () {
          if(!isShrinking){
            $('[data-uid="' + uid + '"]').height(box.parents("tr").height());
          }}, 500);
      } else {
        $('[data-uid="' + uid + '"]').height(height);
      }


    }, 500);
  };

  cwApi.cwLayouts.cwLayoutCollapsibleListBox = cwLayoutCollapsibleListBox;
})(cwAPI, jQuery);
