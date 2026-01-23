class ResumeBuilder {
    constructor() {
        this.resumeData = null;
        this.defaultResume = null;
        this.init();
    }

    async init() {
        try {
            await this.loadDefaultResume();
            this.loadFromLocalStorage();
            this.setupEventListeners();
            this.renderEditor();
            this.updatePreview();
            console.log('Resume builder initialized successfully');
        } catch (error) {
            console.error('Error initializing resume builder:', error);
            // Fallback initialization
            this.defaultResume = this.getFallbackResume();
            this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
            this.setupEventListeners();
            this.renderEditor();
            this.updatePreview();
        }
    }

    async loadDefaultResume() {
        try {
            const response = await fetch('defaultResume.json');
            this.defaultResume = await response.json();
        } catch (error) {
            console.error('Error loading default resume:', error);
            this.defaultResume = this.getFallbackResume();
        }
    }

    getFallbackResume() {
        return {
            header: {
                name: "John Doe",
                role: "Software Developer",
                email: "john.doe@email.com",
                phone: "(555) 123-4567",
                location: "City, State",
                linkedin: "linkedin.com/in/johndoe",
                website: "johndoe.dev",
                profilePicture: ""
            },
            professionalSummary: "Experienced software developer with 5+ years of expertise in full-stack development.",
            skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "AWS", "Docker"],
            experience: [{
                title: "Senior Software Developer",
                company: "Tech Company Inc.",
                location: "City, State",
                startDate: "2021",
                endDate: "Present",
                description: "Lead development of web applications using React and Node.js."
            }],
            certifications: [{
                name: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                date: "2023"
            }],
            education: [{
                degree: "Bachelor of Science in Computer Science",
                school: "University Name",
                location: "City, State",
                year: "2019"
            }],
            hobbies: ["Reading", "Photography", "Hiking", "Coding"]
        };
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('resumeData');
        if (saved) {
            this.resumeData = JSON.parse(saved);
        } else {
            this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
            this.saveToLocalStorage(); // Save default data to localStorage on first load
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('resumeData', JSON.stringify(this.resumeData));
    }

    setupEventListeners() {
        try {
            // Header fields
            ['name', 'role', 'email', 'phone', 'location', 'linkedin', 'website'].forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.addEventListener('input', () => {
                        if (!this.resumeData.header) this.resumeData.header = {};
                        this.resumeData.header[field] = element.value;
                        this.saveToLocalStorage();
                        this.updatePreview();
                    });
                }
            });

            // Professional Summary
            const summaryElement = document.getElementById('professionalSummary');
            if (summaryElement) {
                summaryElement.addEventListener('input', () => {
                    this.resumeData.professionalSummary = summaryElement.value;
                    this.saveToLocalStorage();
                    this.updatePreview();
                });
            }

            // Skills
            const skillsElement = document.getElementById('skills');
            if (skillsElement) {
                skillsElement.addEventListener('input', () => {
                    this.resumeData.skills = skillsElement.value.split(',').map(s => s.trim()).filter(s => s);
                    this.saveToLocalStorage();
                    this.updatePreview();
                });
            }

            // Hobbies
            const hobbiesElement = document.getElementById('hobbies');
            if (hobbiesElement) {
                hobbiesElement.addEventListener('input', () => {
                    this.resumeData.hobbies = hobbiesElement.value.split(',').map(s => s.trim()).filter(s => s);
                    this.saveToLocalStorage();
                    this.updatePreview();
                });
            }

            // Profile Picture
            const profilePictureElement = document.getElementById('profilePicture');
            if (profilePictureElement) {
                profilePictureElement.addEventListener('change', (e) => this.handleProfilePicture(e));
            }

            // Action buttons
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveResume());
            
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.addEventListener('click', () => this.resetToDefault());
            
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportResume());
            
            const importFile = document.getElementById('importFile');
            if (importFile) importFile.addEventListener('change', (e) => this.importResume(e));
            
            const downloadPdfBtn = document.getElementById('downloadPdfBtn');
            if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', () => this.downloadPDF());
            
            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    renderEditor() {
        try {
            // Ensure resumeData structure exists
            if (!this.resumeData.header) this.resumeData.header = {};
            if (!this.resumeData.skills) this.resumeData.skills = [];
            if (!this.resumeData.hobbies) this.resumeData.hobbies = [];
            if (!this.resumeData.experience) this.resumeData.experience = [];
            if (!this.resumeData.certifications) this.resumeData.certifications = [];
            if (!this.resumeData.education) this.resumeData.education = [];

            // Populate header fields
            Object.keys(this.resumeData.header).forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = this.resumeData.header[field] || '';
                }
            });

            // Populate professional summary
            const summaryElement = document.getElementById('professionalSummary');
            if (summaryElement) {
                summaryElement.value = this.resumeData.professionalSummary || '';
            }

            // Populate skills
            const skillsElement = document.getElementById('skills');
            if (skillsElement) {
                skillsElement.value = this.resumeData.skills.join(', ');
            }

            // Populate hobbies
            const hobbiesElement = document.getElementById('hobbies');
            if (hobbiesElement) {
                hobbiesElement.value = this.resumeData.hobbies.join(', ');
            }

            // Populate profile picture
            if (this.resumeData.header.profilePicture) {
                this.displayProfilePicture(this.resumeData.header.profilePicture);
            }

            // Render sections
            this.renderExperience();
            this.renderCertifications();
            this.renderEducation();
            
            console.log('Editor rendered successfully');
        } catch (error) {
            console.error('Error rendering editor:', error);
        }
    }

    handleProfilePicture(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.resumeData.header.profilePicture = imageData;
            this.saveToLocalStorage();
            this.displayProfilePicture(imageData);
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }

    displayProfilePicture(imageData) {
        const previewContainer = document.getElementById('profilePreview');
        previewContainer.innerHTML = `<img src="${imageData}" alt="Profile Picture">`;
    }

    renderCertifications() {
        const container = document.getElementById('certificationsContainer');
        if (!container) return;
        
        container.innerHTML = '';

        const certifications = this.resumeData.certifications || [];
        certifications.forEach((cert, index) => {
            const certDiv = document.createElement('div');
            certDiv.className = 'experience-item';
            certDiv.innerHTML = `
                <div class="item-header">
                    <h4>Certification ${index + 1}</h4>
                    <button type="button" class="remove-btn" onclick="resumeBuilder.removeCertification(${index})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Certification Name</label>
                    <input type="text" value="${cert.name || ''}" onchange="resumeBuilder.updateCertification(${index}, 'name', this.value)">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" value="${cert.issuer || ''}" onchange="resumeBuilder.updateCertification(${index}, 'issuer', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="text" value="${cert.date || ''}" onchange="resumeBuilder.updateCertification(${index}, 'date', this.value)">
                    </div>
                </div>
            `;
            container.appendChild(certDiv);
        });
    }

    updateCertification(index, field, value) {
        if (!this.resumeData.certifications) this.resumeData.certifications = [];
        this.resumeData.certifications[index][field] = value;
        this.saveToLocalStorage();
        this.updatePreview();
    }

    addCertification() {
        if (!this.resumeData.certifications) this.resumeData.certifications = [];
        this.resumeData.certifications.push({
            name: '',
            issuer: '',
            date: ''
        });
        this.saveToLocalStorage();
        this.renderCertifications();
        this.updatePreview();
    }

    removeCertification(index) {
        if (!this.resumeData.certifications) return;
        this.resumeData.certifications.splice(index, 1);
        this.saveToLocalStorage();
        this.renderCertifications();
        this.updatePreview();
    }

    renderExperience() {
        const container = document.getElementById('experienceContainer');
        container.innerHTML = '';

        this.resumeData.experience.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-item';
            expDiv.innerHTML = `
                <div class="item-header">
                    <h4>Experience ${index + 1}</h4>
                    <button type="button" class="remove-btn" onclick="resumeBuilder.removeExperience(${index})">Remove</button>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Job Title</label>
                        <input type="text" value="${exp.title || ''}" onchange="resumeBuilder.updateExperience(${index}, 'title', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" value="${exp.company || ''}" onchange="resumeBuilder.updateExperience(${index}, 'company', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" value="${exp.location || ''}" onchange="resumeBuilder.updateExperience(${index}, 'location', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="text" value="${exp.startDate || ''}" onchange="resumeBuilder.updateExperience(${index}, 'startDate', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="text" value="${exp.endDate || ''}" onchange="resumeBuilder.updateExperience(${index}, 'endDate', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea rows="3" onchange="resumeBuilder.updateExperience(${index}, 'description', this.value)">${exp.description || ''}</textarea>
                </div>
            `;
            container.appendChild(expDiv);
        });
    }

    renderEducation() {
        const container = document.getElementById('educationContainer');
        container.innerHTML = '';

        this.resumeData.education.forEach((edu, index) => {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'education-item';
            eduDiv.innerHTML = `
                <div class="item-header">
                    <h4>Education ${index + 1}</h4>
                    <button type="button" class="remove-btn" onclick="resumeBuilder.removeEducation(${index})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" value="${edu.degree || ''}" onchange="resumeBuilder.updateEducation(${index}, 'degree', this.value)">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>School</label>
                        <input type="text" value="${edu.school || ''}" onchange="resumeBuilder.updateEducation(${index}, 'school', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" value="${edu.location || ''}" onchange="resumeBuilder.updateEducation(${index}, 'location', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Year</label>
                    <input type="text" value="${edu.year || ''}" onchange="resumeBuilder.updateEducation(${index}, 'year', this.value)">
                </div>
            `;
            container.appendChild(eduDiv);
        });
    }

    updateExperience(index, field, value) {
        this.resumeData.experience[index][field] = value;
        this.saveToLocalStorage();
        this.updatePreview();
    }

    updateEducation(index, field, value) {
        this.resumeData.education[index][field] = value;
        this.saveToLocalStorage();
        this.updatePreview();
    }

    addExperience() {
        this.resumeData.experience.push({
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: ''
        });
        this.saveToLocalStorage();
        this.renderExperience();
        this.updatePreview();
    }

    removeExperience(index) {
        this.resumeData.experience.splice(index, 1);
        this.saveToLocalStorage();
        this.renderExperience();
        this.updatePreview();
    }

    addEducation() {
        this.resumeData.education.push({
            degree: '',
            school: '',
            location: '',
            year: ''
        });
        this.saveToLocalStorage();
        this.renderEducation();
        this.updatePreview();
    }

    removeEducation(index) {
        this.resumeData.education.splice(index, 1);
        this.saveToLocalStorage();
        this.renderEducation();
        this.updatePreview();
    }

    updatePreview() {
        // Update header
        document.getElementById('previewName').textContent = this.resumeData.header.name || 'Your Name';
        document.getElementById('previewRole').textContent = this.resumeData.header.role || 'Your Role';
        document.getElementById('previewEmail').textContent = this.resumeData.header.email || '';
        document.getElementById('previewPhone').textContent = this.resumeData.header.phone || '';
        document.getElementById('previewLocation').textContent = this.resumeData.header.location || '';
        document.getElementById('previewLinkedin').textContent = this.resumeData.header.linkedin || '';
        document.getElementById('previewWebsite').textContent = this.resumeData.header.website || '';

        // Update profile picture
        const profileImg = document.getElementById('previewProfilePicture');
        if (this.resumeData.header.profilePicture) {
            profileImg.src = this.resumeData.header.profilePicture;
            profileImg.style.display = 'block';
        } else {
            profileImg.style.display = 'none';
        }

        // Update professional summary
        document.getElementById('previewSummary').textContent = this.resumeData.professionalSummary || '';

        // Update skills
        const skillsContainer = document.getElementById('previewSkills');
        skillsContainer.innerHTML = '';
        this.resumeData.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsContainer.appendChild(skillTag);
        });

        // Update hobbies
        const hobbiesContainer = document.getElementById('previewHobbies');
        hobbiesContainer.innerHTML = '';
        (this.resumeData.hobbies || []).forEach(hobby => {
            const hobbyTag = document.createElement('span');
            hobbyTag.className = 'hobby-tag';
            hobbyTag.textContent = hobby;
            hobbiesContainer.appendChild(hobbyTag);
        });

        // Update experience
        const expContainer = document.getElementById('previewExperience');
        expContainer.innerHTML = '';
        this.resumeData.experience.forEach(exp => {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-entry';
            expDiv.innerHTML = `
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${exp.title || ''}</div>
                        <div class="entry-company">${exp.company || ''}</div>
                        <div class="entry-location">${exp.location || ''}</div>
                    </div>
                    <div class="entry-date">${exp.startDate || ''} - ${exp.endDate || ''}</div>
                </div>
                <div class="entry-description">${exp.description || ''}</div>
            `;
            expContainer.appendChild(expDiv);
        });

        // Update certifications
        const certContainer = document.getElementById('previewCertifications');
        certContainer.innerHTML = '';
        (this.resumeData.certifications || []).forEach(cert => {
            const certDiv = document.createElement('div');
            certDiv.className = 'experience-entry';
            certDiv.innerHTML = `
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${cert.name || ''}</div>
                        <div class="entry-company">${cert.issuer || ''}</div>
                    </div>
                    <div class="entry-date">${cert.date || ''}</div>
                </div>
            `;
            certContainer.appendChild(certDiv);
        });

        // Update education
        const eduContainer = document.getElementById('previewEducation');
        eduContainer.innerHTML = '';
        this.resumeData.education.forEach(edu => {
            const eduDiv = document.createElement('div');
            eduDiv.className = 'education-entry';
            eduDiv.innerHTML = `
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${edu.degree || ''}</div>
                        <div class="entry-company">${edu.school || ''}</div>
                        <div class="entry-location">${edu.location || ''}</div>
                    </div>
                    <div class="entry-date">${edu.year || ''}</div>
                </div>
            `;
            eduContainer.appendChild(eduDiv);
        });
    }

    saveResume() {
        this.saveToLocalStorage();
        // Show success message
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    resetToDefault() {
        if (confirm('Are you sure you want to reset to the default template? This will erase all your current data.')) {
            this.resumeData = JSON.parse(JSON.stringify(this.defaultResume));
            this.saveToLocalStorage();
            this.renderEditor();
            this.updatePreview();
        }
    }

    exportResume() {
        const dataStr = JSON.stringify(this.resumeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${this.resumeData.header.name.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    importResume(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.resumeData = importedData;
                this.saveToLocalStorage();
                this.renderEditor();
                this.updatePreview();
                alert('Resume imported successfully!');
            } catch (error) {
                alert('Error importing resume. Please check the file format.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    async downloadPDF() {
        // Create a new window with just the resume for printing
        const resumeElement = document.getElementById('resumePreview');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${this.resumeData.header.name || 'Download'}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: white;
                        color: #334155;
                        line-height: 1.4;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                        font-size: 13px;
                    }
                    
                    .resume-header {
                        padding: 20px;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                        color: white;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .header-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    
                    .profile-section {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 12px;
                    }
                    
                    .profile-image {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid rgba(255, 255, 255, 0.3);
                    }
                    
                    .header-text {
                        text-align: left;
                    }
                    
                    .resume-header h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    
                    .resume-header h2 {
                        font-size: 16px;
                        font-weight: 500;
                        color: rgba(255, 255, 255, 0.9);
                        margin-bottom: 12px;
                    }
                    
                    .contact-info {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 12px;
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.8);
                    }
                    
                    .contact-info span:not(:last-child)::after {
                        content: ' • ';
                        margin-left: 6px;
                        color: rgba(255, 255, 255, 0.6);
                    }
                    
                    .resume-section {
                        margin-bottom: 18px;
                        page-break-inside: avoid;
                    }
                    
                    .resume-section h3 {
                        font-size: 16px;
                        font-weight: 600;
                        color: #6366f1;
                        margin-bottom: 10px;
                        padding-bottom: 4px;
                        border-bottom: 2px solid #6366f1;
                    }
                    
                    .resume-section p {
                        color: #475569;
                        margin-bottom: 10px;
                        line-height: 1.4;
                    }
                    
                    .skills-grid, .hobbies-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 6px;
                        margin-bottom: 10px;
                    }
                    
                    .skill-tag {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        padding: 4px 10px;
                        border-radius: 15px;
                        font-size: 11px;
                        font-weight: 500;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .hobby-tag {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        padding: 4px 10px;
                        border-radius: 15px;
                        font-size: 11px;
                        font-weight: 500;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    
                    .experience-entry,
                    .education-entry {
                        margin-bottom: 14px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #f1f5f9;
                        page-break-inside: avoid;
                    }
                    
                    .experience-entry:last-child,
                    .education-entry:last-child {
                        border-bottom: none;
                    }
                    
                    .entry-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 6px;
                        flex-wrap: wrap;
                        gap: 6px;
                    }
                    
                    .entry-title {
                        font-weight: 600;
                        color: #6366f1;
                        font-size: 14px;
                    }
                    
                    .entry-company {
                        color: #8b5cf6;
                        font-weight: 500;
                        font-size: 13px;
                    }
                    
                    .entry-location {
                        color: #64748b;
                        font-size: 12px;
                    }
                    
                    .entry-date {
                        color: #64748b;
                        font-size: 12px;
                        font-weight: 500;
                    }
                    
                    .entry-description {
                        color: #475569;
                        margin-top: 6px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    
                    @media print {
                        body {
                            padding: 15px;
                            font-size: 12px;
                        }
                        
                        .resume-header {
                            padding: 15px;
                            margin-bottom: 15px;
                        }
                        
                        .resume-section {
                            margin-bottom: 15px;
                        }
                        
                        .resume-header,
                        .skill-tag,
                        .hobby-tag {
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        
                        .profile-image {
                            width: 50px;
                            height: 50px;
                        }
                    }
                </style>
            </head>
            <body>
                ${resumeElement.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            
            // Show instructions
            setTimeout(() => {
                alert('In the print dialog:\n1. Choose "Save as PDF" as destination\n2. Select "More settings" → check "Background graphics"\n3. Click Save\n4. Choose where to save your resume PDF');
            }, 500);
        }, 1000);
    }
}

// Global functions for onclick handlers
function addExperience() {
    resumeBuilder.addExperience();
}

function addCertification() {
    resumeBuilder.addCertification();
}

function addEducation() {
    resumeBuilder.addEducation();
}

// Initialize the resume builder
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilder();
});