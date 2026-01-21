// ShareManager - Handles URL generation and data encoding/decoding
class ShareManager {
    constructor() {
        this.maxUrlLength = 2000; // Conservative URL length limit
    }

    /**
     * Generates a shareable URL containing encoded resume data
     * @param {Object} resumeData - Complete resume data object
     * @param {Object} settings - Visual settings (template, colors, fonts, theme)
     * @returns {string} - Shareable URL with encoded data
     */
    generateShareURL(resumeData, settings) {
        try {
            const shareableData = {
                resumeData: resumeData,
                settings: {
                    ...settings,
                    shareMetadata: {
                        createdAt: new Date().toISOString(),
                        version: "1.0"
                    }
                }
            };

            const jsonString = JSON.stringify(shareableData);
            const encodedData = btoa(encodeURIComponent(jsonString));
            
            // Check URL length limitations
            const baseUrl = `${window.location.origin}${window.location.pathname}`;
            const shareUrl = `${baseUrl}?data=${encodedData}`;
            
            if (shareUrl.length > this.maxUrlLength) {
                throw new Error('Resume data too large for URL sharing');
            }
            
            return shareUrl;
        } catch (error) {
            console.error('Error generating share URL:', error);
            throw new Error('Failed to generate shareable URL: ' + error.message);
        }
    }

    /**
     * Parses a share URL and extracts resume data
     * @param {string} url - URL containing encoded resume data
     * @returns {Object|null} - Decoded resume data and settings, or null if invalid
     */
    parseShareURL(url) {
        try {
            const urlObj = new URL(url);
            const encodedData = urlObj.searchParams.get('data');
            
            if (!encodedData) {
                return null;
            }

            const jsonString = decodeURIComponent(atob(encodedData));
            const shareableData = JSON.parse(jsonString);
            
            // Validate the structure
            if (!this.validateResumeData(shareableData)) {
                throw new Error('Invalid resume data structure');
            }
            
            return shareableData;
        } catch (error) {
            console.error('Error parsing share URL:', error);
            return null;
        }
    }

    /**
     * Validates the structure of decoded resume data
     * @param {Object} data - Decoded data to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    validateResumeData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required top-level properties
        if (!data.resumeData || !data.settings) {
            return false;
        }

        const resumeData = data.resumeData;
        
        // Validate resume data structure
        const requiredSections = ['personal', 'experience', 'education', 'skills', 'projects', 'social'];
        for (const section of requiredSections) {
            if (!(section in resumeData)) {
                return false;
            }
        }

        // Validate array sections
        const arraySections = ['experience', 'education', 'skills', 'projects'];
        for (const section of arraySections) {
            if (!Array.isArray(resumeData[section])) {
                return false;
            }
        }

        // Validate settings structure
        const settings = data.settings;
        if (!settings.template || !settings.primaryColor || !settings.fontFamily) {
            return false;
        }

        return true;
    }

    /**
     * Handles URL length limitations for large datasets
     * @param {Object} data - Resume data to check
     * @returns {boolean} - True if data size is acceptable
     */
    handleURLLimitations(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encodedData = btoa(encodeURIComponent(jsonString));
            const estimatedUrlLength = window.location.origin.length + 
                                     window.location.pathname.length + 
                                     encodedData.length + 20; // Buffer for parameters
            
            return estimatedUrlLength <= this.maxUrlLength;
        } catch (error) {
            return false;
        }
    }

    /**
     * Checks if browser supports required features for URL sharing
     * @returns {boolean} - True if browser is compatible
     */
    checkBrowserCompatibility() {
        try {
            // Check for Base64 encoding/decoding support
            if (typeof btoa === 'undefined' || typeof atob === 'undefined') {
                return false;
            }

            // Test Base64 functionality
            const testString = 'test';
            const encoded = btoa(testString);
            const decoded = atob(encoded);
            
            if (decoded !== testString) {
                return false;
            }

            // Check for URL API support
            if (typeof URL === 'undefined') {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

// ViewModeController - Manages view-only interface state and transitions
class ViewModeController {
    constructor(resumeBuilder) {
        this.resumeBuilder = resumeBuilder;
        this.isViewMode = false;
        this.originalLayout = null;
    }

    /**
     * Switches to view-only interface
     * @param {Object} resumeData - Resume data to display
     */
    enterViewMode(resumeData) {
        this.isViewMode = true;
        
        // Store original layout state
        this.storeOriginalLayout();
        
        // Hide editing controls
        this.hideEditingControls();
        
        // Adjust layout for viewing
        this.adjustLayoutForViewing();
        
        // Show duplicate button
        this.showDuplicateButton();
        
        // Update header for view mode
        this.updateHeaderForViewMode();
        
        console.log('Entered view mode');
    }

    /**
     * Returns to edit mode
     */
    exitViewMode() {
        if (!this.isViewMode) return;
        
        this.isViewMode = false;
        
        // Restore original layout
        this.restoreOriginalLayout();
        
        // Show editing controls
        this.showEditingControls();
        
        // Hide duplicate button
        this.hideDuplicateButton();
        
        // Restore header
        this.restoreHeaderForEditMode();
        
        console.log('Exited view mode');
    }

    /**
     * Stores the original layout state
     */
    storeOriginalLayout() {
        const formSection = document.querySelector('.form-section');
        const previewSection = document.querySelector('.preview-section');
        const mainContent = document.querySelector('.main-content');
        
        this.originalLayout = {
            formDisplay: formSection ? formSection.style.display : '',
            previewClass: previewSection ? previewSection.className : '',
            mainContentClass: mainContent ? mainContent.className : ''
        };
    }

    /**
     * Hides all editing controls and form sections
     */
    hideEditingControls() {
        // Hide the entire form section
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.style.display = 'none';
        }

        // Hide header action buttons
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.style.display = 'none';
        }
    }

    /**
     * Shows editing controls (for returning to edit mode)
     */
    showEditingControls() {
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.style.display = '';
        }

        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.style.display = '';
        }
    }

    /**
     * Adjusts layout for full-width preview display
     */
    adjustLayoutForViewing() {
        const mainContent = document.querySelector('.main-content');
        const previewSection = document.querySelector('.preview-section');
        
        if (mainContent) {
            mainContent.classList.add('view-mode');
        }
        
        if (previewSection) {
            previewSection.classList.add('full-width');
        }
    }

    /**
     * Restores original layout
     */
    restoreOriginalLayout() {
        const mainContent = document.querySelector('.main-content');
        const previewSection = document.querySelector('.preview-section');
        
        if (mainContent) {
            mainContent.classList.remove('view-mode');
        }
        
        if (previewSection) {
            previewSection.classList.remove('full-width');
        }
    }

    /**
     * Shows the "Use This Resume" button prominently
     */
    showDuplicateButton() {
        // Remove existing duplicate button if any
        this.hideDuplicateButton();
        
        const previewHeader = document.querySelector('.preview-header');
        if (previewHeader) {
            const duplicateBtn = document.createElement('button');
            duplicateBtn.id = 'useThisResumeBtn';
            duplicateBtn.className = 'use-resume-btn';
            duplicateBtn.innerHTML = '<i class="fas fa-copy"></i> Use This Resume';
            duplicateBtn.onclick = () => this.handleDuplicateClick();
            
            // Insert before the preview header content
            previewHeader.insertBefore(duplicateBtn, previewHeader.firstChild);
        }
    }

    /**
     * Hides the duplicate button
     */
    hideDuplicateButton() {
        const duplicateBtn = document.getElementById('useThisResumeBtn');
        if (duplicateBtn) {
            duplicateBtn.remove();
        }
    }

    /**
     * Updates header for view mode
     */
    updateHeaderForViewMode() {
        const appHeader = document.querySelector('.app-header');
        if (appHeader) {
            appHeader.classList.add('view-mode-header');
            
            // Add "Create Your Own" link
            const headerTitle = appHeader.querySelector('h1');
            if (headerTitle && !document.getElementById('createOwnLink')) {
                const createLink = document.createElement('a');
                createLink.id = 'createOwnLink';
                createLink.href = window.location.pathname;
                createLink.className = 'create-own-link';
                createLink.innerHTML = '<i class="fas fa-plus"></i> Create Your Own Resume';
                appHeader.appendChild(createLink);
            }
        }
    }

    /**
     * Restores header for edit mode
     */
    restoreHeaderForEditMode() {
        const appHeader = document.querySelector('.app-header');
        if (appHeader) {
            appHeader.classList.remove('view-mode-header');
            
            const createLink = document.getElementById('createOwnLink');
            if (createLink) {
                createLink.remove();
            }
        }
    }

    /**
     * Handles the "Use This Resume" button click
     */
    handleDuplicateClick() {
        // This will be implemented in the DuplicateManager
        if (this.resumeBuilder.duplicateManager) {
            this.resumeBuilder.duplicateManager.createResumeCopy();
        }
    }

    /**
     * Checks if currently in view mode
     */
    isInViewMode() {
        return this.isViewMode;
    }
}

