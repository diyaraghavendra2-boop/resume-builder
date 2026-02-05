// Dynamic API Configuration
const API_BASE = window.RESUME_BUILDER_CONFIG?.API_BASE || 'http://localhost:5001/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Add authentication UI to the header
function addAuthUI() {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    
    // Remove existing auth UI
    const existingAuth = document.getElementById('authUI');
    if (existingAuth) existingAuth.remove();
    
    const authDiv = document.createElement('div');
    authDiv.id = 'authUI';
    authDiv.style.marginLeft = 'auto';
    authDiv.style.display = 'flex';
    authDiv.style.gap = '10px';
    authDiv.style.alignItems = 'center';
    
    if (currentUser) {
        authDiv.innerHTML = `
            <span style="color: white;">Welcome, ${currentUser.name}!</span>
            <button onclick="logout()" class="btn btn-secondary">Logout</button>
        `;
    } else {
        authDiv.innerHTML = `
            <button onclick="showAuthModal('login')" class="btn btn-secondary">Login</button>
            <button onclick="showAuthModal('register')" class="btn btn-secondary">Register</button>
        `;
    }
    
    headerActions.appendChild(authDiv);
}

// Show authentication modal
function showAuthModal(type) {
    // Remove existing modal
    const existingModal = document.getElementById('authModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
        z-index: 1000;
    `;
    
    const isLogin = type === 'login';
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;">
            <h3 style="margin-bottom: 20px;">${isLogin ? 'Login' : 'Register'}</h3>
            ${!isLogin ? '<input type="text" id="authName" placeholder="Full Name" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px;" required>' : ''}
            <input type="email" id="authEmail" placeholder="Email" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px;" required>
            <input type="password" id="authPassword" placeholder="Password" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 5px;" required>
            <div style="margin-top: 20px;">
                <button onclick="handleAuth('${type}')" class="btn btn-primary">${isLogin ? 'Login' : 'Register'}</button>
                <button onclick="closeAuthModal()" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.remove();
}

// Handle authentication
async function handleAuth(type) {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName')?.value;
    
    if (!email || !password || (type === 'register' && !name)) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
        const body = type === 'login' 
            ? { email, password }
            : { name, email, password };
            
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            showMessage(`${type === 'login' ? 'Login' : 'Registration'} successful!`, 'success');
            addAuthUI();
            closeAuthModal();
            
            // Load user resumes if logged in
            if (type === 'login') {
                await loadUserResumes();
            }
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage(`${type} failed: ${error.message}`, 'error');
    }
}

// Logout function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    addAuthUI();
    showMessage('Logged out successfully', 'info');
}

// Check if user is already logged in
async function checkExistingAuth() {
    if (authToken) {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const data = await response.json();
            if (data.success) {
                currentUser = data.data.user;
                addAuthUI();
                await loadUserResumes();
            } else {
                logout();
            }
        } catch (error) {
            logout();
        }
    }
}

// Load user resumes
async function loadUserResumes() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/resume`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        if (data.success) {
            console.log(`Loaded ${data.data.resumes.length} resumes from database`);
            showMessage(`Loaded ${data.data.resumes.length} resumes from cloud`, 'success');
        }
    } catch (error) {
        console.error('Failed to load resumes:', error);
    }
}

// Enhanced save function that saves to backend
async function saveToBackend() {
    if (!currentUser) {
        showMessage('Please login to save to cloud', 'warning');
        return;
    }
    
    try {
        // Get current resume data from the form
        const resumeData = {
            title: 'My Resume',
            header: {
                name: document.getElementById('name')?.value || '',
                role: document.getElementById('role')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                location: document.getElementById('location')?.value || '',
                linkedin: document.getElementById('linkedin')?.value || '',
                website: document.getElementById('website')?.value || '',
                profilePicture: ''
            },
            professionalSummary: document.getElementById('professionalSummary')?.value || '',
            skills: (document.getElementById('skills')?.value || '').split(',').map(s => s.trim()).filter(s => s),
            experience: [],
            certifications: [],
            education: [],
            hobbies: (document.getElementById('hobbies')?.value || '').split(',').map(s => s.trim()).filter(s => s)
        };
        
        const response = await fetch(`${API_BASE}/resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(resumeData)
        });
        
        const data = await response.json();
        if (data.success) {
            showMessage('Resume saved to cloud!', 'success');
        } else {
            showMessage('Failed to save to cloud: ' + data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to save to cloud: ' + error.message, 'error');
    }
}

// Show message function
function showMessage(message, type = 'info') {
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
    
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// Override the existing save function to also save to backend
const originalSaveBtn = document.getElementById('saveBtn');
if (originalSaveBtn) {
    originalSaveBtn.addEventListener('click', async () => {
        // Call original save functionality first
        if (window.resumeBuilder && window.resumeBuilder.saveResume) {
            window.resumeBuilder.saveResume();
        }
        
        // Then save to backend if logged in
        await saveToBackend();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add auth UI after a short delay to ensure other scripts have loaded
    setTimeout(() => {
        addAuthUI();
        checkExistingAuth();
    }, 500);
});