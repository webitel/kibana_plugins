
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import routes from 'ui/routes';

import { JobsGridPage } from './jobs_grid'
import { JobPage } from './job_page'
import template from './template.html'
import {JobManager} from '../../../lib/job_manager'

const manageJobsReactRoot = "manageJobsReactRoot";

routes.when('/management/kibana/reporting', {
    template,
    controller($scope, $http, chrome) {
        $scope.$$postDigest(() => {
            const domNode = document.getElementById(manageJobsReactRoot);
            const jobManager = new JobManager($http, chrome);

            render(
                <JobsGridPage jobsManager={jobManager}/>,
                domNode
            );


            // unmount react on controller destroy
            $scope.$on('$destroy', () => {
                if (domNode) {
                    unmountComponentAtNode(domNode);
                }
            });
        });
    }
});

routes.when('/management/kibana/reporting/new', {
    template,
    controller($scope, $http, config, chrome) {
        $scope.$$postDigest(() => {
            const domNode = document.getElementById(manageJobsReactRoot);
            const jobManager = new JobManager($http, chrome);

            render(
                <JobPage quickRanges={config.get('timepicker:quickRanges')} jobsManager={jobManager}/>,
                domNode
            );

            // unmount react on controller destroy
            $scope.$on('$destroy', () => {
                if (domNode) {
                    unmountComponentAtNode(domNode);
                }
            });
        });
    }
});

routes.when('/management/kibana/reporting/:jobId/edit', {
    template,
    controller($scope, $http, config, chrome, $route) {
        $scope.$$postDigest(() => {
            const domNode = document.getElementById(manageJobsReactRoot);
            const jobManager = new JobManager($http, chrome);
            const {jobId} = $route.current.params;
            render(
                <JobPage
                    jobId={jobId}
                    quickRanges={config.get('timepicker:quickRanges')}
                    jobsManager={jobManager}
                />,
                domNode
            );

            // unmount react on controller destroy
            $scope.$on('$destroy', () => {
                if (domNode) {
                    unmountComponentAtNode(domNode);
                }
            });
        });
    }
});