// DuplicateManager - Creates independent copies of shared resumes
class DuplicateManager {
    constructor(resumeBuilder) {
        this.resumeBuilder = resumeBuilder;
    }

    /**
     * Creates an independent copy of the current resume
     */
    createResumeCopy() {
        try {
            // Get current resume data
            const originalData = this.resumeBuilder.resumeData;
            const originalSettings = {
                template: this.resumeBuilder.currentTemplate,
                primaryColor: this.resumeBuilder.primaryColor,
                fontFamily: this.resumeBuilder.fontFamily,
                isDarkTheme: this.resumeBuilder.isDarkTheme
            };

            // Deep clone the data to ensure independence
            const copiedData = this.deepCloneResumeData(originalData);
            const copiedSettings = { ...originalSettings };

            // Validate copy integrity
            if (!this.validateCopyIntegrity(copiedData, originalData)) {
                throw new Error('Failed to create valid resume copy');
            }

            // Clear original reference and initialize edit mode
            this.clearOriginalReference();
            this.initializeEditMode(copiedData, copiedSettings);

            // Show success message
            this.resumeBuilder.showSuccessMessage('Resume copied successfully! You can now edit your own version.');

        } catch (error) {
            console.error('Error creating resume copy:', error);
            this.resumeBuilder.showUrlError('Failed to create resume copy: ' + error.message);
        }
    }

    /**
     * Deep clones resume data to ensure complete independence
     * @param {Object} originalData - Original resume data
     * @returns {Object} - Deep cloned resume data
     */
    deepCloneResumeData(originalData) {
        // Use JSON parse/stringify for deep cloning
        // This ensures no references are shared between original and copy
        return JSON.parse(JSON.stringify(originalData));
    }

    /**
     * Initializes edit mode with the copied data
     * @param {Object} copiedData - Cloned resume data
     * @param {Object} copiedSettings - Cloned settings
     */
    initializeEditMode(copiedData, copiedSettings) {
        // Exit view mode first
        this.resumeBuilder.viewModeController.exitViewMode();

        // Load the copied data
        const shareData = {
            resumeData: copiedData,
            settings: copiedSettings
        };
        
        this.resumeBuilder.loadResumeData(shareData);

        // Clean the URL to remove share parameters
        this.resumeBuilder.cleanURL();

        // Update the page title to indicate this is a copy
        document.title = 'Resume Builder - Editing Copy';
    }

    /**
     * Clears any reference to the original shared resume
     */
    clearOriginalReference() {
        // Remove any stored reference to original data
        // This ensures the copy is completely independent
        
        // Clear any cached share URL data
        if (this.resumeBuilder.originalShareData) {
            delete this.resumeBuilder.originalShareData;
        }

        // Clear browser history of share URL
        window.history.replaceState({}, 'Resume Builder', window.location.pathname);
    }

