// Enhanced Resume Manager with Full CRUD Operations
class ResumeManager {
    constructor() {
        this.apiBaseUrl = window.RESUME_BUILDER_CONFIG?.API_BASE || 'http://localhost:5001/api';
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = null;
        this.userResumes = [];
        this.currentResumeId = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.renderResumeManager();
    }

    async checkAuth() {
        if (this.authToken) {
            try {
                const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${this.authToken}` }
                });
                const data = await response.json();
                if (data.success) {
                    this.currentUser = data.data.user;
                    await this.loadAllResumes();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }
    }

    async loadAllResumes() {
        if (!this.currentUser) return;

        try {
            this.showLoading('Loading resumes from database...');
            const response = await fetch(`${this.apiBaseUrl}/resume`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            if (data.success) {
                this.userResumes = data.data.resumes;
                this.showMessage(`✅ Loaded ${this.userResumes.length} resumes from MongoDB`, 'success');
                this.renderResumeList();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to load resumes: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async createNewResume(title = 'New Resume') {
        if (!this.currentUser) {
            this.showMessage('Please login first', 'warning');
            return;
        }

        try {
            this.showLoading('Creating new resume...');
            const newResumeData = {
                title: title,
                header: {
                    name: "Your Name",
                    role: "Your Role",
                    email: "your@email.com",
                    phone: "(555) 123-4567",
                    location: "City, State",
                    linkedin: "",
                    website: "",
                    profilePicture: ""
                },
                professionalSummary: "Write your professional summary here...",
                skills: ["JavaScript", "React", "Node.js"],
                experience: [{
                    title: "Job Title",
                    company: "Company Name",
                    location: "City, State",
                    startDate: "2023",
                    endDate: "Present",
                    description: "Describe your role and achievements..."
                }],
                certifications: [],
                education: [{
                    degree: "Your Degree",
                    school: "University Name",
                    location: "City, State",
                    year: "2023"
                }],
                hobbies: ["Reading", "Coding", "Travel"]
            };

            const response = await fetch(`${this.apiBaseUrl}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(newResumeData)
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('✅ New resume created successfully!', 'success');
                await this.loadAllResumes(); // Refresh the list
                return data.data.resume._id;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to create resume: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadResume(resumeId) {
        try {
            this.showLoading('Loading resume...');
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            if (data.success) {
                this.currentResumeId = resumeId;
                this.showMessage('✅ Resume loaded successfully!', 'success');
                return data.data.resume;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to load resume: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async updateResume(resumeId, resumeData) {
        try {
            this.showLoading('Saving to MongoDB...');
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(resumeData)
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('✅ Resume saved to MongoDB!', 'success');
                await this.loadAllResumes(); // Refresh the list
                return data.data.resume;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to save resume: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteResume(resumeId) {
        if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading('Deleting resume...');
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('✅ Resume deleted successfully!', 'success');
                await this.loadAllResumes(); // Refresh the list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to delete resume: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async duplicateResume(resumeId) {
        try {
            this.showLoading('Duplicating resume...');
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}/duplicate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('✅ Resume duplicated successfully!', 'success');
                await this.loadAllResumes(); // Refresh the list
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to duplicate resume: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async shareResume(resumeId) {
        try {
            this.showLoading('Generating share link...');
            const response = await fetch(`${this.apiBaseUrl}/resume/${resumeId}/share`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            const data = await response.json();
            if (data.success) {
                const shareUrl = data.data.shareUrl;
                await navigator.clipboard.writeText(shareUrl);
                this.showMessage('✅ Share link copied to clipboard!', 'success');
                this.showShareDialog(shareUrl);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showMessage(`❌ Failed to generate share link: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderResumeManager() {
        const container = document.getElementById('resumeManagerContainer') || this.createResumeManagerContainer();
        
        if (!this.currentUser) {
            container.innerHTML = `
                <div class="auth-required">
                    <h3>Please login to manage your resumes</h3>
                    <p>Login to create, save, and manage multiple resumes in the cloud.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="resume-manager">
                <div class="manager-header">
                    <h2>📋 My Resumes (${this.userResumes.length})</h2>
                    <div class="manager-actions">
                        <button onclick="resumeManager.createNewResume()" class="btn btn-primary">
                            ➕ Create New Resume
                        </button>
                        <button onclick="resumeManager.loadAllResumes()" class="btn btn-secondary">
                            🔄 Refresh from Database
                        </button>
                        <button onclick="resumeManager.exportAllResumes()" class="btn btn-accent">
                            📤 Export All
                        </button>
                    </div>
                </div>
                <div id="resumeListContainer" class="resume-list-container">
                    ${this.renderResumeList()}
                </div>
                <div id="loadingIndicator" class="loading-indicator" style="display: none;">
                    <div class="spinner"></div>
                    <span id="loadingText">Loading...</span>
                </div>
            </div>
        `;
    }

    renderResumeList() {
        if (this.userResumes.length === 0) {
            return `
                <div class="empty-state">
                    <h3>No resumes found</h3>
                    <p>Create your first resume to get started!</p>
                    <button onclick="resumeManager.createNewResume()" class="btn btn-primary">
                        Create First Resume
                    </button>
                </div>
            `;
        }

        return `
            <div class="resume-grid">
                ${this.userResumes.map(resume => `
                    <div class="resume-card ${resume._id === this.currentResumeId ? 'active' : ''}">
                        <div class="resume-card-header">
                            <h4>${resume.title || 'Untitled Resume'}</h4>
                            <div class="resume-meta">
                                <span class="resume-date">
                                    📅 ${new Date(resume.updatedAt).toLocaleDateString()}
                                </span>
                                <span class="resume-status">
                                    ${resume.isPublic ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </div>
                        </div>
                        
                        <div class="resume-preview">
                            <div class="preview-header">
                                <strong>${resume.header?.name || 'No Name'}</strong>
                                <span>${resume.header?.role || 'No Role'}</span>
                            </div>
                            <div class="preview-summary">
                                ${(resume.professionalSummary || 'No summary').substring(0, 100)}...
                            </div>
                            <div class="preview-skills">
                                ${(resume.skills || []).slice(0, 3).map(skill => 
                                    `<span class="skill-tag">${skill}</span>`
                                ).join('')}
                                ${resume.skills?.length > 3 ? `<span class="more-skills">+${resume.skills.length - 3} more</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="resume-actions">
                            <button onclick="resumeManager.loadResumeInEditor('${resume._id}')" 
                                    class="btn btn-sm btn-primary">
                                ✏️ Edit
                            </button>
                            <button onclick="resumeManager.duplicateResume('${resume._id}')" 
                                    class="btn btn-sm btn-secondary">
                                📋 Copy
                            </button>
                            <button onclick="resumeManager.shareResume('${resume._id}')" 
                                    class="btn btn-sm btn-accent">
                                🔗 Share
                            </button>
                            <button onclick="resumeManager.deleteResume('${resume._id}')" 
                                    class="btn btn-sm btn-danger">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createResumeManagerContainer() {
        const container = document.createElement('div');
        container.id = 'resumeManagerContainer';
        container.className = 'resume-manager-container';
        
        // Insert before the main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.parentNode.insertBefore(container, mainContent);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }

    async loadResumeInEditor(resumeId) {
        const resumeData = await this.loadResume(resumeId);
        if (resumeData && window.resumeBuilder) {
            // Load the resume data into the main editor
            window.resumeBuilder.resumeData = resumeData;
            window.resumeBuilder.renderEditor();
            window.resumeBuilder.updatePreview();
            
            // Scroll to editor
            document.querySelector('.editor-panel')?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async exportAllResumes() {
        try {
            this.showLoading('Exporting all resumes...');
            const exportData = {
                user: this.currentUser,
                resumes: this.userResumes,
                exportDate: new Date().toISOString(),
                totalResumes: this.userResumes.length
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `all-resumes-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            this.showMessage('✅ All resumes exported successfully!', 'success');
        } catch (error) {
            this.showMessage(`❌ Export failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    showShareDialog(shareUrl) {
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog-overlay';
        dialog.innerHTML = `
            <div class="share-dialog">
                <div class="dialog-header">
                    <h3>🔗 Share Your Resume</h3>
                    <button onclick="this.closest('.share-dialog-overlay').remove()" class="close-btn">×</button>
                </div>
                <div class="dialog-content">
                    <p>Anyone with this link can view your resume:</p>
                    <div class="share-url-container">
                        <input type="text" value="${shareUrl}" readonly class="share-url-input">
                        <button onclick="navigator.clipboard.writeText('${shareUrl}'); this.textContent='Copied!'" 
                                class="btn btn-primary">Copy</button>
                    </div>
                    <div class="share-options">
                        <a href="mailto:?subject=My Resume&body=Please find my resume at: ${shareUrl}" 
                           class="btn btn-secondary">📧 Email</a>
                        <a href="https://twitter.com/intent/tweet?text=Check out my resume: ${shareUrl}" 
                           target="_blank" class="btn btn-secondary">🐦 Twitter</a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" 
                           target="_blank" class="btn btn-secondary">💼 LinkedIn</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    showLoading(text = 'Loading...') {
        const indicator = document.getElementById('loadingIndicator');
        const loadingText = document.getElementById('loadingText');
        if (indicator && loadingText) {
            loadingText.textContent = text;
            indicator.style.display = 'flex';
        }
    }

    hideLoading() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast message-${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize Resume Manager
let resumeManager;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        resumeManager = new ResumeManager();
    }, 1000);
});