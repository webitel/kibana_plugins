import React, {Component, Fragment} from 'react';


import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFieldNumber,
    EuiCheckbox,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
    EuiFormControlLayout,
    EuiHorizontalRule,
    EuiLoadingChart,
    EuiSpacer,
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiPageContentBody,
    EuiButtonIcon,
    EuiTitle,
    EuiPanel
} from '@elastic/eui';


import { toastNotifications } from 'ui/notify';

export class EmailSettingsView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emailSettings: {
                auth:{}
            },
            visiblePassword: false,
            loading: true,
            changed: false,
            error: null,
        };
    }

    componentDidMount() {
        this.loadEmailSettings();
    }

    loadEmailSettings() {
        const {emailConfigurationManager} = this.props;

        emailConfigurationManager
            .getEmailConfiguration()
            .then(emailSettings => {
                if (!emailSettings.id) {
                    this.setState({loading: false});
                    return;
                }
                this.setState({emailSettings, loading: false});
            })
            .catch(error => {
                const { message = '' } = error.data || {};
                toastNotifications.addDanger(`Error opening email settings: ${message}`);
                this.closeConfiguration();
            })
    }

    saveConfiguration() {
        const {emailConfigurationManager} = this.props;
        const {emailSettings} = this.state;

        if (!this.isValid())
            return;

        emailConfigurationManager
            .saveEmailConfiguration(emailSettings)
            .then(() => {
                toastNotifications.addSuccess(`Email settings was saved`);
                this.closeConfiguration();
            })
            .catch(error => {
                const { message = '' } = error.data || {};
                toastNotifications.addDanger(`Error save email settings: ${message}`);
                this.closeConfiguration();
            })
    }

    isValid() {
        const {emailSettings = {}} = this.state;
        if (!emailSettings.auth || !emailSettings.auth.user || !emailSettings.auth.pass)
            return false;

        if (!emailSettings.host || !emailSettings.port || !emailSettings.host)
            return false;

        return true;
    }

    getLoadingIndicator = () => {
        return (
            <EuiFlexGroup justifyContent="spaceAround">
                <EuiFlexItem grow={false}>
                    <EuiLoadingChart size="xl"/>
                </EuiFlexItem>
            </EuiFlexGroup>
        )
    };

    onChange(e) {
        const {emailSettings} = this.state;
        switch (e.target.name) {
            case "port":
                emailSettings.port = +e.target.value;
                break;
            case "secure":
                emailSettings.secure = e.target.checked;
                break;
            case "authUsername":
                emailSettings.auth.user = e.target.value;
                break;
            case "authPassword":
                emailSettings.auth.pass = e.target.value;
                break;
            default:
                emailSettings[e.target.name] = e.target.value;
        }

        this.setState({emailSettings, changed: true})
    }

    getForm() {
        return (
            <Fragment>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiFormRow
                            label="Host address"
                        >
                            <EuiFieldText
                                id="host"
                                name="host"
                                value={this.state.emailSettings.host || ""}
                                isInvalid={!this.state.emailSettings.host}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="Auth username"
                        >
                            <EuiFieldText
                                id="authUsername"
                                name="authUsername"
                                value={this.state.emailSettings.auth.user || ""}
                                isInvalid={!this.state.emailSettings.auth.user}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="From email"
                        >
                            <EuiFieldText
                                id="from"
                                name="from"
                                value={this.state.emailSettings.from || ""}
                                isInvalid={!this.state.emailSettings.from}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>

                    </EuiFlexItem>

                    <EuiFlexItem>

                        <EuiFormRow
                            label="SMTP port"
                        >
                            <EuiFieldNumber
                                id="port"
                                name="port"
                                value={this.state.emailSettings.port || null}
                                isInvalid={!this.state.emailSettings.port}
                                onChange={(e) => this.onChange(e)}
                                aria-required
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label="Password"
                        >
                            <EuiFormControlLayout
                                append={
                                    <EuiButtonIcon
                                        onClick={() => this.setState({visiblePassword: !this.state.visiblePassword})}
                                        iconType={this.state.visiblePassword ? "eye" : "eyeClosed"}
                                        aria-label="Next"
                                    />
                                }
                            >
                                <input
                                    id="authPassword"
                                    name="authPassword"
                                    type={this.state.visiblePassword ? "text" : "password"}
                                    value={this.state.emailSettings.auth.pass || ""}
                                    isInvalid={!this.state.emailSettings.auth.pass}
                                    onChange={(e) => this.onChange(e)}
                                    className="euiFieldText euiFieldText--inGroup"
                                />
                            </EuiFormControlLayout>

                        </EuiFormRow>

                        <EuiFormRow hasEmptyLabelSpace={true}>
                            <EuiCheckbox
                                id="secure"
                                name="secure"
                                label="Secure (TLS)"
                                checked={this.state.emailSettings.secure}
                                onChange={(e) => this.onChange(e)}
                            />

                        </EuiFormRow>

                    </EuiFlexItem>
                </EuiFlexGroup>
            </Fragment>
        )
    }

    getFormButtons = () => {
        const {newRecord} = this.props;
        const saveText = newRecord ? 'Update configuration' : 'Save configuration';

        if (this.state.loading)
            return;

        return (
            <EuiFlexGroup responsive={false}>
                <EuiFlexItem grow={false}>
                    <EuiButton fill isDisabled={!this.state.changed || !this.isValid()} onClick={this.saveConfiguration.bind(this)}>
                        {saveText}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButtonEmpty onClick={this.closeConfiguration.bind(this)}>
                        Cancel
                    </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={true}/>
            </EuiFlexGroup>
        );
    }

    closeConfiguration() {
        const {close} = this.props;
        if (typeof close === "function") {
            close();
        }
    }

    render() {
        const content = this.state.loading ? this.getLoadingIndicator() : this.getForm();

        return (

            <EuiPanel>
                <EuiFlexGroup wrap>
                    <EuiFlexItem>
                        <EuiTitle size="s">
                            <h1>Email configuration</h1>
                        </EuiTitle>
                        <EuiSpacer/>
                        {content}
                        <EuiSpacer/>
                        {this.getFormButtons()}
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPanel>
        )
    }
}