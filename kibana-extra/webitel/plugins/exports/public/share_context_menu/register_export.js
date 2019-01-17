import React from 'react';
import { ShareActionProps } from 'ui/share/share_action';
import { ShareContextMenuExtensionsRegistryProvider } from 'ui/share/share_action_registry';
import 'plugins/exports/services/export_data_service';

import { ExportPanelContent } from '../components/export_panel_content'

const title = "Printable";

function exportProvider(Private, $route, webitelExportDataService) {

    const getShareActions = ({objectType, sharingData}) => {
        const shareActions = [];
        let computedFields = null;

        if (objectType !== "search") {
            return shareActions
        }

        try {
            computedFields = $route.current.locals.ip.loaded.getComputedFields();
        } catch (e) {
            console.error("No computed fields")
        }

        shareActions.push({
            shareMenuItem: {
                name: title,
                icon: 'document',
                toolTipContent: title
            },
            panel: {
                title: title,
                content: (
                    <ExportPanelContent sharingData={sharingData} computedFields={computedFields} exportDataService={webitelExportDataService}/>
                ),
            },
        });

        return shareActions;
    };

    return {
        id: 'webitelExport',
        getShareActions,
    };
}

ShareContextMenuExtensionsRegistryProvider.register(exportProvider);