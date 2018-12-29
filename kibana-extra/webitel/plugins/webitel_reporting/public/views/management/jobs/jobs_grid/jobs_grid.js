import React, {Component, Fragment} from 'react';
import {
    EuiButtonEmpty,
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
    EuiConfirmModal,
    EuiOverlayMask,
    EUI_MODAL_CONFIRM_BUTTON,
} from '@elastic/eui';

import { toastNotifications } from 'ui/notify';
import { openFlyout } from 'ui/flyout';
import { EmailSettingsView } from '../components/email_view'

export class JobsGridPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: [],
            loading: true,
            destroyJobId: null,
            selectedSpace: null,
            emailConfiguration: null,
            error: null,
        };
        this.closeDestroyModal = this.closeDestroyModal.bind(this);
        this.showDestroyModal = this.showDestroyModal.bind(this);
        this.removeJobConfirm = this.removeJobConfirm.bind(this);
    }

    componentDidMount() {
        this.loadGrid()
    }

    componentWillUnmount() {
        this.closeEmailConfiguration();
    }

    closeDestroyModal() {
        this.setState({ destroyJobId: null });
    }

    showDestroyModal({id}) {
        this.setState({ destroyJobId: id });
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

    removeJobConfirm() {
        const { jobsManager } = this.props;

        if (!this.state.destroyJobId) {
            return;
        }

        jobsManager
            .remove(this.state.destroyJobId)
            .then(({id}) => {
                this.setState({
                    destroyJobId: null
                });

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
                        onClick: ( job => this.showDestroyModal(job)),
                        type: 'icon',
                        icon: 'trash',
                        color: 'danger',
                    }
                ],
            },
        ];
    }

    openEmailConfiguration() {
        const {emailConfigurationManager} = this.props;

        const emailConfiguration = openFlyout(
            <EmailSettingsView
                emailConfigurationManager={emailConfigurationManager}
                close={this.closeEmailConfiguration.bind(this)}
            />,
            {
                'data-test-subj': 'reportingPanel',
                closeButtonAriaLabel: 'Close configuration',
            }
        );

        this.setState({emailConfiguration})
    }

    closeEmailConfiguration() {
        if (this.state.emailConfiguration) {
            this.state.emailConfiguration.close();
            this.setState({emailConfiguration: null})
        }
    }

    getPrimaryActionsButton() {
        return (
            <Fragment>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                    <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                            size="s"
                            iconType="infraApp"
                            onClick={this.openEmailConfiguration.bind(this)}
                        >
                            Email configuration
                        </EuiButtonEmpty>
                    </EuiFlexItem>

                    <EuiFlexItem grow={false}>

                        <EuiButtonEmpty
                            size="s"
                            iconType="createAdvancedJob"
                            onClick={() => {
                                window.location.hash = `#/management/kibana/reporting/new`;
                            }}
                        >
                            New job
                        </EuiButtonEmpty>
                    </EuiFlexItem>
                </EuiFlexGroup>




            </Fragment>
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
                    <EuiFlexItem grow={false}>{this.getPrimaryActionsButton()}</EuiFlexItem>
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
        let destroyModal;

        if (this.state.destroyJobId) {
            destroyModal = (
                <EuiOverlayMask>
                    <EuiConfirmModal
                        title="Do this destructive thing"
                        onCancel={this.closeDestroyModal}
                        onConfirm={this.removeJobConfirm}
                        cancelButtonText="No, don't do it"
                        confirmButtonText="Yes, do it"
                        buttonColor="danger"
                        defaultFocusedButton={EUI_MODAL_CONFIRM_BUTTON}
                    >
                        <p>You&rsquo;re about to destroy job {this.state.destroyJobId}.</p>
                        <p>Are you sure you want to do this?</p>
                    </EuiConfirmModal>
                </EuiOverlayMask>
            );
        }

        return (
            <EuiPage restrictWidth>
                <EuiPageBody>
                    <EuiPageContent horizontalPosition="center">{this.getPageContent()}</EuiPageContent>
                    {destroyModal}
                </EuiPageBody>
            </EuiPage>
        )
    }
}