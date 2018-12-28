import { get } from 'lodash';
import React, {Component, Fragment} from 'react';


import {
    EuiButton,
    EuiFlexGroup,
    EuiFlexItem,
    // @ts-ignore
    EuiInMemoryTable,
    EuiLink,
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiSpacer,
    EuiText,
} from '@elastic/eui';

import { toastNotifications } from 'ui/notify';

export class JobsGridPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: [],
            loading: true,
            showConfirmDeleteModal: false,
            selectedSpace: null,
            error: null,
        };
    }

    componentDidMount() {
        this.loadGrid()
    }

    loadGrid = () => {
        const { jobsManager } = this.props;

        this.setState({
            loading: true,
            jobs: [],
        });

        const setJobs = (jobs) => {
            this.setState({
                loading: false,
                jobs,
            });
        };

        jobsManager
            .getJobs()
            .then(jobs => {
                setJobs(jobs);
            })
            .catch(error => {
                console.error(error);
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    onEditJobClick = ({id}) => {
        window.location.hash = `#/management/kibana/reporting/${encodeURIComponent(id)}/edit`;
    };

    onRemoveJobClick({id}) {
        const { jobsManager } = this.props;

        jobsManager
            .remove(id)
            .then(() => {
                this.loadGrid();

                const message = `Deleted "${id}" job.`;

                toastNotifications.addSuccess(message);
            })
            .catch(error => {
                const { message: errorMessage = '' } = error.data || {};
                this.setState({
                    loading: false,
                    error,
                });
                toastNotifications.addDanger(`Error deleting space: ${errorMessage}`);
            });
    };


    getColumnConfig() {
        return [
            {
                field: 'id',
                name: 'Name',
                sortable: true
            },
            {
                field: 'cron',
                name: 'CRON',
                sortable: true
            },
            {
                name: 'Interval',
                render({dateInterval}) {
                    return (
                        <div>{dateInterval ? dateInterval.display : ''}</div>
                    )
                }
            },
            {
                field: 'emails',
                name: 'EMAILs',
                sortable: true
            },
            {
                name: 'Actions',
                actions: [
                    {
                        name: 'Edit',
                        description: 'Edit this job.',
                        onClick: this.onEditJobClick,
                        type: 'icon',
                        icon: 'pencil',
                        color: 'primary',
                    },
                    {
                        name: 'Remove',
                        description: 'Remove this job.',
                        onClick: ( job => this.onRemoveJobClick(job)),
                        type: 'icon',
                        icon: 'trash',
                        color: 'danger',
                    }
                ],
            },
        ];
    }

    getPrimaryActionButton() {
        return (
            <EuiButton
                fill
                onClick={() => {
                    window.location.hash = `#/management/kibana/reporting/new`;
                }}
            >
                Create job
            </EuiButton>
        );
    }

    getPageContent() {
        return (
            <Fragment>
                <EuiFlexGroup justifyContent={'spaceBetween'}>
                    <EuiFlexItem grow={false}>
                        <EuiText>
                            <h1>Reporting jobs</h1>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>{this.getPrimaryActionButton()}</EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size={'xl'} />

                <EuiInMemoryTable
                    itemId={'id'}
                    items={this.state.jobs}
                    columns={this.getColumnConfig()}
                    hasActions
                    pagination={true}
                    search={{
                        box: {
                            placeholder: 'Search',
                        },
                    }}
                    loading={this.state.loading}
                    message={this.state.loading ? 'loading...' : undefined}
                />
            </Fragment>
        );
    }

    render() {
        return (
            <EuiPage restrictWidth>
                <EuiPageBody>
                    <EuiPageContent horizontalPosition="center">{this.getPageContent()}</EuiPageContent>
                </EuiPageBody>
            </EuiPage>
        )
    }
}