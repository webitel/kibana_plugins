/**
 * Created by igor on 14.11.16.
 */

"use strict";

import { management } from 'ui/management';
import routes from 'ui/routes';

import 'plugins/webitel_reporting/views/management/jobs';

routes.defaults(/\/management/, {
    resolve: {
        reportingManagementSection: function (Private) {
            const kibanaManagementSection = management.getSection('kibana');
            kibanaManagementSection.deregister('reporting');

            return kibanaManagementSection.register('reporting', {
                order: 20,
                display: 'Reporting',
                url: '#/management/kibana/reporting'
            })
        }
    }
});
