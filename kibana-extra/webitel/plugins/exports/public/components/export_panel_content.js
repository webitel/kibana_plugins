import React, {Component} from 'react';

import {
    EuiRadioGroup,
    EuiForm,
    EuiFormRow,
    EuiSpacer,
    EuiButton,
    EuiText
} from '@elastic/eui';

import {toastNotifications} from 'ui/notify';

export class ExportPanelContent extends Component {
    constructor(props) {
        super(props);
        const {exportDataService} = this.props;

        this.types = [{
            id: `csv`,
            label: 'CSV',
        }, {
            id: `excel`,
            label: 'XLS',
        }, {
            id: `files`,
            label: 'Recordings',
            disabled: false
        }];

        this.handleStart = exportDataService.subscribe('webitel-export-data-finish', this.onFinish.bind(this));
        this.handleFinish = exportDataService.subscribe('webitel-export-data-start', this.onStart.bind(this));

        this.state = {
            radioIdSelected: `csv`,
            running: exportDataService.isWorking()
        };
    }

    componentWillUnmount() {
        this.handleFinish();
        this.handleStart();
    }

    onStart() {
        this.setState({
            running: true
        });
    }
    onFinish() {
        this.setState({
            running: false
        });
    }

    onChange = optionId => {
        this.setState({
            radioIdSelected: optionId,
        });
    };

    onClickStart = () => {
        const {sharingData, exportDataService, computedFields} = this.props;

        exportDataService.start(sharingData, this.state.radioIdSelected, computedFields)
    };

    render() {
        return (
            <EuiForm className="sharePanelContent">
                <EuiFormRow
                    label="Export data to:"
                >
                    <EuiRadioGroup
                        disabled={this.state.running}
                        options={this.types}
                        idSelected={this.state.radioIdSelected}
                        onChange={this.onChange}
                    />
                </EuiFormRow>
                <EuiFormRow>
                    <EuiButton
                        fill
                        onClick={this.onClickStart}
                        isLoading={this.state.running}
                        size="s"
                        disabled={this.state.running}
                    >
                        Start
                    </EuiButton>
                </EuiFormRow>
            </EuiForm>
        )
    }
}