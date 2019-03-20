import React, {Component, Fragment} from 'react';

import { toastNotifications } from 'ui/notify';
import chrome from 'ui/chrome';

import {
    EuiText,
    EuiButton,
    EuiButtonEmpty,
    EuiPanel,
    EuiFlexGroup,
    EuiFlexItem,
    EuiTitle,
    EuiSpacer,
    EuiFieldText,
    EuiForm,
    EuiComboBox,
    EuiFormRow
} from '@elastic/eui';

import {HIDDEN_CONFIG_ID} from '../../../lib/config'

export class NavLinksSettingsView extends Component {
    constructor(props) {
        super(props);

        this.options = chrome.getNavLinks().map(i => {
            return {
                id: i.id,
                label: i.title
            }
        });

        this.state = {
            loading: false,
            changed: false,
            error: null,
            roles: [],
            hiddenLinks: {}
        };
    }

    componentDidMount() {
        this.loadRoles();
        this.loadHiddenMenuForRoles();
    }

    loadHiddenMenuForRoles() {
        const {config} = this.props;
        let hiddenLinks = {};
        try {
            const values = config.get(HIDDEN_CONFIG_ID, {});
            if (values) {
                hiddenLinks = JSON.parse(values)
            }
        } catch (e) {

        }
        this.setState({hiddenLinks});
    }

    saveConfiguration() {
        const {config} = this.props;
        config.set(HIDDEN_CONFIG_ID, this.state.hiddenLinks);
        this.closeConfiguration();
    }

    loadRoles() {
        const { roleManager } = this.props;
        roleManager.getRoles()
            .then(result => {
                const { roles = []} = result;
                this.setState({roles: arrayToOptions(roles)});
            })
            .catch(error => {
                const { message = '' } = error.data || {};

                toastNotifications.addDanger(`Error loading roles: ${message}`);
            })
    }

    onChange(role, selectedOptions) {
        const hiddenLinks = this.state.hiddenLinks || {};
        if (!hiddenLinks.hasOwnProperty(role)) {
            hiddenLinks[role] = []
        }

        hiddenLinks[role] = selectedOptions;
        this.setState({hiddenLinks})
    }

    getSelectedLinks(role) {
        if (this.state.hiddenLinks.hasOwnProperty(role)) {
            return this.state.hiddenLinks[role] || []
        } else {
            return []
        }
    }

    getForm() {
        return (
            <Fragment>
                {this.state.roles.map(l => {
                    return (
                        <div>
                            <EuiFormRow
                                label={l.value}
                                fullWidth={true}
                            >
                                <EuiComboBox
                                    fullWidth={true}
                                    placeholder="Select hidden links"
                                    options={this.options}
                                    isClearable={false}
                                    selectedOptions={this.getSelectedLinks(l.value)}
                                    onChange={e => this.onChange(l.value, e)}
                                />
                            </EuiFormRow>
                        </div>
                    )
                })}
            </Fragment>
        )
    }

    closeConfiguration() {
        const {close} = this.props;
        if (typeof close === "function") {
            close();
        }
    }

    getFormButtons = () => {
        const saveText = 'Save configuration';

        if (this.state.loading)
            return;

        return (
            <EuiFlexGroup responsive={false}>
                <EuiFlexItem grow={false}>
                    <EuiButton fill onClick={this.saveConfiguration.bind(this)}>
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
    };

    render() {
        const content = this.getForm();

        return (
            <EuiPanel>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiTitle size="s">
                            <h1>Hidden navigation links for role</h1>
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

function arrayToOptions(arr = []) {
    return arr.map(i => {
        return {value: i, label: i};
    })
}