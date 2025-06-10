// SWADE Character Creator v2 - UI Manager Module

export class UIManager {
    constructor() {
        this.notifications = [];
        this.modals = new Map();
        this.debounceTimers = new Map();
    }

    // Element creation utilities
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    createButton(text, className = '', onClick = null) {
        const button = this.createElement('button', className, text);
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    createInput(type, className = '', placeholder = '') {
        const input = this.createElement('input', className);
        input.type = type;
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    createSelect(options, className = '', onChange = null) {
        const select = this.createElement('select', className);
        options.forEach(option => {
            const optionElement = this.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        if (onChange) select.addEventListener('change', onChange);
        return select;
    }

    // Clear all child elements
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Debounce utility
    debounce(func, wait, id) {
        if (this.debounceTimers.has(id)) {
            clearTimeout(this.debounceTimers.get(id));
        }
        
        const timeout = setTimeout(() => {
            func();
            this.debounceTimers.delete(id);
        }, wait);
        
        this.debounceTimers.set(id, timeout);
    }

    // Loading states
    showLoading(element, message = 'Loading...') {
        this.clearElement(element);
        const loadingDiv = this.createElement('div', 'loading');
        loadingDiv.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        element.appendChild(loadingDiv);
    }

    hideLoading(element) {
        const loadingDiv = element.querySelector('.loading');
        if (loadingDiv) loadingDiv.remove();
    }

    // Error display
    showError(element, message) {
        const errorDiv = this.createElement('div', 'error-message', message);
        element.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Notifications
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification.id), duration);
        }

        return notification.id;
    }

    renderNotification(notification) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = this.createElement('div', 'notification-container');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }

        const notificationElement = this.createElement('div', `notification ${notification.type}`);
        notificationElement.dataset.notificationId = notification.id;
        notificationElement.innerHTML = `
            <span>${notification.message}</span>
            <button class="close-btn" onclick="uiManager.removeNotification(${notification.id})">&times;</button>
        `;

