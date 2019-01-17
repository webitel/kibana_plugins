import React, { Component, Fragment } from 'react';

import {
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiPageContentBody,
    EuiPageContentHeader,
    EuiPageContentHeaderSection,
    EuiTitle,
    EuiForm,
    EuiFormRow,
    EuiFieldText,
    EuiButton,
    EuiButtonEmpty,
    EuiPanel,
    EuiCallOut,
    EuiSpacer,
    EuiOverlayMask,
    EuiModal,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiModalBody,
    EuiModalFooter,
} from '@elastic/eui';


export class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            isLoading: true,
            isValid: false,
            username: "",
            password: "",
            code: "",
        }
    }

    closeModal() {
        this.setState({ isModalVisible: false, message: '' });
    }

    showModal() {
        this.setState({
            isModalVisible: true,
            code: '',
            message: '',
            isLoading: false
        });
    }

    componentDidMount() {
        this.setState({isLoading: false})
    }

    onChange(e) {
        e.preventDefault();
        this.setState({
            [e.target.name]: e.target.value
        });
        this.setValid()
    }

    setValid() {
        this.setState({
            isValid: !!this.state.username
        })
    }

    submit(e) {
        e.preventDefault();
        if (!this.state.username) {
            return;
        }
        const { username, password } = this.state;

        this.auth(username, password, null);
    }

    twoFA() {
        const { username, password, code } = this.state;
        this.auth(username, password, code);
    };

    auth(username, password, code) {
        this.setState({
            isLoading: true
        });
        const { http, window, next } = this.props;
        http.post('./api/webitel/v1/login' + (code ? `?code=${code}` : ''), { username, password }).then(
            () => (window.location.href = next),
            (error) => {
                let { statusCode = 500, message } = error.data || {};

                if (statusCode === 301) {
                    this.showModal();
                    return;
                }

                if (!message && statusCode === 401) {
                    message = 'Invalid username or password. Please try again.';
                } else if (!message) {
                    message = 'Oops! Error. Try again.';
                }

                this.setState({
                    hasError: true,
                    message,
                    isLoading: false,
                });
            }
        );
    }

    getFormInputCode() {
        if (this.state.isModalVisible) {
            return (
                <EuiOverlayMask>
                    <EuiModal
                        onClose={this.closeModal.bind(this)}
                    >
                        <EuiModalHeader>
                            <EuiModalHeaderTitle >
                                Enter your two factor auth code
                            </EuiModalHeaderTitle>
                        </EuiModalHeader>

                        <EuiModalBody>
                            <EuiFormRow
                                label="Code"
                            >
                                <EuiFieldText id="code"
                                              name="code"
                                              value={this.state.code}
                                              onChange={(e) => this.onChange(e) }
                                              aria-required />
                            </EuiFormRow>
                            {this.renderMessage()}
                        </EuiModalBody>

                        <EuiModalFooter>
                            <EuiButtonEmpty
                                onClick={this.closeModal.bind(this)}
                            >
                                Cancel
                            </EuiButtonEmpty>

                            <EuiButton
                                onClick={this.twoFA.bind(this)}
                                isDisabled={!this.state.code}
                                fill
                            >
                                Auth
                            </EuiButton>
                        </EuiModalFooter>
                    </EuiModal>
                </EuiOverlayMask>
            )
        }
        return null;
    }

    renderMessage = () => {
        if (this.state.message) {
            return (
                <Fragment>
                    <EuiCallOut
                        size="s"
                        color="danger"
                        data-test-subj="loginErrorMessage"
                        title={this.state.message}
                        role="alert"
                    />
                    <EuiSpacer size="l"/>
                </Fragment>
            );
        }
    };

    render() {
        return (
            <EuiPage className="login-page">
                <EuiPageBody>
                    <EuiPageContent className="login-form" verticalPosition="center" horizontalPosition="center">
                        <EuiPageContentHeader>
                            <EuiPageContentHeaderSection>
                                <EuiTitle>
                                    <h2>Kibana</h2>
                                </EuiTitle>
                            </EuiPageContentHeaderSection>
                        </EuiPageContentHeader>
                        <EuiPageContentBody>
                            <form onSubmit={ e => this.submit(e)}>
                                <EuiFormRow
                                    label="Username"
                                >
                                    <EuiFieldText
                                        id="username"
                                        name="username"
                                        value={this.state.username}
                                        onChange={(e) => this.onChange(e) }
                                        aria-required
                                    />
                                </EuiFormRow>
                                <EuiFormRow
                                    label="Password"
                                >
                                    <EuiFieldText
                                        id="password"
                                        name="password"
                                        onChange={(e) => this.onChange(e) }
                                        value={this.state.password}
                                        type="password"
                                    />
                                </EuiFormRow>
                                <EuiFormRow
                                >
                                    <EuiButton type="submit" isLoading={this.state.isLoading} isDisabled={!this.state.isValid}>
                                        Login
                                    </EuiButton>
                                </EuiFormRow>
                            </form>
                            {this.renderMessage()}
                        </EuiPageContentBody>
                    </EuiPageContent>
                </EuiPageBody>
                {this.getFormInputCode()}
            </EuiPage>
        )
    }
}