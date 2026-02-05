// Standalone test runner for duplication integrity property test
// This runs without external dependencies

// Mock browser APIs
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

global.window = {
    location: {
        origin: 'http://localhost:3000',
        pathname: '/resume-builder',
        href: 'http://localhost:3000/resume-builder'
    },
    history: {
        replaceState: () => {}
    }
};

global.document = {
    createElement: () => ({
        style: {},
        classList: { add: () => {}, remove: () => {} },
        appendChild: () => {},
        remove: () => {},
        querySelector: () => null,
        addEventListener: () => {}
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
        appendChild: () => {},
        setAttribute: () => {}
    },
    title: 'Resume Builder',
    getElementById: () => ({ remove: () => {} }),
    addEventListener: () => {}
};

global.URL = class URL {
    constructor(url) {
        this.href = url;
        this.searchParams = new URLSearchParams(url.split('?')[1] || '');
    }
};

global.URLSearchParams = class URLSearchParams {
    constructor(search = '') {
        this.params = new Map();
        if (search) {
            search.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                    this.params.set(decodeURIComponent(key), decodeURIComponent(value));
                }
            });
        }
    }
    
    get(key) {
        return this.params.get(key);
    }
};

// Load and execute the main script classes
const fs = require('fs');
const path = require('path');

const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Extract and evaluate the classes
const shareManagerMatch = scriptContent.match(/class ShareManager\s*{[\s\S]*?^}/m);
const viewModeControllerMatch = scriptContent.match(/class ViewModeController\s*{[\s\S]*?^}/m);
const duplicateManagerMatch = scriptContent.match(/class DuplicateManager\s*{[\s\S]*?^}/m);
const resumeBuilderMatch = scriptContent.match(/class ResumeBuilder\s*{[\s\S]*?^}/m);

// Create evaluation context
const evalContext = `
    const console = global.console;
    const window = global.window;
    const document = global.document;
    const btoa = global.btoa;
    const atob = global.atob;
    const URL = global.URL;
    const URLSearchParams = global.URLSearchParams;
    const setTimeout = global.setTimeout;
    
    ${shareManagerMatch ? shareManagerMatch[0] : ''}
    ${viewModeControllerMatch ? viewModeControllerMatch[0] : ''}
    ${duplicateManagerMatch ? duplicateManagerMatch[0] : ''}
    ${resumeBuilderMatch ? resumeBuilderMatch[0] : ''}
`;

eval(evalContext);

// Property test implementation
class PropertyTestRunner {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    log(message, type = 'info') {
        const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : 'ℹ️';
        console.log(`${prefix} ${message.replace(/<[^>]*>/g, '')}`);
        
        if (type === 'pass') this.passCount++;
        if (type === 'fail') this.failCount++;
        this.testCount++;
    }

