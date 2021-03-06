import React, {Component, Fragment} from 'react';

import {timezones} from '../../../../lib/timezones'

import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
    EuiHorizontalRule,
    EuiLoadingChart,
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiPageContentBody,
    EuiSpacer,
    EuiTitle,
    EuiSelect,
    EuiComboBox,
    EuiTextArea,
    EuiBasicTable,
} from '@elastic/eui';

import {toastNotifications} from 'ui/notify';

const validateCron = (cronFormat = '') => {
    return /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/.test(cronFormat)
};

export class JobPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isInvalidEmail: true,
            job: {},
        };
        this.quickRanges = this.props.quickRanges.map((i, key) => {
            return {
                text: i.display,
                value: key
            }
        });
        this.timezones = timezones;
    }

    getJobDateIntervalValue = (id) => {
        for (let interval of this.quickRanges) {
            if (interval.text === id) {
                return interval.value
            }
        }
        return null
    };

    componentDidMount() {
        const {jobId, jobsManager} = this.props;

        if (jobId) {
            jobsManager
                .getJob(jobId)
                .then(job => {
                    job.dateInterval = this.getJobDateIntervalValue(job.dateInterval.display);
                    this.setState({
                        job,
                        isLoading: false,
                    });
                })
                .catch(error => {
                    const {message = ''} = error.data || {};

                    toastNotifications.addDanger(`Error loading space: ${message}`);
                    this.backToSpacesList();
                })
        } else {
            this.setState({isLoading: false});
        }
    }

    getLoadingIndicator = () => {
        return (
            <EuiFlexGroup justifyContent="spaceAround">
                <EuiFlexItem grow={false}>
                    <EuiLoadingChart size="xl"/>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    onChange(e) {
        const {job} = this.state;
        job[e.target.name] = e.target.value;
        this.setState({job})
    }

    saveJob() {
        const {job} = this.state;
        const {jobId, jobsManager, quickRanges} = this.props;

        if (!this.isValid()) {
            return;
        }

        const copy = Object.assign({}, job);
        copy.dateInterval = quickRanges[job.dateInterval];

        if (jobId) {
            jobsManager
                .update(jobId, copy)
                .then(({id}) => {
                    toastNotifications.addSuccess(`'${id}' was updated`);
                    this.backToJobsList();
                })
                .catch(error => {
                    const {message = ''} = error.data || {};
                    toastNotifications.addDanger(`Error update job: ${message}`);
                })
        } else {
            jobsManager
                .create(copy)
                .then(({id}) => {
                    toastNotifications.addSuccess(`'${id}' was created`);
                    this.backToJobsList();
                })
                .catch(error => {
                    const {message = ''} = error.data || {};
                    toastNotifications.addDanger(`Error create job: ${message}`);
                })
        }
    }

    backToJobsList = () => {
        window.location.hash = `#/management/kibana/reporting`;
    };

    isValid() {
        const {job} = this.state;

        if (!job.id || !validateCron(job.cron) || !job.dateInterval || !job.timezone || !job.emails
            || !job.subject ) {
            return false
        }
        return true
    }

    getFormButtons = () => {
        const {jobId} = this.props;
        const saveText = jobId ? 'Update job' : 'Save job';
        return (
            <EuiFlexGroup responsive={false}>
                <EuiFlexItem grow={false}>
                    <EuiButton fill onClick={this.saveJob.bind(this)} isDisabled={!this.isValid()}>
                        {saveText}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButtonEmpty onClick={this.backToJobsList}>
                        Cancel
                    </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={true}/>
            </EuiFlexGroup>
        );
    };

    getVisColumns = () => {
        return [
            {
                field: 'name',
                name: 'Name',
                sortable: true,
            },
            {
                name: 'Actions',
                actions: [
                    {
                        name: 'Edit',
                        description: 'Edit this visualize.',
                        onClick: (vis => this.openEditVis(vis)),
                        type: 'icon',
                        icon: 'pencil',
                        color: 'primary',
                    },
                    {
                        name: 'Remove',
                        description: 'Remove this visualize from job.',
                        onClick: ( vis => this.removeVisFromJob(vis)),
                        type: 'icon',
                        icon: 'trash',
                        color: 'danger',
                    }
                ],
            },
        ]
    };

    openEditVis(vis) {
        //TODO check changed data
        const { savedVisualizations } = this.props;
        window.location.hash = savedVisualizations.urlFor(vis.id);
    }

    removeVisFromJob({id}) {
        const {job} = this.state;
        if (job.vis instanceof Array) {
            job.vis = job.vis.filter(v => v.id !== id);
            this.setState({job})
        }
    }

    getReportingVisualize() {
        const {job} = this.state;
        const {jobId} = this.props;
        if (!jobId)
            return null;

        return (
            <EuiFlexGroup>
                <EuiFlexItem>
                    <h1>
                        <EuiTitle size="m">
                            <h1>Visualize</h1>
                        </EuiTitle>
                    </h1>
                    <EuiBasicTable
                        items={job.vis}
                        columns={this.getVisColumns()}
                    />
                </EuiFlexItem>
            </EuiFlexGroup>
        )
    }

    getForm() {
        return (
            <Fragment>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <div>
                            <EuiFormRow
                                label="Name"
                            >
                                <EuiFieldText
                                    id="id"
                                    name="id"
                                    value={this.state.job.id || ""}
                                    isInvalid={!this.state.job.id}
                                    disabled={this.props.jobId}
                                    onChange={(e) => this.onChange(e)}
                                    aria-required
                                />
                            </EuiFormRow>
                            <EuiFormRow
                                label="Crontab (Example: 1 */1 * * *)"
                            >
                                <EuiFieldText
                                    id="cron"
                                    name="cron"
                                    value={this.state.job.cron || ""}
                                    isInvalid={!validateCron(this.state.job.cron)}
                                    onChange={(e) => this.onChange(e)}
                                    aria-required
                                />
                            </EuiFormRow>
                            <EuiFormRow
                                label="Report interval"
                            >
                                <EuiSelect
                                    id="dateInterval"
                                    name="dateInterval"
                                    hasNoInitialSelection={true}
                                    options={this.quickRanges}
                                    value={this.state.job.dateInterval}
                                    isInvalid={!this.state.job.dateInterval}
                                    onChange={e => this.onChange(e)}
                                />
                            </EuiFormRow>
                            <EuiFormRow
                                label="Timezone"
                            >
                                <EuiSelect
                                    id="timezone"
                                    name="timezone"
                                    hasNoInitialSelection={true}
                                    options={this.timezones}
                                    value={this.state.job.timezone}
                                    isInvalid={!this.state.job.timezone}
                                    onChange={e => this.onChange(e)}
                                />
                            </EuiFormRow>
                        </div>

                    </EuiFlexItem>

                    <EuiFlexItem>
                        <EuiFormRow
                            label="Email(s)"
                        >
                            <EuiFieldText
                                id="emails"
                                name="emails"
                                value={this.state.job.emails || ""}
                                isInvalid={!this.state.job.emails}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="Subject"
                        >
                            <EuiFieldText
                                id="subject"
                                name="subject"
                                value={this.state.job.subject || ""}
                                isInvalid={!this.state.job.subject}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="Body"
                        >
                            <EuiTextArea
                                id="text"
                                name="text"
                                resize="vertical"
                                rows={5}
                                value={this.state.job.text || ""}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                </EuiFlexGroup>
                {this.getReportingVisualize()}
            </Fragment>
        )
    }

    render() {
        const content = this.state.isLoading ? this.getLoadingIndicator() : this.getForm();

        return (
            <EuiPage className="euiPage--restrictWidth-default">
                <EuiPageBody>
                    <EuiPageContent>
                        <EuiPageContentBody>{content}</EuiPageContentBody>

                        <EuiSpacer/>
                        {this.getFormButtons()}
                    </EuiPageContent>
                </EuiPageBody>
            </EuiPage>
        );
    }
}