import {get} from 'lodash';
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
    EuiLoadingSpinner,
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiPageContentBody,
    EuiSpacer,
    EuiTitle,
    EuiSelect,
    EuiComboBox,
    EuiTextArea,
} from '@elastic/eui';

import { toastNotifications } from 'ui/notify';

export class JobPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isInvalidEmail: true,
            job: {},
        };
        this.quickRanges = this.props.quickRanges.map( (i, key) => {
            return {
                text: i.display,
                value: key
            }
        });
        this.timezones = timezones;
    }

    componentDidMount() {
        const {jobId, jobsManager} = this.props;

        if (jobId) {
            jobsManager
                .getJob(jobId)
                .then(job => {
                    this.setState({
                        job,
                        isLoading: false,
                    });
                })
                .catch(error => {
                    const { message = '' } = error.data || {};

                    toastNotifications.addDanger(`Error loading space: ${message}`);
                    this.backToSpacesList();
                })
        } else {
            this.setState({isLoading: false});
        }
    }

    getLoadingIndicator = () => {
        return (
            <div>
                <EuiLoadingSpinner size={'xl'}/>{' '}
                <EuiTitle>
                    <h1>Loading...</h1>
                </EuiTitle>
            </div>
        );
    };

    onChange(e) {
        const { job } = this.state;
        job[e.target.name] = e.target.value;
        this.setState({job})
    }

    saveJob() {
        const { job } = this.state;
        const { jobId, jobsManager, quickRanges } = this.props;

        if (!this.isValid()) {
            return;
        }

        if (jobId) {

        } else {
            job.dateInterval = quickRanges[job.dateInterval];
            jobsManager
                .create(job)
                .then(result => {
                    debugger
                })
                .catch(error => {
                    const { message = '' } = error.data || {};

                    toastNotifications.addDanger(`Error loading space: ${message}`);
                    debugger
                })
        }
    }

    backToJobsList = () => {
        window.location.hash = `#/management/kibana/reporting`;
    };

    isValid() {
        const {job} = this.state;

        if (!job.id || !job.cron || !job.dateInterval || !job.timezone || !job.emails
            || !job.subject || !job.text) {
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
                    <EuiButton fill onClick={this.saveJob.bind(this)} isDisabled={!this.isValid()} >
                        {saveText}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButtonEmpty onClick={this.backToJobsList}>
                        Cancel
                    </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={true} />
            </EuiFlexGroup>
        );
    };

    getForm() {
        return (
            <EuiFlexGroup>
                <EuiFlexItem>

                    <div  >
                        <EuiFormRow
                            label="Name"
                        >
                            <EuiFieldText
                                id="id"
                                name="id"
                                value={this.state.job.id || ""}
                                isInvalid={!this.state.job.id}
                                onChange={(e) => this.onChange(e) }
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
                                isInvalid={!this.state.job.cron}
                                onChange={(e) => this.onChange(e) }
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
                                onChange={ e => this.onChange(e) }
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
                                onChange={ e => this.onChange(e) }
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="Email(s)"
                        >
                            <EuiFieldText
                                id="emails"
                                name="emails"
                                value={this.state.job.emails || ""}
                                isInvalid={!this.state.job.emails}
                                onChange={(e) => this.onChange(e) }
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
                                onChange={(e) => this.onChange(e) }
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
                                isInvalid={!this.state.job.text}
                                onChange={(e) => this.onChange(e) }
                                aria-required
                            />
                        </EuiFormRow>


                    </div>

                </EuiFlexItem>

                <EuiFlexItem>
                    TODO grid vis
                </EuiFlexItem>

            </EuiFlexGroup>

        )
    }

    render() {
        const content = this.state.isLoading ? this.getLoadingIndicator() : this.getForm();

        return (
            <EuiPage className="euiPage--restrictWidth-default">
                <EuiPageBody>
                    <EuiPageContent>
                        <EuiPageContentBody>{content}</EuiPageContentBody>

                        <EuiSpacer />
                        {this.getFormButtons()}
                    </EuiPageContent>
                </EuiPageBody>
            </EuiPage>
        );
    }
}