        container.appendChild(notificationElement);
    }

    removeNotification(id) {
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 300);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    // Modal management
    createModal(id, title, content, options = {}) {
        const modal = this.createElement('div', 'modal');
        modal.id = `modal-${id}`;
        
        const modalContent = this.createElement('div', 'modal-content');
        
        const header = this.createElement('div', 'modal-header');
        header.innerHTML = `
            <h2>${title}</h2>
            <button class="close-btn" onclick="uiManager.closeModal('${id}')">&times;</button>
        `;
        
        const body = this.createElement('div', 'modal-body');
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        
        if (options.footer) {
            const footer = this.createElement('div', 'modal-footer');
            footer.appendChild(options.footer);
            modalContent.appendChild(footer);
        }
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        this.modals.set(id, modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(id);
        });
        
        return modal;
    }

    openModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Create checkbox item
    createCheckboxItem(name, description, meta, isSelected = false, isAvailable = true, onChange = null) {
        const container = this.createElement('div', 'checkbox-item');
        
        const checkbox = this.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${name.toLowerCase().replace(/\s+/g, '-')}-checkbox`;
        checkbox.checked = isSelected;
        checkbox.disabled = !isAvailable;
        
        const label = this.createElement('label');
        label.htmlFor = checkbox.id;
        
        const nameSpan = this.createElement('span', 'item-name', name);
        label.appendChild(nameSpan);
        
        if (description) {
            const descSpan = this.createElement('span', 'item-description', description);
            label.appendChild(descSpan);
        }
        
        if (meta) {
            const metaSpan = this.createElement('span', 'item-meta', meta);
            label.appendChild(metaSpan);
        }
        
        container.appendChild(checkbox);
        container.appendChild(label);
        
        if (!isAvailable) {
            container.classList.add('unavailable');
        }
        
        if (onChange) {
            checkbox.addEventListener('change', onChange);
        }
        
        return container;
    }

    // Create attribute control - SIMPLIFIED VERSION
    createAttributeControl(attribute, value, onChange) {
        // Create container div using basic DOM methods
        const container = document.createElement('div');
        container.className = 'attribute-control';
        
        // Create label
        const label = document.createElement('label');
        label.className = 'attribute-label';
        label.textContent = attribute;
        
        // Create control group div
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        // Create decrease button
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'attribute-btn decrease';
        decreaseBtn.textContent = '-';
        decreaseBtn.onclick = () => onChange(attribute, -1);
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'attribute-value';
        valueDisplay.textContent = value;
        
        // Create increase button
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'attribute-btn increase';
        increaseBtn.textContent = '+';
        increaseBtn.onclick = () => onChange(attribute, 1);
        
        // Assemble the control group
        controlGroup.appendChild(decreaseBtn);
        controlGroup.appendChild(valueDisplay);
        controlGroup.appendChild(increaseBtn);
        
        // Assemble the container
        container.appendChild(label);
        container.appendChild(controlGroup);
        
        // Return the container (guaranteed to be a DOM element)
        return container;
    }

    // Create skill control
    createSkillControl(skill, value, onChange) {
        // Create container using basic DOM methods
        const container = document.createElement('div');
        container.className = 'skill-control';
        
        // Create label
        const label = document.createElement('label');
        label.className = 'skill-label';
        label.textContent = skill;
        
        // Create control group
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        // Create decrease button
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'skill-btn decrease';
        decreaseBtn.textContent = '-';
        decreaseBtn.onclick = () => onChange(skill, -1);
        
        // Create value display
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'skill-value';
        valueDisplay.textContent = value;
        
        // Create increase button
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'skill-btn increase';
        increaseBtn.textContent = '+';
        increaseBtn.onclick = () => onChange(skill, 1);
        
        // Assemble control group
        controlGroup.appendChild(decreaseBtn);
        controlGroup.appendChild(valueDisplay);
        controlGroup.appendChild(increaseBtn);
        
        // Assemble container
        container.appendChild(label);
        container.appendChild(controlGroup);
        
        return container;
    }

    // Create collapsible section
    createCollapsible(title, content, isOpen = false) {
        const container = this.createElement('div', 'collapsible');
        
        const header = this.createElement('div', 'collapsible-header');
        header.innerHTML = `
            <span>${title}</span>
            <span class="toggle-icon">${isOpen ? '▼' : '▶'}</span>
        `;
        
        const body = this.createElement('div', 'collapsible-body');
        if (!isOpen) body.style.display = 'none';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        header.addEventListener('click', () => {
            const isVisible = body.style.display !== 'none';
            body.style.display = isVisible ? 'none' : 'block';
            header.querySelector('.toggle-icon').textContent = isVisible ? '▶' : '▼';
        });
        
        container.appendChild(header);
        container.appendChild(body);
        
        return container;
    }

    // Tab system
    createTabs(tabs) {
        const container = this.createElement('div', 'tabs-container');
        const tabHeaders = this.createElement('div', 'tab-headers');
        const tabContents = this.createElement('div', 'tab-contents');
        
        tabs.forEach((tab, index) => {
            // Create header
            const header = this.createElement('button', 'tab-header', tab.label);
            if (index === 0) header.classList.add('active');
            header.addEventListener('click', () => this.switchTab(container, index));
            tabHeaders.appendChild(header);
            
            // Create content
            const content = this.createElement('div', 'tab-content');
            if (index === 0) content.classList.add('active');
            if (typeof tab.content === 'string') {
                content.innerHTML = tab.content;
            } else {
                content.appendChild(tab.content);
            }
            tabContents.appendChild(content);
        });
        
        container.appendChild(tabHeaders);
        container.appendChild(tabContents);
        
        return container;
    }

    switchTab(container, index) {
        container.querySelectorAll('.tab-header').forEach((header, i) => {
            header.classList.toggle('active', i === index);
        });
        container.querySelectorAll('.tab-content').forEach((content, i) => {
            content.classList.toggle('active', i === index);
        });
    }

    // Tooltip system
    addTooltip(element, text) {
        element.classList.add('has-tooltip');
        element.setAttribute('data-tooltip', text);
    }

    // Progress bar
    createProgressBar(value, max, label = '') {
        const container = this.createElement('div', 'progress-container');
        
        if (label) {
            const labelElement = this.createElement('div', 'progress-label', label);
            container.appendChild(labelElement);
        }
        
        const progressBar = this.createElement('div', 'progress-bar');
        const progressFill = this.createElement('div', 'progress-fill');
        progressFill.style.width = `${(value / max) * 100}%`;
        
        const progressText = this.createElement('span', 'progress-text', `${value} / ${max}`);
        
        progressBar.appendChild(progressFill);
        progressBar.appendChild(progressText);
        container.appendChild(progressBar);
        
        return container;
    }

    updateProgressBar(container, value, max) {
        const fill = container.querySelector('.progress-fill');
        const text = container.querySelector('.progress-text');
        if (fill) fill.style.width = `${(value / max) * 100}%`;
        if (text) text.textContent = `${value} / ${max}`;
    }

    // Create a simple div wrapper
    createWrapper(className = '') {
        return this.createElement('div', className);
    }

    // Create a form group
    createFormGroup(label, input) {
        const group = this.createElement('div', 'form-group');
        const labelElement = this.createElement('label', '', label);
        group.appendChild(labelElement);
        group.appendChild(input);
        return group;
    }
}
