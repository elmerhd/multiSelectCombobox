import { LightningElement, api, track } from 'lwc';

export default class MultiSelectCombobox extends LightningElement {

    @api label = 'Multi Select Combobox';
    @api options = [];
    @api value = [];
    @api placeholder = 'Select options...';
    @api variant;
    @api required = false;
    @api maxDisplayedValues = 0;
    @api dropdownHeight = 'min(32rem, 70vh)';

    @track searchKey = '';
    @track isOpen = false;

    _options = [];
    _value = [];
    _showError = false;
    _hasMaxDisplayedValues = false;

    connectedCallback() {
        this._hasMaxDisplayedValues = this.maxDisplayedValues > 0;
        this.documentClickHandler = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickHandler);
        this._options = (this.options || []).map(o => ({ ...o, checked: false }));
        this._value = this.value || [];
        this.syncSelectedValues();
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.documentClickHandler);
    }

    get isLabelHidden() {
        return this.variant === 'label-hidden';
    }

    syncSelectedValues() {
        if (!this._options.length) return;
        this._options = this._options.map(opt => ({
            ...opt,
            checked: this._value.includes(opt.value)
        }));
    }

    @api
    reportValidity() {
        const valid = this.checkValidity();
        this._showError = this.required && !valid;
        return valid;
    }

    @api
    setCustomValidity(message) {
        this._customMessage = message;
    }

    @api
    checkValidity() {
        if (!this.required) {
            return true;
        }

        return this.selectedOptions.length > 0;
    }

    _hasError = false;
    _customMessage = '';

    get message() {

        if (!this._showError) return null;

        if (this._customMessage) return this._customMessage;

        if (this.required && this.selectedOptions.length === 0) {
            return 'Please select at least one option.';
        }

        return null;
    }

    @api
    clearValidity() {
        this._showError = false;
        this._customMessage = '';
    }

    handleDocumentClick(event) {
        if (!event.composedPath().includes(this.template.host)) {
            this.isOpen = false;
        }
    }

    openDropdown(event) {
        event.stopPropagation();
        this.isOpen = true;
    }

    get dropdownStyle() {
        return `height: ${this.dropdownHeight} !important;`;
    }

    preventClose(event) {
        event.stopPropagation();
    }

    handleSearch(event) {
        this.searchKey = event.target.value;
    }

    get filteredOptions() {
        const key = (this.searchKey || '').trim().toLowerCase();
        if (!key) return this._options;
        return this._options.filter(opt =>
            opt.label.toLowerCase().includes(key)
        );
    }

    get selectedOptions() {
        return this._options.filter(opt => opt.checked);
    }

    get visibleSelectedOptions() {
        if (this._hasMaxDisplayedValues) {
            return this.selectedOptions.slice(0, this.maxDisplayedValues);
        }
        return this.selectedOptions;
    }

    get hasMoreSelected() {
        return this._hasMaxDisplayedValues && this.selectedOptions.length > this.maxDisplayedValues;
    }

    get remainingCountText() {
        return `+${this.selectedOptions.length - this.maxDisplayedValues} more`;
    } 

    get selectedCount() {
        return this.selectedOptions.length;
    }

    toggleOption(event) {
        const value = event.target.dataset.id;
        const checked = event.target.checked;
        this._options = this._options.map(opt =>
            opt.value === value ? { ...opt, checked } : opt
        );
        this.dispatchSelectionChange();
    }

    removeOption(event) {
        const value = event.target.name;
        this._options = this._options.map(opt =>
            opt.value === value ? { ...opt, checked: false } : opt
        );
        this.dispatchSelectionChange();
    }

    selectAll(event) {
        event.stopPropagation();

        this._options = this._options.map(opt => ({
            ...opt,
            checked: true
        }));
        this.dispatchSelectionChange();
    }

    clearAll(event) {
        event.stopPropagation();
        this._options = this._options.map(opt => ({
            ...opt,
            checked: false
        }));
        this.dispatchSelectionChange();
    }

    close(event) {
        event.stopPropagation();
        this.isOpen = false;
    }

    handleClearSelection(event) {
        event.stopPropagation();

        this._options = this._options.map(opt => ({
            ...opt,
            checked: false
        }));
        this.dispatchSelectionChange();
    }

    dispatchSelectionChange() {
        const values = this.selectedOptions.map(o => o.value);
        this._value = values;

        this.dispatchEvent(
            new CustomEvent('change', {
                detail: values
            })
        );
    }
}