    /**
     * Validates that the copy was created successfully
     * @param {Object} copiedData - The copied data
     * @param {Object} originalData - The original data
     * @returns {boolean} - True if copy is valid
     */
    validateCopyIntegrity(copiedData, originalData) {
        try {
            // Check that all main sections exist
            const requiredSections = ['personal', 'experience', 'education', 'skills', 'projects', 'social'];
            
            for (const section of requiredSections) {
                if (!(section in copiedData)) {
                    console.error(`Missing section in copy: ${section}`);
                    return false;
                }
            }

            // Check that arrays have the same length
            const arraySections = ['experience', 'education', 'skills', 'projects'];
            for (const section of arraySections) {
                if (Array.isArray(originalData[section]) && Array.isArray(copiedData[section])) {
                    if (originalData[section].length !== copiedData[section].length) {
                        console.error(`Array length mismatch in section: ${section}`);
                        return false;
                    }
                }
            }

            // Verify that the copy is not the same object reference
            if (copiedData === originalData) {
                console.error('Copy is not independent - same object reference');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating copy integrity:', error);
            return false;
        }
    }

    /**
     * Ensures copied resume has full functionality
     * @returns {boolean} - True if all functions work correctly
     */
    validateCopyFunctionality() {
        try {
            // Test that basic operations work
            const testData = this.resumeBuilder.resumeData;
            
            // Test data access
            if (!testData || typeof testData !== 'object') {
                return false;
            }

            // Test that the resume can be modified
            const originalName = testData.personal?.fullName || '';
            
            // Test that save functionality works
            if (typeof this.resumeBuilder.saveResume !== 'function') {
                return false;
            }

            // Test that share functionality works
            if (typeof this.resumeBuilder.shareAsLink !== 'function') {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating copy functionality:', error);
            return false;
        }
    }
}

// DefaultTemplateManager - Handles default resume template loading
class DefaultTemplateManager {
    constructor(resumeBuilder) {
        this.resumeBuilder = resumeBuilder;
        this.storageKey = 'resumeBuilder_userData';
        this.templateUrl = './defaultResume.json';
    }

    /**
     * Initializes the resume - loads from localStorage or default template
     */
    async initializeResume() {
        try {
            // Check if user has existing data in localStorage
            const existingData = this.loadFromLocalStorage();
            
            if (existingData) {
                console.log('Loading existing user resume from localStorage');
                this.resumeBuilder.loadResumeData(existingData);
                return;
            }

            // No existing data - load default template
            console.log('No existing resume found, loading default template');
            await this.loadDefaultTemplate();
            
        } catch (error) {
            console.error('Error initializing resume:', error);
            // Fallback to empty resume if everything fails
            this.createEmptyResume();
        }
    }

    /**
     * Loads the default resume template from JSON file
     */
    async loadDefaultTemplate() {
        try {
            const response = await fetch(this.templateUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            
            const defaultTemplate = await response.json();
            
            // Load the template data
            this.resumeBuilder.loadResumeData(defaultTemplate);
            
            // Save as user's first resume
            this.saveToLocalStorage(defaultTemplate);
            
            console.log('Default template loaded and saved');
            
        } catch (error) {
            console.error('Error loading default template:', error);
            // Create a basic empty resume if template loading fails
            this.createEmptyResume();
        }
    }

    /**
     * Creates an empty resume as fallback
     */
    createEmptyResume() {
        const emptyResume = {
            resumeData: {
                personal: {},
                summary: '',
                experience: [],
                education: [],
                skills: [],
                projects: [],
                social: {},
                certifications: [],
                languages: [],
                hobbies: []
            },
            settings: {
                template: 'minimal',
                primaryColor: '#2563eb',
                fontFamily: 'Inter',
                isDarkTheme: false
            }
        };
        
        this.resumeBuilder.loadResumeData(emptyResume);
        this.saveToLocalStorage(emptyResume);
    }

    /**
     * Loads resume data from localStorage
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
            return null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    /**
     * Saves resume data to localStorage
     */
    saveToLocalStorage(resumeData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(resumeData));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Auto-saves current resume data to localStorage
     */
    autoSave() {
        const currentData = {
            resumeData: this.resumeBuilder.resumeData,
            settings: {
                template: this.resumeBuilder.currentTemplate,
                primaryColor: this.resumeBuilder.primaryColor,
                fontFamily: this.resumeBuilder.fontFamily,
                isDarkTheme: this.resumeBuilder.isDarkTheme
            }
        };
        
        this.saveToLocalStorage(currentData);
    }

    /**
     * Clears all saved data (reset to default)
     */
    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Checks if user has any saved data
     */
    hasSavedData() {
        return localStorage.getItem(this.storageKey) !== null;
    }
}

class ResumeBuilder {
    constructor() {
        this.resumeData = {
            personal: {
                fullName: 'Diya Raghavendra',
                title: 'Full Stack Developer',
                email: 'diya.drap@gmail.com',
                phone: '6363251508',
                location: 'Bangalore, India'
            },
            summary: 'Highly motivated Full Stack Developer with hands-on experience in designing, developing, and deploying scalable web applications. Skilled in modern frontend and backend technologies, RESTful APIs, and database design. Passionate about clean code, performance optimization, and building user-centric digital experiences.',
            experience: [
                {
                    jobTitle: 'Full Stack Developer',
                    company: 'Tech Solutions Pvt. Ltd., Bangalore',
                    startDate: '2023',
                    endDate: 'Present',
                    description: 'Developed responsive web applications using React, Node.js, and Express. Built and integrated REST APIs for frontend-backend communication. Implemented authentication and authorization using JWT. Improved application performance and UI responsiveness. Worked in Agile teams with designers and testers.'
                },
                {
                    jobTitle: 'Web Developer Intern',
                    company: 'Startup Hub, Bangalore',
                    startDate: '2022',
                    endDate: '2023',
                    description: 'Built UI components using HTML, CSS, JavaScript, and React. Assisted in backend API development with Node.js. Managed databases using MongoDB. Participated in testing and deployment processes.'
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Engineering (B.E.) – Computer Science',
                    school: 'XYZ Institute of Technology, Karnataka',
                    gradYear: '2019 – 2023',
                    gpa: 'CGPA: 8.4 / 10'
                }
            ],
            skills: [
                { name: 'HTML5', level: 'Expert' },
                { name: 'CSS3', level: 'Expert' },
                { name: 'JavaScript (ES6+)', level: 'Advanced' },
                { name: 'React.js', level: 'Advanced' },
                { name: 'Tailwind CSS', level: 'Advanced' },
                { name: 'Bootstrap', level: 'Advanced' },
                { name: 'Node.js', level: 'Advanced' },
                { name: 'Express.js', level: 'Advanced' },
                { name: 'REST APIs', level: 'Advanced' },
                { name: 'MongoDB', level: 'Intermediate' },
                { name: 'MySQL', level: 'Intermediate' },
                { name: 'Git', level: 'Advanced' },
                { name: 'GitHub', level: 'Advanced' },
                { name: 'VS Code', level: 'Expert' },
                { name: 'Postman', level: 'Advanced' },
                { name: 'Docker', level: 'Beginner' }
            ],
            projects: [
                {
                    name: 'Resume Builder Web Application',
                    description: 'Developed a web-based resume builder with live preview. Implemented PDF download functionality. Built modern responsive UI using React and Tailwind CSS.',
                    link: ''
                },
                {
                    name: 'E-Commerce Web Application',
                    description: 'Full-stack app with user authentication and product management. Integrated shopping cart and checkout features. Built using React, Node.js, MongoDB.',
                    link: ''
                }
            ],
            social: {
                github: 'https://github.com/diya-raghavendra',
                linkedin: 'https://linkedin.com/in/diya-raghavendra',
                portfolio: 'https://diya.dev'
            },
            certifications: [
                'Full Stack Web Development – Udemy',
                'JavaScript Algorithms and Data Structures – freeCodeCamp'
            ],
            languages: [
                'English (Fluent)',
                'Kannada (Native)',
                'Hindi (Conversational)'
            ],
            hobbies: [
                'Coding personal projects',
                'UI/UX design',
                'Tech blogging',
                'Problem-solving'
            ]
        };
        
        this.currentTemplate = 'minimal';
        this.primaryColor = '#2563eb';
        this.fontFamily = 'Inter';
        this.isDarkTheme = false;
        
        // Initialize ShareManager
        this.shareManager = new ShareManager();
        
        // Initialize ViewModeController
        this.viewModeController = new ViewModeController(this);
        
        // Initialize DuplicateManager
        this.duplicateManager = new DuplicateManager(this);
        
        // Initialize DefaultTemplateManager
        this.defaultTemplateManager = new DefaultTemplateManager(this);
        
        this.initializeEventListeners();
        
        // Initialize with default template or saved data
        this.initializeWithTemplate();
    }

    prefillForm() {
        // Fill personal details
        document.getElementById('fullName').value = this.resumeData.personal.fullName || '';
        document.getElementById('title').value = this.resumeData.personal.title || '';
        document.getElementById('email').value = this.resumeData.personal.email || '';
        document.getElementById('phone').value = this.resumeData.personal.phone || '';
        document.getElementById('location').value = this.resumeData.personal.location || '';
        
        // Fill summary
        document.getElementById('summary').value = this.resumeData.summary || '';
        
        // Fill social links
        document.getElementById('linkedin').value = this.resumeData.social.linkedin || '';
        document.getElementById('github').value = this.resumeData.social.github || '';
        document.getElementById('portfolio').value = this.resumeData.social.portfolio || '';
        
        // Add experience items
        this.resumeData.experience.forEach((exp, index) => {
            if (index > 0) this.addExperienceItem();
            const items = document.querySelectorAll('.experience-item');
            const item = items[index];
            if (item) {
                item.querySelector('.jobTitle').value = exp.jobTitle || '';
                item.querySelector('.company').value = exp.company || '';
                item.querySelector('.startDate').value = exp.startDate || '';
                item.querySelector('.endDate').value = exp.endDate || '';
                item.querySelector('.jobDescription').value = exp.description || '';
            }
        });
        
        // Add education items
        this.resumeData.education.forEach((edu, index) => {
            if (index > 0) this.addEducationItem();
            const items = document.querySelectorAll('.education-item');
            const item = items[index];
            if (item) {
                item.querySelector('.degree').value = edu.degree || '';
                item.querySelector('.school').value = edu.school || '';
                item.querySelector('.gradYear').value = edu.gradYear || '';
                item.querySelector('.gpa').value = edu.gpa || '';
            }
        });
        
        // Add skill items
        this.resumeData.skills.forEach((skill, index) => {
            if (index > 0) this.addSkillItem();
            const items = document.querySelectorAll('.skill-item');
            const item = items[index];
            if (item) {
                item.querySelector('.skillName').value = skill.name || '';
                item.querySelector('.skillLevel').value = skill.level || 'Intermediate';
            }
        });
        
        // Add project items
        this.resumeData.projects.forEach((project, index) => {
            if (index > 0) this.addProjectItem();
            const items = document.querySelectorAll('.project-item');
            const item = items[index];
            if (item) {
                item.querySelector('.projectName').value = project.name || '';
                item.querySelector('.projectDescription').value = project.description || '';
                item.querySelector('.projectLink').value = project.link || '';
            }
        });

        // Add certification items
        this.resumeData.certifications.forEach((cert, index) => {
            if (index > 0) this.addCertificationItem();
            const items = document.querySelectorAll('.certification-item');
            const item = items[index];
            if (item) {
                item.querySelector('.certificationName').value = cert || '';
            }
        });

        // Add language items
        this.resumeData.languages.forEach((lang, index) => {
            if (index > 0) this.addLanguageItem();
            const items = document.querySelectorAll('.language-item');
            const item = items[index];
            if (item) {
                item.querySelector('.languageName').value = lang || '';
            }
        });

        // Add hobby items
        this.resumeData.hobbies.forEach((hobby, index) => {
            if (index > 0) this.addHobbyItem();
            const items = document.querySelectorAll('.hobby-item');
            const item = items[index];
            if (item) {
                item.querySelector('.hobbyName').value = hobby || '';
            }
        });
    }

    initializeEventListeners() {
        // Personal details
        const personalFields = ['fullName', 'title', 'email', 'phone', 'location'];
        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updatePersonalData());
            }
        });