    generateString(maxLength = 50) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
        const length = Math.floor(Math.random() * maxLength);
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    generateEmail() {
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'example.com'];
        const username = this.generateString(10).replace(/\s/g, '').toLowerCase();
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${username}@${domain}`;
    }

    generateArray(generator, maxLength = 5) {
        const length = Math.floor(Math.random() * maxLength);
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(generator());
        }
        return result;
    }

    generateResumeData() {
        return {
            personal: {
                fullName: this.generateString(50),
                title: this.generateString(100),
                email: this.generateEmail(),
                phone: this.generateString(20),
                location: this.generateString(100)
            },
            summary: this.generateString(1000),
            experience: this.generateArray(() => ({
                jobTitle: this.generateString(100),
                company: this.generateString(100),
                startDate: this.generateString(20),
                endDate: this.generateString(20),
                description: this.generateString(500)
            }), 5),
            education: this.generateArray(() => ({
                degree: this.generateString(100),
                school: this.generateString(100),
                gradYear: this.generateString(20),
                gpa: this.generateString(10)
            }), 3),
            skills: this.generateArray(() => ({
                name: this.generateString(50),
                level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
            }), 20),
            projects: this.generateArray(() => ({
                name: this.generateString(100),
                description: this.generateString(500),
                link: `https://example${Math.floor(Math.random() * 1000)}.com`
            }), 5),
            social: {
                linkedin: `https://linkedin.com/in/${this.generateString(20).replace(/\s/g, '')}`,
                github: `https://github.com/${this.generateString(20).replace(/\s/g, '')}`,
                portfolio: `https://${this.generateString(20).replace(/\s/g, '')}.com`
            },
            certifications: this.generateArray(() => this.generateString(100), 10),
            languages: this.generateArray(() => this.generateString(50), 10),
            hobbies: this.generateArray(() => this.generateString(50), 10)
        };
    }

    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;
        
        if (typeof obj1 !== 'object') return obj1 === obj2;
        
        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) return false;
        
        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!this.deepEqual(obj1[key], obj2[key])) return false;
        }
        
        return true;
    }

    runDuplicationIntegrityTest() {
        console.log('\n🧪 Property-Based Test: Resume Duplication Integrity');
        console.log('📋 Property 6: Resume Duplication Integrity');
        console.log('✅ Validates: Requirements 3.1, 3.2, 3.3');
        console.log('📝 Property: For any resume data, duplication should create an identical copy with all data preserved and complete independence from the original.\n');
        
        const numRuns = 100;
        let successCount = 0;
        let failures = [];

        for (let i = 0; i < numRuns; i++) {
            try {
                const resumeData = this.generateResumeData();
                
                // Create a resume builder instance
                const resumeBuilder = new ResumeBuilder();
                resumeBuilder.resumeData = resumeData;

                // Mock methods that might not work in test environment
                resumeBuilder.showSuccessMessage = () => {};
                resumeBuilder.showUrlError = () => {};
                resumeBuilder.loadResumeData = () => {};
                resumeBuilder.cleanURL = () => {};
                resumeBuilder.viewModeController.exitViewMode = () => {};

                const duplicateManager = resumeBuilder.duplicateManager;
                
                // Test the deep clone method
                const originalData = JSON.parse(JSON.stringify(resumeData));
                const clonedData = duplicateManager.deepCloneResumeData(originalData);

                // Property checks
                const checks = [
                    {
                        name: 'Structural Equality',
                        test: () => this.deepEqual(clonedData, originalData),
                        error: 'Cloned data is not structurally identical to original'
                    },
                    {
                        name: 'Reference Independence',
                        test: () => clonedData !== originalData,
                        error: 'Cloned data has the same object reference as original'
                    },
                    {
                        name: 'Required Sections Exist',
                        test: () => {
                            const requiredSections = ['personal', 'experience', 'education', 'skills', 'projects', 'social'];
                            return requiredSections.every(section => 
                                clonedData.hasOwnProperty(section) && 
                                this.deepEqual(clonedData[section], originalData[section])
                            );
                        },
                        error: 'Required sections missing or not properly cloned'
                    },
                    {
                        name: 'Array Length Preservation',
                        test: () => {
                            const arraySections = ['experience', 'education', 'skills', 'projects'];
                            return arraySections.every(section => {
                                if (Array.isArray(originalData[section])) {
                                    return Array.isArray(clonedData[section]) && 
                                           clonedData[section].length === originalData[section].length;
                                }
                                return true;
                            });
                        },
                        error: 'Array sections do not have matching lengths'
                    },
                    {
                        name: 'Copy Integrity Validation',
                        test: () => duplicateManager.validateCopyIntegrity(clonedData, originalData),
                        error: 'Built-in copy integrity validation failed'
                    },
                    {
                        name: 'Modification Independence',
                        test: () => {
                            const originalName = originalData.personal.fullName;
                            clonedData.personal.fullName = 'Modified Name';
                            const result = originalData.personal.fullName === originalName;
                            // Restore for other tests
                            clonedData.personal.fullName = originalName;
                            return result;
                        },
                        error: 'Modifying clone affects original data'
                    }
                ];

                let allChecksPassed = true;
                for (const check of checks) {
                    if (!check.test()) {
                        failures.push({
                            run: i + 1,
                            check: check.name,
                            error: check.error
                        });
                        allChecksPassed = false;
                        break;
                    }
                }

                if (allChecksPassed) {
                    successCount++;
                }

            } catch (error) {
                failures.push({
                    run: i + 1,
                    check: 'Exception',
                    error: error.message
                });
            }
        }

        // Report results
        console.log(`\n📊 Test Results:`);
        if (failures.length === 0) {
            this.log(`All ${numRuns} property tests passed! Resume duplication maintains perfect integrity.`, 'pass');
        } else {
            this.log(`${failures.length} out of ${numRuns} tests failed.`, 'fail');
            
            // Show first few failures
            const maxFailuresToShow = 3;
            for (let i = 0; i < Math.min(failures.length, maxFailuresToShow); i++) {
                const failure = failures[i];
                this.log(`Failure ${i + 1}: Run ${failure.run}, Check: ${failure.check} - ${failure.error}`, 'fail');
            }
            
            if (failures.length > maxFailuresToShow) {
                this.log(`... and ${failures.length - maxFailuresToShow} more failures`, 'fail');
            }
        }

        const successRate = ((successCount/numRuns)*100).toFixed(1);
        console.log(`\n📈 Summary: ${successCount}/${numRuns} tests passed (${successRate}%)`);

        return {
            passed: failures.length === 0,
            successCount,
            totalRuns: numRuns,
            failures,
            successRate: parseFloat(successRate)
        };
    }
}

// Run the test
const testRunner = new PropertyTestRunner();
const result = testRunner.runDuplicationIntegrityTest();

// Exit with appropriate code
process.exit(result.passed ? 0 : 1);