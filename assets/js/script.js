class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.inputs = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            queryType: document.getElementsByName('queryType'),
            message: document.getElementById('message'),
            consent: document.getElementById('consent')
        };
        this.submitBtn = document.getElementById('submitBtn');
        this.successToast = document.getElementById('successToast');

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAccessibility();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.inputs.firstName.addEventListener('blur', () => this.validateField('firstName'));
        this.inputs.lastName.addEventListener('blur', () => this.validateField('lastName'));
        this.inputs.email.addEventListener('blur', () => this.validateField('email'));
        this.inputs.message.addEventListener('blur', () => this.validateField('message'));
        this.inputs.consent.addEventListener('change', () => this.validateField('consent'));

        this.inputs.queryType.forEach(radio => {
            radio.addEventListener('change', () => {
                this.handleQueryTypeSelection();
                this.validateField('queryType');
            });
        });

        [this.inputs.firstName, this.inputs.lastName, this.inputs.email, this.inputs.message].forEach(input => {
            input.addEventListener('focus', () => this.clearError(input));
            input.addEventListener('input', () => this.clearError(input));
        });

        this.inputs.queryType.forEach((radio, index) => {
            radio.addEventListener('keydown', (e) => this.handleRadioKeydown(e, index));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.successToast.classList.contains('show')) {
                this.hideSuccessToast();
            }
        });
    }

    setupAccessibility() {
        this.inputs.firstName.setAttribute('aria-describedby', 'firstName-error');
        this.inputs.lastName.setAttribute('aria-describedby', 'lastName-error');
        this.inputs.email.setAttribute('aria-describedby', 'email-error');
        this.inputs.message.setAttribute('aria-describedby', 'message-error');
        this.inputs.consent.setAttribute('aria-describedby', 'consent-error');

        const queryFieldset = document.querySelector('.query-fieldset');
        queryFieldset.setAttribute('aria-describedby', 'queryType-error');
    }

    handleSubmit(e) {
        e.preventDefault();

        this.clearAllErrors();

        const validations = [
            this.validateField('firstName'),
            this.validateField('lastName'),
            this.validateField('email'),
            this.validateField('queryType'),
            this.validateField('message'),
            this.validateField('consent')
        ];

        const isValid = validations.every(validation => validation);

        if (isValid) {
            this.submitForm();
        } else {
            this.focusFirstError();

            this.announceErrors();
        }
    }

    validateField(fieldName) {
        switch (fieldName) {
            case 'firstName':
                return this.validateRequired(this.inputs.firstName, 'This field is required');
            case 'lastName':
                return this.validateRequired(this.inputs.lastName, 'This field is required');
            case 'email':
                return this.validateEmail();
            case 'queryType':
                return this.validateQueryType();
            case 'message':
                return this.validateRequired(this.inputs.message, 'This field is required');
            case 'consent':
                return this.validateConsent();
            default:
                return true;
        }
    }

    validateRequired(input, message) {
        const value = input.value.trim();
        if (!value) {
            this.showError(input, message);
            return false;
        }
        return true;
    }

    validateEmail() {
        const email = this.inputs.email.value.trim();

        if (!email) {
            this.showError(this.inputs.email, 'This field is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError(this.inputs.email, 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    validateQueryType() {
        const selected = Array.from(this.inputs.queryType).some(radio => radio.checked);
        if (!selected) {
            this.showError(document.querySelector('.query-fieldset'), 'Please select a query type');
            return false;
        }
        return true;
    }

    validateConsent() {
        if (!this.inputs.consent.checked) {
            this.showError(this.inputs.consent.closest('.checkbox-container'), 'To submit this form, please consent to being contacted');
            return false;
        }
        return true;
    }

    showError(element, message) {
        element.classList.add('error');

        let errorElement;
        if (element.classList.contains('query-fieldset')) {
            errorElement = document.getElementById('queryType-error');
        } else if (element.classList.contains('checkbox-container')) {
            errorElement = document.getElementById('consent-error');
        } else {
            errorElement = document.getElementById(element.id + '-error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            errorElement.setAttribute('aria-live', 'polite');
        }
    }

    clearError(element) {
        element.classList.remove('error');

        let errorElement;
        if (element.classList && element.classList.contains('query-fieldset')) {
            errorElement = document.getElementById('queryType-error');
        } else if (element.classList && element.classList.contains('checkbox-container')) {
            errorElement = document.getElementById('consent-error');
        } else {
            errorElement = document.getElementById(element.id + '-error');
        }

        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.removeAttribute('aria-live');
        }
    }

    clearAllErrors() {
        [this.inputs.firstName, this.inputs.lastName, this.inputs.email, this.inputs.message].forEach(input => {
            this.clearError(input);
        });

        this.clearError(document.querySelector('.query-fieldset'));

        this.clearError(document.querySelector('.checkbox-container'));
    }

    handleQueryTypeSelection() {
        const radioOptions = document.querySelectorAll('.radio-option');
        radioOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });

        this.clearError(document.querySelector('.query-fieldset'));
    }

    handleRadioKeydown(e, currentIndex) {
        const radios = Array.from(this.inputs.queryType);
        let newIndex;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                newIndex = (currentIndex + 1) % radios.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = (currentIndex - 1 + radios.length) % radios.length;
                break;
            default:
                return;
        }

        radios[newIndex].focus();
        radios[newIndex].checked = true;
        this.handleQueryTypeSelection();
    }

    focusFirstError() {
        const errorInputs = [
            this.inputs.firstName,
            this.inputs.lastName,
            this.inputs.email,
            ...this.inputs.queryType,
            this.inputs.message,
            this.inputs.consent
        ];

        for (let input of errorInputs) {
            if (input.classList.contains('error') ||
                (input.name === 'queryType' && document.querySelector('.query-fieldset').classList.contains('error')) ||
                (input.id === 'consent' && document.querySelector('.checkbox-container').classList.contains('error'))) {
                input.focus();
                break;
            }
        }
    }

    announceErrors() {
        const errorMessages = [];
        document.querySelectorAll('.error-message.show').forEach(error => {
            errorMessages.push(error.textContent);
        });

        if (errorMessages.length > 0) {
            const announcement = `Form has ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''}: ${errorMessages.join(', ')}`;
            this.announceToScreenReader(announcement);
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    submitForm() {
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Submitting...';

        setTimeout(() => {
            this.form.reset();
            this.clearAllErrors();

            document.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
            });

            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Submit';

            this.showSuccessToast();

            this.announceToScreenReader('Message sent successfully! Thanks for completing the form. We will be in touch soon!');

        }, 1500);
    }

    showSuccessToast() {
        this.successToast.classList.add('show');

        setTimeout(() => {
            this.hideSuccessToast();
        }, 5000);

        const firstFocusable = this.successToast.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    hideSuccessToast() {
        this.successToast.classList.remove('show');

        this.inputs.firstName.focus();
    }

    getFormData() {
        const selectedQueryType = Array.from(this.inputs.queryType).find(radio => radio.checked);

        return {
            firstName: this.inputs.firstName.value.trim(),
            lastName: this.inputs.lastName.value.trim(),
            email: this.inputs.email.value.trim(),
            queryType: selectedQueryType ? selectedQueryType.value : '',
            message: this.inputs.message.value.trim(),
            consent: this.inputs.consent.checked
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

document.addEventListener('DOMContentLoaded', () => {
    const radioOptions = document.querySelectorAll('.radio-option');

    radioOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            if (e.target.type !== 'radio') {
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });
    });

    const checkboxContainer = document.querySelector('.checkbox-container');
    checkboxContainer.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
            const checkbox = checkboxContainer.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
});