        // Profile picture
        document.getElementById('profilePic').addEventListener('change', (e) => this.handleProfilePicture(e));

        // Summary
        document.getElementById('summary').addEventListener('input', () => this.updateSummary());

        // Dynamic sections
        this.initializeDynamicSections();

        // Social links
        const socialFields = ['linkedin', 'github', 'portfolio'];
        socialFields.forEach(field => {
            document.getElementById(field).addEventListener('input', () => this.updateSocialLinks());
        });

        // Template and theme controls
        document.getElementById('templateSelect').addEventListener('change', (e) => this.changeTemplate(e.target.value));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('primaryColor').addEventListener('change', (e) => this.changePrimaryColor(e.target.value));
        document.getElementById('fontFamily').addEventListener('change', (e) => this.changeFontFamily(e.target.value));

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());

        // Save/Load/Share buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveResume());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadResume());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetToTemplate());
        document.getElementById('shareBtn').addEventListener('click', () => this.openShareModal());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e));

        // Import/Export buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportResume());
        document.getElementById('importBtn').addEventListener('click', () => this.importResume());
        document.getElementById('importInput').addEventListener('change', (e) => this.handleImportFile(e));

        // Share modal buttons
        document.getElementById('shareFileBtn').addEventListener('click', () => this.shareAsFile());
        document.getElementById('shareLinkBtn').addEventListener('click', () => this.shareAsLink());
        document.getElementById('shareWhatsAppBtn').addEventListener('click', () => this.shareViaWhatsApp());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
    }

    /**
     * Initializes the resume with template or saved data
     */
    async initializeWithTemplate() {
        // First check for shared data in URL (takes priority)
        if (window.location.href.includes('?data=')) {
            this.loadFromURL();
            return;
        }

        // Otherwise, initialize with default template or saved data
        await this.defaultTemplateManager.initializeResume();
        
        // Prefill form and update preview
        this.prefillForm();
        this.updatePreview();
    }

    /**
     * Auto-saves resume data on changes
     */
    autoSaveResume() {
        // Debounce auto-save to avoid excessive saves
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.defaultTemplateManager.autoSave();
        }, 1000); // Save 1 second after last change
    }

    /**
     * Resets the resume to the default template
     */
    async resetToTemplate() {
        if (confirm('Are you sure you want to reset to the default template? This will replace all your current data.')) {
            try {
                // Clear saved data
                this.defaultTemplateManager.clearSavedData();
                
                // Load fresh template
                await this.defaultTemplateManager.loadDefaultTemplate();
                
                // Refresh the form
                this.prefillForm();
                this.updatePreview();
                
                this.showSuccessMessage('Resume reset to default template!');
            } catch (error) {
                console.error('Error resetting to template:', error);
                this.showUrlError('Failed to reset to template: ' + error.message);
            }
        }
    }

    initializeDynamicSections() {
        // Experience
        document.getElementById('addExperience').addEventListener('click', () => this.addExperienceItem());
        this.updateExperienceListeners();

        // Education
        document.getElementById('addEducation').addEventListener('click', () => this.addEducationItem());
        this.updateEducationListeners();

        // Skills
        document.getElementById('addSkill').addEventListener('click', () => this.addSkillItem());
        this.updateSkillListeners();

        // Projects
        document.getElementById('addProject').addEventListener('click', () => this.addProjectItem());
        this.updateProjectListeners();

        // Certifications
        document.getElementById('addCertification').addEventListener('click', () => this.addCertificationItem());
        this.updateCertificationListeners();

        // Languages
        document.getElementById('addLanguage').addEventListener('click', () => this.addLanguageItem());
        this.updateLanguageListeners();

        // Hobbies
        document.getElementById('addHobby').addEventListener('click', () => this.addHobbyItem());
        this.updateHobbyListeners();
    }

    updatePersonalData() {
        this.resumeData.personal = {
            fullName: document.getElementById('fullName').value,
            title: document.getElementById('title').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value
        };
        this.updatePreview();
        this.autoSaveResume();
    }

    handleProfilePicture(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Crop to square
                    const size = Math.min(img.width, img.height);
                    canvas.width = 300;
                    canvas.height = 300;
                    
                    const offsetX = (img.width - size) / 2;
                    const offsetY = (img.height - size) / 2;
                    
                    ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 300, 300);
                    
                    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    this.resumeData.personal.profilePicture = croppedDataUrl;
                    
                    // Show preview
                    const preview = document.getElementById('profilePreview');
                    preview.innerHTML = `<img src="${croppedDataUrl}" alt="Profile">`;
                    
                    this.updatePreview();
                };
            };
            reader.readAsDataURL(file);
        }
    }

    updateSummary() {
        this.resumeData.summary = document.getElementById('summary').value;
        this.updatePreview();
        this.autoSaveResume();
    }

    addExperienceItem() {
        const container = document.getElementById('experienceContainer');
        const item = document.createElement('div');
        item.className = 'experience-item';
        item.innerHTML = `
            <div class="input-row">
                <input type="text" class="jobTitle" placeholder="Job Title">
                <input type="text" class="company" placeholder="Company">
            </div>
            <div class="input-row">
                <input type="text" class="startDate" placeholder="Start Date">
                <input type="text" class="endDate" placeholder="End Date">
            </div>
            <textarea class="jobDescription" placeholder="Job description and achievements..." rows="3"></textarea>
            <button type="button" class="remove-btn" onclick="removeExperience(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateExperienceListeners();
    }

    updateExperienceListeners() {
        const items = document.querySelectorAll('.experience-item');
        items.forEach(item => {
            const inputs = item.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.removeEventListener('input', this.updateExperienceData.bind(this));
                input.addEventListener('input', this.updateExperienceData.bind(this));
            });
        });
    }

    updateExperienceData() {
        const items = document.querySelectorAll('.experience-item');
        this.resumeData.experience = Array.from(items).map(item => ({
            jobTitle: item.querySelector('.jobTitle').value,
            company: item.querySelector('.company').value,
            startDate: item.querySelector('.startDate').value,
            endDate: item.querySelector('.endDate').value,
            description: item.querySelector('.jobDescription').value
        }));
        this.updatePreview();
    }

    addEducationItem() {
        const container = document.getElementById('educationContainer');
        const item = document.createElement('div');
        item.className = 'education-item';
        item.innerHTML = `
            <div class="input-row">
                <input type="text" class="degree" placeholder="Degree">
                <input type="text" class="school" placeholder="School/University">
            </div>
            <div class="input-row">
                <input type="text" class="gradYear" placeholder="Graduation Year">
                <input type="text" class="gpa" placeholder="GPA (optional)">
            </div>
            <button type="button" class="remove-btn" onclick="removeEducation(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateEducationListeners();
    }

    updateEducationListeners() {
        const items = document.querySelectorAll('.education-item');
        items.forEach(item => {
            const inputs = item.querySelectorAll('input');
            inputs.forEach(input => {
                input.removeEventListener('input', this.updateEducationData.bind(this));
                input.addEventListener('input', this.updateEducationData.bind(this));
            });
        });
    }

    updateEducationData() {
        const items = document.querySelectorAll('.education-item');
        this.resumeData.education = Array.from(items).map(item => ({
            degree: item.querySelector('.degree').value,
            school: item.querySelector('.school').value,
            gradYear: item.querySelector('.gradYear').value,
            gpa: item.querySelector('.gpa').value
        }));
        this.updatePreview();
    }

    addSkillItem() {
        const container = document.getElementById('skillsContainer');
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.innerHTML = `
            <input type="text" class="skillName" placeholder="Skill name">
            <select class="skillLevel">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
            </select>
            <button type="button" class="remove-btn" onclick="removeSkill(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateSkillListeners();
    }

    updateSkillListeners() {
        const items = document.querySelectorAll('.skill-item');
        items.forEach(item => {
            const inputs = item.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.removeEventListener('input', this.updateSkillData.bind(this));
                input.removeEventListener('change', this.updateSkillData.bind(this));
                input.addEventListener('input', this.updateSkillData.bind(this));
                input.addEventListener('change', this.updateSkillData.bind(this));
            });
        });
    }

    updateSkillData() {
        const items = document.querySelectorAll('.skill-item');
        this.resumeData.skills = Array.from(items).map(item => ({
            name: item.querySelector('.skillName').value,
            level: item.querySelector('.skillLevel').value
        }));
        this.updatePreview();
    }

    addProjectItem() {
        const container = document.getElementById('projectsContainer');
        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <input type="text" class="projectName" placeholder="Project Name">
            <textarea class="projectDescription" placeholder="Project description..." rows="2"></textarea>
            <input type="url" class="projectLink" placeholder="Project URL (optional)">
            <button type="button" class="remove-btn" onclick="removeProject(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateProjectListeners();
    }

    updateProjectListeners() {
        const items = document.querySelectorAll('.project-item');
        items.forEach(item => {
            const inputs = item.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.removeEventListener('input', this.updateProjectData.bind(this));
                input.addEventListener('input', this.updateProjectData.bind(this));
            });
        });
    }

    updateProjectData() {
        const items = document.querySelectorAll('.project-item');
        this.resumeData.projects = Array.from(items).map(item => ({
            name: item.querySelector('.projectName').value,
            description: item.querySelector('.projectDescription').value,
            link: item.querySelector('.projectLink').value
        }));
        this.updatePreview();
    }

    updateSocialLinks() {
        this.resumeData.social = {
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            portfolio: document.getElementById('portfolio').value
        };
        this.updatePreview();
    }

    addCertificationItem() {
        const container = document.getElementById('certificationsContainer');
        const item = document.createElement('div');
        item.className = 'certification-item';
        item.innerHTML = `
            <input type="text" class="certificationName" placeholder="Certification Name">
            <button type="button" class="remove-btn" onclick="removeCertification(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateCertificationListeners();
    }

    updateCertificationListeners() {
        const items = document.querySelectorAll('.certification-item');
        items.forEach(item => {
            const input = item.querySelector('input');
            input.removeEventListener('input', this.updateCertificationData.bind(this));
            input.addEventListener('input', this.updateCertificationData.bind(this));
        });
    }

    updateCertificationData() {
        const items = document.querySelectorAll('.certification-item');
        this.resumeData.certifications = Array.from(items).map(item => 
            item.querySelector('.certificationName').value
        ).filter(cert => cert.trim() !== '');
        this.updatePreview();
    }

    addLanguageItem() {
        const container = document.getElementById('languagesContainer');
        const item = document.createElement('div');
        item.className = 'language-item';
        item.innerHTML = `
            <input type="text" class="languageName" placeholder="Language & Proficiency">
            <button type="button" class="remove-btn" onclick="removeLanguage(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateLanguageListeners();
    }

    updateLanguageListeners() {
        const items = document.querySelectorAll('.language-item');
        items.forEach(item => {
            const input = item.querySelector('input');
            input.removeEventListener('input', this.updateLanguageData.bind(this));
            input.addEventListener('input', this.updateLanguageData.bind(this));
        });
    }

    updateLanguageData() {
        const items = document.querySelectorAll('.language-item');
        this.resumeData.languages = Array.from(items).map(item => 
            item.querySelector('.languageName').value
        ).filter(lang => lang.trim() !== '');
        this.updatePreview();
    }

    addHobbyItem() {
        const container = document.getElementById('hobbiesContainer');
        const item = document.createElement('div');
        item.className = 'hobby-item';
        item.innerHTML = `
            <input type="text" class="hobbyName" placeholder="Hobby or Interest">
            <button type="button" class="remove-btn" onclick="removeHobby(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
        this.updateHobbyListeners();
    }

    updateHobbyListeners() {
        const items = document.querySelectorAll('.hobby-item');
        items.forEach(item => {
            const input = item.querySelector('input');
            input.removeEventListener('input', this.updateHobbyData.bind(this));
            input.addEventListener('input', this.updateHobbyData.bind(this));
        });
    }

    updateHobbyData() {
        const items = document.querySelectorAll('.hobby-item');
        this.resumeData.hobbies = Array.from(items).map(item => 
            item.querySelector('.hobbyName').value
        ).filter(hobby => hobby.trim() !== '');
        this.updatePreview();
    }

    changeTemplate(template) {
        this.currentTemplate = template;
        this.updatePreview();
        this.autoSaveResume();
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (this.isDarkTheme) {
            body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
            themeToggle.classList.add('light');
        } else {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
            themeToggle.classList.remove('light');
        }
        
        this.updatePreview();
    }

    changePrimaryColor(color) {
        this.primaryColor = color;
        document.documentElement.style.setProperty('--primary-color', color);
        this.updatePreview();
        this.autoSaveResume();
    }

    changeFontFamily(font) {
        this.fontFamily = font;
        document.documentElement.style.setProperty('--resume-font', font);
        this.updatePreview();
    }

    updatePreview() {
        const preview = document.getElementById('resumePreview');
        const templateClass = `resume-${this.currentTemplate}`;
        
        let html = `<div class="${templateClass}" style="--primary-color: ${this.primaryColor}; --resume-font: ${this.fontFamily};">`;
        
        // Header
        html += this.generateHeader();
        
        // Summary
        if (this.resumeData.summary) {
            html += this.generateSummary();
        }
        
        // Experience
        if (this.resumeData.experience.length > 0) {
            html += this.generateExperience();
        }
        
        // Education
        if (this.resumeData.education.length > 0) {
            html += this.generateEducation();
        }
        
        // Skills
        if (this.resumeData.skills.length > 0) {
            html += this.generateSkills();
        }
        
        // Projects
        if (this.resumeData.projects.length > 0) {
            html += this.generateProjects();
        }

        // Certifications
        if (this.resumeData.certifications && this.resumeData.certifications.length > 0) {
            html += this.generateCertifications();
        }

        // Languages
        if (this.resumeData.languages && this.resumeData.languages.length > 0) {
            html += this.generateLanguages();
        }

        // Hobbies
        if (this.resumeData.hobbies && this.resumeData.hobbies.length > 0) {
            html += this.generateHobbies();
        }
        
        html += '</div>';
        preview.innerHTML = html;
    }

    generateHeader() {
        const { personal } = this.resumeData;
        const headerClass = this.currentTemplate === 'creative' ? 'resume-header creative' : 'resume-header';
        
        let html = `<div class="${headerClass}">`;
        
        if (personal.profilePicture) {
            html += `<img src="${personal.profilePicture}" alt="Profile" class="profile-image">`;
        }
        
        if (personal.fullName) {
            html += `<h1 class="resume-name">${personal.fullName}</h1>`;
        }
        
        if (personal.title) {
            html += `<p class="resume-title">${personal.title}</p>`;
        }
        
        // Contact info
        const contactItems = [];
        if (personal.email) contactItems.push(`<span class="contact-item"><i class="fas fa-envelope"></i> ${personal.email}</span>`);
        if (personal.phone) contactItems.push(`<span class="contact-item"><i class="fas fa-phone"></i> ${personal.phone}</span>`);
        if (personal.location) contactItems.push(`<span class="contact-item"><i class="fas fa-map-marker-alt"></i> ${personal.location}</span>`);
        
        // Social links
        if (this.resumeData.social.linkedin) contactItems.push(`<a href="${this.resumeData.social.linkedin}" class="contact-item social-link"><i class="fab fa-linkedin"></i> LinkedIn</a>`);
        if (this.resumeData.social.github) contactItems.push(`<a href="${this.resumeData.social.github}" class="contact-item social-link"><i class="fab fa-github"></i> GitHub</a>`);
        if (this.resumeData.social.portfolio) contactItems.push(`<a href="${this.resumeData.social.portfolio}" class="contact-item social-link"><i class="fas fa-globe"></i> Portfolio</a>`);
        
        if (contactItems.length > 0) {
            html += `<div class="contact-info">${contactItems.join('')}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    generateSummary() {
        return `
            <div class="resume-section">
                <h2 class="section-title">Professional Summary</h2>
                <p class="summary-text">${this.resumeData.summary}</p>
            </div>
        `;
    }

    generateExperience() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Work Experience</h2>
        `;
        
        this.resumeData.experience.forEach(exp => {
            if (exp.jobTitle || exp.company) {
                html += `
                    <div class="experience-item-preview">
                        <div class="job-header">
                            <div>
                                <div class="job-title">${exp.jobTitle}</div>
                                <div class="company-name">${exp.company}</div>
                            </div>
                            <div class="date-range">${exp.startDate} - ${exp.endDate}</div>
                        </div>
                        ${exp.description ? `<p class="job-description">${exp.description}</p>` : ''}
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    generateEducation() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Education</h2>
        `;
        
        this.resumeData.education.forEach(edu => {
            if (edu.degree || edu.school) {
                html += `
                    <div class="education-item-preview">
                        <div class="education-header">
                            <div>
                                <div class="degree-title">${edu.degree}</div>
                                <div class="school-name">${edu.school}</div>
                            </div>
                            <div class="date-range">${edu.gradYear}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    generateSkills() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Skills</h2>
                <div class="skills-grid">
        `;
        
        this.resumeData.skills.forEach(skill => {
            if (skill.name) {
                html += `
                    <div class="skill-item-preview">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}</span>
                    </div>
                `;
            }
        });
        
        html += '</div></div>';
        return html;
    }

    generateProjects() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Projects</h2>
        `;
        
        this.resumeData.projects.forEach(project => {
            if (project.name) {
                html += `
                    <div class="project-item-preview">
                        <div class="project-header">
                            <div class="project-name">${project.name}</div>
                            ${project.link ? `<a href="${project.link}" class="social-link">View Project</a>` : ''}
                        </div>
                        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    generateCertifications() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Certifications</h2>
                <ul class="certification-list">
        `;
        
        this.resumeData.certifications.forEach(cert => {
            if (cert.trim()) {
                html += `<li class="certification-item-preview">${cert}</li>`;
            }
        });
        
        html += '</ul></div>';
        return html;
    }

    generateLanguages() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Languages</h2>
                <div class="languages-grid">
        `;
        
        this.resumeData.languages.forEach(lang => {
            if (lang.trim()) {
                html += `<span class="language-item-preview">${lang}</span>`;
            }
        });
        
        html += '</div></div>';
        return html;
    }

    generateHobbies() {
        let html = `
            <div class="resume-section">
                <h2 class="section-title">Hobbies & Interests</h2>
                <div class="hobbies-grid">
        `;
        
        this.resumeData.hobbies.forEach(hobby => {
            if (hobby.trim()) {
                html += `<span class="hobby-item-preview">${hobby}</span>`;
            }
        });
        
        html += '</div></div>';
        return html;
    }

    async downloadPDF() {
        const element = document.getElementById('resumePreview');
        const downloadBtn = document.getElementById('downloadBtn');
        
        // Show loading state
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        downloadBtn.disabled = true;
        
        try {
            const opt = {
                margin: 0.5,
                filename: `${this.resumeData.personal.fullName || 'Resume'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'in', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            // Reset button state
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
            downloadBtn.disabled = false;
        }
    }

    saveResume() {
        const resumeData = {
            ...this.resumeData,
            settings: {
                template: this.currentTemplate,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                isDarkTheme: this.isDarkTheme
            }
        };

        const dataStr = JSON.stringify(resumeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resumeData.personal.fullName || 'Resume'}_Data.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success message
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
        }, 2000);
    }

    loadResume() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadResumeData(data);
                
                // Show success message
                const loadBtn = document.getElementById('loadBtn');
                const originalText = loadBtn.innerHTML;
                loadBtn.innerHTML = '<i class="fas fa-check"></i> Loaded!';
                setTimeout(() => {
                    loadBtn.innerHTML = originalText;
                }, 2000);
            } catch (error) {
                alert('Error loading resume file. Please check the file format.');
                console.error('Error loading resume:', error);
            }
        };
        reader.readAsText(file);
    }

    loadResumeData(shareData) {
        // Handle both old and new data formats for backward compatibility
        let resumeData, settings;
        
        if (shareData.resumeData && shareData.settings) {
            // New format from ShareManager
            resumeData = shareData.resumeData;
            settings = shareData.settings;
        } else if (shareData.settings && shareData.personal) {
            // Old format - treat entire object as resume data
            resumeData = shareData;
            settings = shareData.settings;
        } else {
            // Very old format or direct resume data
            resumeData = shareData;
            settings = shareData.settings || {};
        }
        
        // Load resume data
        this.resumeData = { ...resumeData };
        
        // Load settings if available
        if (settings) {
            this.currentTemplate = settings.template || 'minimal';
            this.primaryColor = settings.primaryColor || '#2563eb';
            this.fontFamily = settings.fontFamily || 'Inter';
            this.isDarkTheme = settings.isDarkTheme || false;
            
            // Update UI controls
            document.getElementById('templateSelect').value = this.currentTemplate;
            document.getElementById('primaryColor').value = this.primaryColor;
            document.getElementById('fontFamily').value = this.fontFamily;
            
            // Apply theme
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            if (this.isDarkTheme) {
                body.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
                themeToggle.classList.add('light');
            } else {
                body.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
                themeToggle.classList.remove('light');
            }
        }
        
        // Clear existing form
        this.clearForm();
        
        // Refill form with loaded data
        this.prefillForm();
        this.updatePreview();
    }

    clearForm() {
        // Clear all form inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            if (input.type !== 'file' && input.id !== 'templateSelect' && 
                input.id !== 'primaryColor' && input.id !== 'fontFamily') {
                input.value = '';
            }
        });

        // Remove dynamic items (keep first one)
        ['experience', 'education', 'skill', 'project', 'certification', 'language', 'hobby'].forEach(type => {
            const container = document.getElementById(`${type}sContainer`) || document.getElementById(`${type}Container`);
            if (container) {
                const items = container.querySelectorAll(`.${type}-item`);
                for (let i = items.length - 1; i > 0; i--) {
                    items[i].remove();
                }
            }
        });

        // Clear profile preview
        document.getElementById('profilePreview').innerHTML = '';
    }

    openShareModal() {
        document.getElementById('shareModal').style.display = 'flex';
        document.getElementById('shareResult').style.display = 'none';
    }

    shareAsFile() {
        this.saveResume();
        this.showShareResult('Resume file downloaded! You can now share this .json file via WhatsApp, email, or any messaging app. Your friend can load it using the "Load Resume" button.');
    }

    shareAsLink() {
        try {
            // Check browser compatibility first
            if (!this.shareManager.checkBrowserCompatibility()) {
                this.showShareResult('Your browser does not support URL sharing. Please use the file download option instead.');
                return;
            }

            const settings = {
                template: this.currentTemplate,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                isDarkTheme: this.isDarkTheme
            };

            // Check if data size is acceptable
            if (!this.shareManager.handleURLLimitations({ resumeData: this.resumeData, settings })) {
                this.showShareResult('Resume data is too large for URL sharing. Please use the file download option instead.');
                return;
            }

            const shareableLink = this.shareManager.generateShareURL(this.resumeData, settings);
            this.showShareResult(shareableLink);
        } catch (error) {
            console.error('Error creating shareable link:', error);
            this.showShareResult('Error creating shareable link: ' + error.message);
        }
    }

    shareViaWhatsApp() {
        const resumeData = {
            ...this.resumeData,
            settings: {
                template: this.currentTemplate,
                primaryColor: this.primaryColor,
                fontFamily: this.fontFamily,
                isDarkTheme: this.isDarkTheme
            }
        };

        const message = `Hi! I've created my resume using a Resume Builder. Here's the data you can use to view and edit it:\n\n${JSON.stringify(resumeData, null, 2)}\n\nJust copy this data and load it in the Resume Builder!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        this.closeShareModal();
    }

    showShareResult(text) {
        document.getElementById('shareText').value = text;
        document.getElementById('shareResult').style.display = 'block';
    }

    copyToClipboard() {
        const textarea = document.getElementById('shareText');
        textarea.select();
        document.execCommand('copy');
        
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    closeShareModal() {
        document.getElementById('shareModal').style.display = 'none';
    }

    /**
     * Exports the complete resume data as a JSON file
     */
    exportResume() {
        try {
            const exportData = {
                resumeData: this.resumeData,
                settings: {
                    template: this.currentTemplate,
                    primaryColor: this.primaryColor,
                    fontFamily: this.fontFamily,
                    isDarkTheme: this.isDarkTheme
                },
                metadata: {
                    exportedAt: new Date().toISOString(),
                    version: "1.0",
                    appName: "Resume Builder"
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.resumeData.personal.fullName || 'Resume'}_Export.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Save to localStorage as well
            this.saveToLocalStorage(exportData);

            // Show success message
            const exportBtn = document.getElementById('exportBtn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-check"></i> Exported!';
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
            }, 2000);

            this.showSuccessMessage('Resume exported successfully! File downloaded and saved locally.');
        } catch (error) {
            console.error('Error exporting resume:', error);
            this.showUrlError('Failed to export resume: ' + error.message);
        }
    }

    /**
     * Triggers the import file dialog
     */
    importResume() {
        document.getElementById('importInput').click();
    }

    /**
     * Handles the imported file and loads the resume data
     */
    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data
                if (!this.validateImportData(importData)) {
                    throw new Error('Invalid resume file format');
                }

                // Load the imported data
                this.loadImportedData(importData);
                
                // Show success message
                const importBtn = document.getElementById('importBtn');
                const originalText = importBtn.innerHTML;
                importBtn.innerHTML = '<i class="fas fa-check"></i> Imported!';
                setTimeout(() => {
                    importBtn.innerHTML = originalText;
                }, 2000);

                this.showSuccessMessage('Resume imported successfully! You can now edit all fields.');
            } catch (error) {
                console.error('Error importing resume:', error);
                this.showUrlError('Error importing resume file: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Clear the input so the same file can be imported again
        event.target.value = '';
    }

    /**
     * Validates the structure of imported resume data
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check for required structure
        if (!data.resumeData) {
            return false;
        }

        const resumeData = data.resumeData;
        
        // Validate basic structure
        const requiredSections = ['personal', 'experience', 'education', 'skills', 'projects', 'social'];
        for (const section of requiredSections) {
            if (!(section in resumeData)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Loads imported resume data and applies settings
     */
    loadImportedData(importData) {
        // Exit view mode if active
        if (this.viewModeController.isInViewMode()) {
            this.viewModeController.exitViewMode();
        }

        // Load the resume data
        this.resumeData = { ...importData.resumeData };
        
        // Apply settings if available
        if (importData.settings) {
            this.currentTemplate = importData.settings.template || 'minimal';
            this.primaryColor = importData.settings.primaryColor || '#2563eb';
            this.fontFamily = importData.settings.fontFamily || 'Inter';
            this.isDarkTheme = importData.settings.isDarkTheme || false;
            
            // Update UI controls
            document.getElementById('templateSelect').value = this.currentTemplate;
            document.getElementById('primaryColor').value = this.primaryColor;
            document.getElementById('fontFamily').value = this.fontFamily;
            
            // Apply theme
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            if (this.isDarkTheme) {
                body.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
                themeToggle.classList.add('light');
            } else {
                body.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
                themeToggle.classList.remove('light');
            }
        }
        
        // Clear existing form and refill with imported data
        this.clearForm();
        this.prefillForm();
        this.updatePreview();

        // Save to localStorage
        this.saveToLocalStorage(importData);
    }

    /**
     * Saves resume data to localStorage for offline access
     */
    saveToLocalStorage(data) {
        try {
            localStorage.setItem('resumeBuilder_data', JSON.stringify(data));
            localStorage.setItem('resumeBuilder_lastSaved', new Date().toISOString());
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    /**
     * Loads resume data from localStorage if available
     */
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('resumeBuilder_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                if (this.validateImportData(data)) {
                    return data;
                }
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
        return null;
    }

    /**
     * Checks if there's saved data in localStorage
     */
    hasSavedData() {
        try {
            const savedData = localStorage.getItem('resumeBuilder_data');
            return savedData !== null;
        } catch (error) {
            return false;
        }
    }

    // Check for shared data in URL on load
    loadFromURL() {
        const currentUrl = window.location.href;
        
        // Check if URL contains share data
        if (!currentUrl.includes('?data=')) {
            return;
        }

        try {
            const shareData = this.shareManager.parseShareURL(currentUrl);
            
            if (!shareData) {
                this.showUrlError('Invalid or corrupted share URL. Loading empty resume.');
                this.cleanURL();
                return;
            }

            this.loadResumeData(shareData);
            
            // Enter view mode for shared resumes
            this.viewModeController.enterViewMode(shareData.resumeData);
            
            // Don't clean URL immediately - keep it for sharing context
            // this.cleanURL();
            
            // Show success message
            this.showSuccessMessage('Resume loaded from shared link!');
        } catch (error) {
            console.error('Error loading shared data:', error);
            this.showUrlError('Error loading shared resume. Please check the link.');
            this.cleanURL();
        }
    }

    /**
     * Displays error message for URL loading issues
     */
    showUrlError(message) {
        // Create a temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'url-error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Shows success message for successful operations
     */
    showSuccessMessage(message) {
        // Create a temporary success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    }

    /**
     * Cleans the URL by removing share parameters
     */
    cleanURL() {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Global functions for remove buttons
function removeExperience(button) {
    button.parentElement.remove();
    resumeBuilder.updateExperienceData();
}

function removeEducation(button) {
    button.parentElement.remove();
    resumeBuilder.updateEducationData();
}

function removeSkill(button) {
    button.parentElement.remove();
    resumeBuilder.updateSkillData();
}

function removeProject(button) {
    button.parentElement.remove();
    resumeBuilder.updateProjectData();
}

function removeCertification(button) {
    button.parentElement.remove();
    resumeBuilder.updateCertificationData();
}

function removeLanguage(button) {
    button.parentElement.remove();
    resumeBuilder.updateLanguageData();
}

function removeHobby(button) {
    button.parentElement.remove();
    resumeBuilder.updateHobbyData();
}

// Initialize the app
let resumeBuilder;
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder = new ResumeBuilder();
    resumeBuilder.loadFromURL(); // Check for shared data
    
    // Check for saved data in localStorage
    if (resumeBuilder.hasSavedData() && !window.location.search.includes('data=')) {
        const savedData = resumeBuilder.loadFromLocalStorage();
        if (savedData) {
            // Show option to restore saved data
            const restoreDiv = document.createElement('div');
            restoreDiv.className = 'restore-notification';
            restoreDiv.innerHTML = `
                <div class="restore-content">
                    <i class="fas fa-history"></i>
                    <span>Found previously saved resume data. Would you like to restore it?</span>
                    <div class="restore-buttons">
                        <button onclick="resumeBuilder.loadImportedData(resumeBuilder.loadFromLocalStorage()); this.parentElement.parentElement.parentElement.remove();" class="restore-btn">
                            <i class="fas fa-check"></i> Restore
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove();" class="dismiss-btn">
                            <i class="fas fa-times"></i> Dismiss
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(restoreDiv);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (restoreDiv.parentElement) {
                    restoreDiv.remove();
                }
            }, 10000);
        }
    }
});

// Global function for closing share modal
function closeShareModal() {
    resumeBuilder.closeShareModal();
}