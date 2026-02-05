// Enhanced Resume Builder with Backend Integration
class ResumeBuilderWithBackend extends ResumeBuilder {
    constructor() {
        super();
        this.apiBaseUrl = 'http://localhost:5001/api';
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = null;
        this.userResumes = [];
        this.currentResumeId = null;
        
        // Initialize authentication
        this.initAuth();
    }

    async initAuth() {
        if (this.authToken) {
            await this.getCurrentUser();
        }
        this.renderAuthUI();
    }

    // Authentication Methods
    async register(name, email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.authToken = data.data.token;
                this.currentUser = data.data.user;
                localStorage.setItem('authToken', this.authToken);
                this.showMessage('Registration successful!', 'success');
                this.renderAuthUI();
                await this.loadUserResumes();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.authToken = data.data.token;
                this.currentUser = data.data.user;
                localStorage.setItem('authToken', this.authToken);
                this.showMessage('Login successful!', 'success');
                this.renderAuthUI();
                await this.loadUserResumes();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        this.currentResumeId = null;
        localStorage.removeItem('authToken');
        this.renderAuthUI();
        this.showMessage('Logged out successfully', 'info');
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.data.user;
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    // Resume Management
    async loadUserResumes() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/resume`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            
            if (data.success) {
                this.userResumes = data.data.resumes;
                
                if (this.userResumes.length > 0) {
                    await this.loadResume(this.userResumes[0]._id);
                } else {
                    await this.createNewResume();
                }
            }
        } catch (error) {
            this.showMessage('Failed to load resumes', 'error');
        }
    }

    async loadResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            
            if (data.success) {
                this.resumeData = data.data.resume;
                this.currentResumeId = resumeId;
                this.renderEditor();
                this.updatePreview();
            }
        } catch (error) {
            this.showMessage('Failed to load resume', 'error');
        }
    }

    async saveResumeToBackend() {
        if (!this.currentUser) {
            this.showMessage('Please login to save your resume', 'warning');
            return;
        }

        try {
            const url = this.currentResumeId 
                ? `${this.apiBaseUrl}/resume/${this.currentResumeId}`
                : `${this.apiBaseUrl}/resume`;
            
            const method = this.currentResumeId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(this.resumeData)
            });

            const data = await response.json();
            
            if (data.success) {
                if (!this.currentResumeId) {
                    this.currentResumeId = data.data.resume._id;
                }
                this.showMessage('Resume saved to cloud!', 'success');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage('Failed to save to cloud: ' + error.message, 'error');
        }
    }

    async createNewResume() {
        this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
        this.currentResumeId = null;
        this.renderEditor();
        this.updatePreview();
        
        if (this.currentUser) {
            await this.saveResumeToBackend();
        }
    }

    // Override the original saveResume method
    async saveResume() {
        // Save locally first (original functionality)
        super.saveResume();
        
        // Also save to backend if logged in
        if (this.currentUser) {
            await this.saveResumeToBackend();
        }
    }

    // UI Methods
    renderAuthUI() {
        // Add auth section to header
        const headerActions = document.querySelector('.header-actions');
        
        // Remove existing auth UI
        const existingAuth = document.getElementById('authUI');
        if (existingAuth) existingAuth.remove();
        
        const authDiv = document.createElement('div');
        authDiv.id = 'authUI';
        authDiv.style.marginLeft = 'auto';
        
        if (this.currentUser) {
            authDiv.innerHTML = `
                <span style="color: white; margin-right: 10px;">Welcome, ${this.currentUser.name}!</span>
                <button onclick="resumeBuilder.logout()" class="btn btn-secondary">Logout</button>
            `;
        } else {
            authDiv.innerHTML = `
                <button onclick="resumeBuilder.showLoginModal()" class="btn btn-secondary">Login</button>
                <button onclick="resumeBuilder.showRegisterModal()" class="btn btn-secondary">Register</button>
            `;
        }
        
        headerActions.appendChild(authDiv);
    }

    showLoginModal() {
        const modal = this.createModal('Login', `
            <div class="form-group">
                <input type="email" id="loginEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="password" id="loginPassword" placeholder="Password" required>
            </div>
            <button onclick="resumeBuilder.handleLogin()" class="btn btn-primary">Login</button>
        `);
        document.body.appendChild(modal);
    }

    showRegisterModal() {
        const modal = this.createModal('Register', `
            <div class="form-group">
                <input type="text" id="registerName" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <input type="email" id="registerEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="password" id="registerPassword" placeholder="Password (min 6 chars)" required>
            </div>
            <button onclick="resumeBuilder.handleRegister()" class="btn btn-primary">Register</button>
        `);
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
                <h3 style="margin-bottom: 20px;">${title}</h3>
                ${content}
                <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="margin-top: 15px;">Cancel</button>
            </div>
        `;
        
        return modal;
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'warning');
            return;
        }
        
        await this.login(email, password);
        document.querySelector('.modal').remove();
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            this.showMessage('Please fill in all fields', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'warning');
            return;
        }
        
        await this.register(name, email, password);
        document.querySelector('.modal').remove();
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            border-radius: 5px; color: white; font-weight: bold; z-index: 1001;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
            ${type === 'warning' ? 'background: #f59e0b;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 4000);
    }
}

// Replace the original ResumeBuilder with the enhanced version
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilderWithBackend();
});