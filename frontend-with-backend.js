// Updated Resume Builder with Backend Integration
class ResumeBuilderWithBackend {
    constructor() {
        this.resumeData = null;
        this.defaultResume = null;
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.currentResumeId = null;
        this.init();
    }

    async init() {
        try {
            // Check if user is logged in
            if (this.authToken) {
                await this.getCurrentUser();
            }
            
            await this.loadDefaultResume();
            this.setupEventListeners();
            this.renderAuthUI();
            
            if (this.currentUser) {
                await this.loadUserResumes();
            } else {
                // Load default resume for non-logged users
                this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
            }
            
            this.renderEditor();
            this.updatePreview();
            console.log('Resume builder initialized successfully');
        } catch (error) {
            console.error('Error initializing resume builder:', error);
            this.handleError(error);
        }
    }

    // Authentication Methods
    async register(name, email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            this.handleError(error);
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            this.handleError(error);
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        this.currentResumeId = null;
        localStorage.removeItem('authToken');
        this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
        this.renderAuthUI();
        this.renderEditor();
        this.updatePreview();
        this.showMessage('Logged out successfully', 'info');
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.data.user;
            } else {
                // Token might be expired
                this.logout();
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            this.logout();
        }
    }

    // Resume Management Methods
    async loadUserResumes() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resume`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.userResumes = data.data.resumes;
                this.renderResumeList();
                
                // Load the first resume or create a new one
                if (this.userResumes.length > 0) {
                    await this.loadResume(this.userResumes[0]._id);
                } else {
                    await this.createNewResume();
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async loadResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.resumeData = data.data.resume;
                this.currentResumeId = resumeId;
                this.renderEditor();
                this.updatePreview();
            }
        } catch (error) {
            this.handleError(error);
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
                this.showMessage('Resume saved successfully!', 'success');
                await this.loadUserResumes(); // Refresh the list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.handleError(error);
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

    async deleteResume(resumeId) {
        if (!confirm('Are you sure you want to delete this resume?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.showMessage('Resume deleted successfully', 'success');
                await this.loadUserResumes();
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async duplicateResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.showMessage('Resume duplicated successfully', 'success');
                await this.loadUserResumes();
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async shareResume(resumeId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                const shareUrl = data.data.shareUrl;
                navigator.clipboard.writeText(shareUrl);
                this.showMessage('Share link copied to clipboard!', 'success');
                
                // Show share dialog
                this.showShareDialog(shareUrl);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    // UI Rendering Methods
    renderAuthUI() {
        const authContainer = document.getElementById('authContainer') || this.createAuthContainer();
        
        if (this.currentUser) {
            authContainer.innerHTML = `
                <div class="user-info">
                    <span>Welcome, ${this.currentUser.name}!</span>
                    <button onclick="resumeBuilder.logout()" class="btn btn-secondary">Logout</button>
                </div>
            `;
        } else {
            authContainer.innerHTML = `
                <div class="auth-forms">
                    <div class="auth-toggle">
                        <button id="showLogin" class="btn btn-primary">Login</button>
                        <button id="showRegister" class="btn btn-secondary">Register</button>
                    </div>
                    <div id="loginForm" class="auth-form">
                        <h3>Login</h3>
                        <input type="email" id="loginEmail" placeholder="Email" required>
                        <input type="password" id="loginPassword" placeholder="Password" required>
                        <button onclick="resumeBuilder.handleLogin()" class="btn btn-primary">Login</button>
                    </div>
                    <div id="registerForm" class="auth-form" style="display: none;">
                        <h3>Register</h3>
                        <input type="text" id="registerName" placeholder="Full Name" required>
                        <input type="email" id="registerEmail" placeholder="Email" required>
                        <input type="password" id="registerPassword" placeholder="Password (min 6 chars)" required>
                        <button onclick="resumeBuilder.handleRegister()" class="btn btn-primary">Register</button>
                    </div>
                </div>
            `;
            
            // Add event listeners for auth toggle
            document.getElementById('showLogin').addEventListener('click', () => {
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
            });
            
            document.getElementById('showRegister').addEventListener('click', () => {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'block';
            });
        }
    }

    createAuthContainer() {
        const container = document.createElement('div');
        container.id = 'authContainer';
        container.className = 'auth-container';
        document.querySelector('.container').insertBefore(container, document.querySelector('.app-header'));
        return container;
    }

    renderResumeList() {
        if (!this.currentUser || !this.userResumes) return;
        
        let resumeListContainer = document.getElementById('resumeListContainer');
        if (!resumeListContainer) {
            resumeListContainer = document.createElement('div');
            resumeListContainer.id = 'resumeListContainer';
            resumeListContainer.className = 'resume-list-container';
            document.querySelector('.main-content').insertBefore(resumeListContainer, document.querySelector('.editor-panel'));
        }
        
        resumeListContainer.innerHTML = `
            <div class="resume-list">
                <div class="list-header">
                    <h3>My Resumes</h3>
                    <button onclick="resumeBuilder.createNewResume()" class="btn btn-primary">+ New Resume</button>
                </div>
                <div class="resume-items">
                    ${this.userResumes.map(resume => `
                        <div class="resume-item ${resume._id === this.currentResumeId ? 'active' : ''}">
                            <div class="resume-info">
                                <h4>${resume.title || 'Untitled Resume'}</h4>
                                <p>Updated: ${new Date(resume.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <div class="resume-actions">
                                <button onclick="resumeBuilder.loadResume('${resume._id}')" class="btn btn-sm">Open</button>
                                <button onclick="resumeBuilder.duplicateResume('${resume._id}')" class="btn btn-sm">Copy</button>
                                <button onclick="resumeBuilder.shareResume('${resume._id}')" class="btn btn-sm">Share</button>
                                <button onclick="resumeBuilder.deleteResume('${resume._id}')" class="btn btn-sm btn-danger">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Event Handlers
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'warning');
            return;
        }
        
        await this.login(email, password);
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
    }

    // Auto-save functionality
    setupAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            if (this.currentUser) {
                this.saveResumeToBackend();
            }
        }, 2000); // Auto-save after 2 seconds of inactivity
    }

    // Override the original setupEventListeners to include auto-save
    setupEventListeners() {
        // ... (keep all the original event listeners)
        // Add auto-save to each input event
        const originalSetup = super.setupEventListeners || (() => {});
        originalSetup.call(this);
        
        // Add auto-save to all input events
        document.addEventListener('input', () => {
            this.setupAutoSave();
        });
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        // Create or update message container
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.className = 'message-container';
            document.body.appendChild(messageContainer);
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        messageContainer.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    showShareDialog(shareUrl) {
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Share Your Resume</h3>
                <p>Anyone with this link can view your resume:</p>
                <input type="text" value="${shareUrl}" readonly>
                <div class="dialog-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Close</button>
                    <button onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='Copied!'" class="btn btn-primary">Copy Link</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    handleError(error) {
        console.error('Error:', error);
        this.showMessage(error.message || 'An error occurred', 'error');
    }

    // Keep all the original methods from the previous ResumeBuilder class
    // ... (all the original methods like loadDefaultResume, renderEditor, updatePreview, etc.)
}

// Initialize the resume builder with backend integration
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilderWithBackend();
});