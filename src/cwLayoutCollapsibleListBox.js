/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function(cwApi, $) {
    'use strict';
    var cwLayoutCollapsibleListBox;

    cwLayoutCollapsibleListBox = function(options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
        this.drawOneMethod = cwApi.cwLayouts.cwLayoutList.drawOne.bind(this);
        cwApi.registerLayoutForJSActions(this);
    }

    cwLayoutCollapsibleListBox.prototype.drawAssociations = function(output, associationTitleText, object) {
        /*jslint unparam:true*/
        this.drawListBox(output, object);
    };

    cwLayoutCollapsibleListBox.prototype.drawListBox = function(output, object) {
        var l, listBoxNameFromNode, associationTypeScriptName, associationTargetNode, objectId, canAddAssociation, ot, nodeSchema, layout;

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

        output.push("<div");
        listBoxNameFromNode = cwApi.mapToTranslation(nodeSchema.NodeName);
        associationTypeScriptName = nodeSchema.AssociationTypeScriptName;

        output.push(" data-association-scriptname='", associationTypeScriptName, "'");
        output.push(" data-target-scriptname='", nodeSchema.ObjectTypeScriptName.toLowerCase(), "'");
        output.push(" data-node-id='", nodeSchema.NodeID, "'");
        if (!cwApi.isUndefined(objectId)) {
            output.push(" data-source-id='", objectId, "'");
        } else {
            objectId = 0;
        }
        output.push(" class='property-box ", layout.nodeID, "-node-box property-box-asso collapsible-list-box");
        if (associationTargetNode.length > 0 || cwApi.queryObject.isEditMode()) {
            output.push('cw-visible');
        } else {
            output.push('cw-hidden');
        }
        output.push("'>");
        output.push('<ul class="htmlbox-container property-details ', layout.nodeID, '-details ', layout.nodeID, '-', objectId, '-details">');
        output.push('<li id="htmlbox-header-', layout.nodeID,'" class="htmlbox-header property-details ', layout.nodeID, '-details property-title ', layout.nodeID, '-title ', layout.nodeID, '-', objectId, '-details" onClick="$(\'#'+layout.nodeID+'-'+objectId+'-value\').toggle(\'300\', function(){$(\'#htmlbox-'+layout.nodeID+'\').toggleClass(\'htmlbox-header-icon-min\').toggleClass(\'htmlbox-header-icon-max\')})">');
        output.push('<div class="cw-property-details-left">');
        output.push('<label class="cw-property-title-displayname">', listBoxNameFromNode, '</label>');
        output.push('</div>');

        output.push('<div class="cw-property-details-right">');

        canAddAssociation = cwApi.cwEditProperties.canAddAssociationInput(layout.nodeID);

        if (canAddAssociation === true) {
            if (!cwApi.cwEditProperties.isObjectTypeForbiddenToAdd(nodeSchema.ObjectTypeScriptName)) {
                cwApi.cwEditProperties.appendAddNewAssociationInput(output, layout.nodeID, objectId, layout, nodeSchema.NodeName, nodeSchema.ObjectTypeScriptName);
            }
            ot = cwApi.mm.getObjectType(nodeSchema.ObjectTypeScriptName.toLowerCase());
            cwApi.cwEditProperties.appendAssociationActionLink(output, layout.nodeID, objectId, ot.name);
        }
        output.push('<div class="htmlbox-header-icon"><div id="htmlbox-', layout.nodeID, '" class="');
        if (this.options.CustomOptions['collapse'] === true){
            output.push('htmlbox-header-icon-max');
        } else {
            output.push('htmlbox-header-icon-min');
        }
        output.push('"></div></div>');
        output.push('</div>');
        if (canAddAssociation === true) {
            cwApi.cwEditProperties.appendAssociationSelect(output, layout.nodeID, objectId);
        }
        output.push("</li>");
        output.push("<li id='", layout.nodeID, "-", objectId, "-value' class='property-details property-value ", layout.nodeID, "-details ", layout.nodeID, "-value ", layout.nodeID, "-", objectId, "-details' ");
        if (this.options.CustomOptions['collapse'] === true){
            output.push('style="display:none;"');
        }
        output.push('>');
        l = cwApi.cwEditProperties.getLayoutWithTemplateOptions(this);
        l.drawAssociations(output, listBoxNameFromNode, object);
        output.push("</li>");
        output.push("</ul>");
        output.push('</div>');
    };


    cwApi.cwLayouts.cwLayoutCollapsibleListBox = cwLayoutCollapsibleListBox;

}(cwAPI, jQuery));