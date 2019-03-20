import { get } from 'lodash';
import React, {Component, Fragment} from 'react';

import { UnauthorizedPrompt } from '../components/unauthorized_prompt'

import { NavLinksSettingsView } from './nav_links'
import { openFlyout } from 'ui/flyout';

import {
    EuiButton,
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
} from '@elastic/eui';

export class SpacesACLGridPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spaces: [],
            loading: true,
            showConfirmDeleteModal: false,
            selectedSpace: null,
            navLinkConfiguration: null,
            error: null,
            showNavLinkDialog: false
        };
    }

    componentDidMount() {
        this.loadGrid();
    }

    render() {
        return (
            <EuiPage restrictWidth>
                <EuiPageBody>
                    <EuiPageContent horizontalPosition="center">{this.getPageContent()}</EuiPageContent>
                </EuiPageBody>
            </EuiPage>
        );
    }

    getPageContent() {
        if (!this.props.userProfile.hasCapability('manageSpaces')) {
            return <UnauthorizedPrompt />;
        }

        return (
            <Fragment>
                <EuiFlexGroup justifyContent={'spaceBetween'}>
                    <EuiFlexItem grow={false}>
                        <EuiText>
                            <h1>Access control spaces</h1>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>{this.getPrimaryActionsButton()}</EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size={'xl'} />

                <EuiInMemoryTable
                    itemId={'id'}
                    items={this.state.spaces}
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

    getColumnConfig() {
        return [
            {
                field: 'name',
                name: 'Space',
                sortable: true,
                render: (value, record) => {
                    return (
                        <EuiLink
                            onClick={() => {
                                this.onEditSpaceClick(record);
                            }}
                        >
                            {value}
                        </EuiLink>
                    );
                },
            },
            {
                field: 'id',
                name: 'Identifier',
                sortable: true,
            },
            {
                field: 'description',
                name: 'Description',
                sortable: true,
            },
            {
                name: 'Actions',
                actions: [
                    {
                        name: 'Edit',
                        description: 'Edit this space.',
                        onClick: this.onEditSpaceClick,
                        type: 'icon',
                        icon: 'pencil',
                        color: 'primary',
                    }
                ],
            },
        ];
    }

    loadGrid = () => {
        const { spacesManager } = this.props;

        this.setState({
            loading: true,
            spaces: [],
        });

        const setSpaces = (spaces) => {
            this.setState({
                loading: false,
                spaces,
            });
        };

        spacesManager
            .getSpaces()
            .then(spaces => {
                setSpaces(spaces.filter(filterAllowSpaces));
            })
            .catch(error => {
                this.setState({
                    loading: false,
                    error,
                });
            });
    };

    openNavLinksSettings() {
        const navLinkConfiguration = openFlyout(
            <NavLinksSettingsView
                close={this.closeNavLinksSettings.bind(this)}
                roleManager={this.props.roleManager}
                config={this.props.config}
            />,
            {
                closeButtonAriaLabel: 'Close configuration',
            }
        );

        this.setState({navLinkConfiguration})

    }

    closeNavLinksSettings() {
        if (this.state.navLinkConfiguration) {
            this.state.navLinkConfiguration.close();
            this.setState({navLinkConfiguration: null})
        }
    }

    getPrimaryActionsButton() {
        return (
            <Fragment>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                    <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                            size="s"
                            iconType="eyeClosed"
                            onClick={this.openNavLinksSettings.bind(this)}
                        >
                            Navigation links configuration
                        </EuiButtonEmpty>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </Fragment>
        );
    }

    onEditSpaceClick = (space) => {
        window.location.hash = `#/management/security_spaces/edit/${encodeURIComponent(space.id)}`;
    }
}

function filterAllowSpaces(space) {
    return get(space, '_reserved', false) === false;
}