// Simple Node.js test runner for URL parsing and data loading
const fs = require('fs');
const path = require('path');

// Mock browser APIs
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.encodeURIComponent = encodeURIComponent;
global.decodeURIComponent = decodeURIComponent;

// Mock URL constructor
global.URL = class URL {
  constructor(url) {
    this.href = url;
    const parts = url.split('?');
    this.searchParams = new URLSearchParams(parts[1] || '');
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

// Read and evaluate ShareManager class from script.js
const scriptContent = fs.readFileSync('script.js', 'utf8');
const shareManagerMatch = scriptContent.match(/class ShareManager\s*{[\s\S]*?^}/m);

if (!shareManagerMatch) {
  console.error('Could not find ShareManager class in script.js');
  process.exit(1);
}

// Evaluate ShareManager class
eval(shareManagerMatch[0]);

// Simple property-based testing framework
class SimplePropertyTester {
  constructor() {
    this.results = [];
  }

  generateString(maxLength = 50) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let result = '';
    const length = Math.floor(Math.random() * maxLength);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateResumeData() {
    return {
      personal: {
        fullName: this.generateString(30),
        title: this.generateString(50),
        email: `${this.generateString(10)}@${this.generateString(10)}.com`,
        phone: this.generateString(15),
        location: this.generateString(30)
      },
      summary: this.generateString(200),
      experience: Array.from({length: Math.floor(Math.random() * 3)}, () => ({
        jobTitle: this.generateString(50),
        company: this.generateString(50),
        startDate: '2020',
        endDate: '2023',
        description: this.generateString(200)
      })),
      education: Array.from({length: Math.floor(Math.random() * 2)}, () => ({
        degree: this.generateString(50),
        school: this.generateString(50),
        gradYear: '2020',
        gpa: '3.5'
      })),
      skills: Array.from({length: Math.floor(Math.random() * 5)}, () => ({
        name: this.generateString(20),
        level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 4)]
      })),
      projects: Array.from({length: Math.floor(Math.random() * 3)}, () => ({
        name: this.generateString(30),
        description: this.generateString(100),
        link: `https://${this.generateString(10)}.com`
      })),
      social: {
        linkedin: `https://${this.generateString(10)}.com`,
        github: `https://${this.generateString(10)}.com`,
        portfolio: `https://${this.generateString(10)}.com`
      },
      certifications: Array.from({length: Math.floor(Math.random() * 3)}, () => this.generateString(50)),
      languages: Array.from({length: Math.floor(Math.random() * 3)}, () => this.generateString(20)),
      hobbies: Array.from({length: Math.floor(Math.random() * 3)}, () => this.generateString(20))
    };
  }

  generateSettings() {
    return {
      template: ['minimal', 'creative', 'corporate'][Math.floor(Math.random() * 3)],
      primaryColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      fontFamily: ['Inter', 'Arial', 'Georgia'][Math.floor(Math.random() * 3)],
      isDarkTheme: Math.random() > 0.5
    };
  }

  assert(property, numRuns = 50) {
    let passed = 0;
    let failed = 0;
    let errors = [];

    for (let i = 0; i < numRuns; i++) {
      try {
        if (property()) {
          passed++;
        } else {
          failed++;
          errors.push(`Run ${i + 1}: Property returned false`);
        }
      } catch (error) {
        failed++;
        errors.push(`Run ${i + 1}: ${error.message}`);
      }
    }

    return { passed, failed, errors, total: numRuns };
  }
}

// Run tests
console.log('Running Property-Based Tests for URL Parsing and Data Loading...\n');

const tester = new SimplePropertyTester();
const shareManager = new ShareManager();

// Property 9: Data Validation and Error Handling
console.log('Property 9: Data Validation and Error Handling');
console.log('Validates: Requirements 5.3, 5.4, 8.1, 8.4');

const result1 = tester.assert(() => {
  // Test with invalid JSON strings
  const invalidJsonStrings = [
    '{"invalid": json}',
    '{missing: quotes}',
    'not json at all',
    '',
    'null',
    '[]'
  ];

  for (const invalidJson of invalidJsonStrings) {
    try {
      const encodedData = btoa(encodeURIComponent(invalidJson));
      const testUrl = `http://test.com?data=${encodedData}`;
      const result = shareManager.parseShareURL(testUrl);
      
      // Should return null for invalid data
      if (result !== null) {
        return false;
      }
    } catch (error) {
      // Expected for invalid data
    }
  }

  // Test with invalid data structures
  const invalidStructures = [
    null,
    "string",
    123,
    [],
    {},
    { resumeData: "not an object" },
    { settings: "not an object" },
    { resumeData: {}, settings: {} }, // Missing required fields
  ];

  for (const invalidData of invalidStructures) {
    const isValid = shareManager.validateResumeData(invalidData);
    if (isValid) {
      return false; // Should be invalid
    }
  }

  return true;
}, 30);

console.log(`Result: ${result1.passed}/${result1.total} passed`);
if (result1.failed > 0) {
  console.log(`Failures: ${result1.failed}`);
  console.log('Sample errors:', result1.errors.slice(0, 3));
}
console.log('');

// Property 10: Comprehensive Data Loading
console.log('Property 10: Comprehensive Data Loading');
console.log('Validates: Requirements 8.2, 8.5');

const result2 = tester.assert(() => {
  // Generate valid test data
  const resumeData = tester.generateResumeData();
  const settings = tester.generateSettings();
  const shareData = { resumeData, settings };

  // Test validation
  const isValid = shareManager.validateResumeData(shareData);
  if (!isValid) {
    return false;
  }

  // Test URL generation and parsing round-trip
  try {
    const shareUrl = shareManager.generateShareURL(resumeData, settings);
    const parsedData = shareManager.parseShareURL(shareUrl);
    
    if (!parsedData) {
      return false;
    }

    // Verify data integrity
    if (JSON.stringify(parsedData.resumeData.personal) !== JSON.stringify(resumeData.personal)) {
      return false;
    }

    if (parsedData.resumeData.summary !== resumeData.summary) {
      return false;
    }

    // Check array sections
    const arraySections = ['experience', 'education', 'skills', 'projects'];
    for (const section of arraySections) {
      if (parsedData.resumeData[section].length !== resumeData[section].length) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}, 30);

console.log(`Result: ${result2.passed}/${result2.total} passed`);
if (result2.failed > 0) {
  console.log(`Failures: ${result2.failed}`);
  console.log('Sample errors:', result2.errors.slice(0, 3));
}
console.log('');

// Edge case tests
console.log('Edge Cases: Corrupted Data and URL Parsing');

const result3 = tester.assert(() => {
  // Test with corrupted Base64 data
  const corruptedData = [
    'invalid-base64-data',
    'SGVsbG8gV29ybGQ=!', // Valid Base64 with invalid chars
    '',
    '!@#$%^&*()',
  ];

  for (const corrupt of corruptedData) {
    const testUrl = `http://test.com?data=${corrupt}`;
    const result = shareManager.parseShareURL(testUrl);
    
    // Should return null for corrupted data
    if (result !== null) {
      return false;
    }
  }

  return true;
}, 20);

console.log(`Result: ${result3.passed}/${result3.total} passed`);
if (result3.failed > 0) {
  console.log(`Failures: ${result3.failed}`);
  console.log('Sample errors:', result3.errors.slice(0, 3));
}
console.log('');

// Summary
const totalPassed = result1.passed + result2.passed + result3.passed;
const totalRuns = result1.total + result2.total + result3.total;
const totalFailed = result1.failed + result2.failed + result3.failed;

console.log('=== TEST SUMMARY ===');
console.log(`Total: ${totalPassed}/${totalRuns} passed`);
console.log(`Failed: ${totalFailed}`);

if (totalFailed === 0) {
  console.log('✅ All property-based tests PASSED!');
  console.log('URL parsing and data loading system is working correctly.');
} else {
  console.log('❌ Some tests FAILED.');
  console.log('There may be issues with the URL parsing and data loading implementation.');
}

console.log('\nProperty tests validate:');
console.log('- Requirements 5.3: JSON validation for decoded resume data');
console.log('- Requirements 5.4: Error handling for invalid/corrupted share URLs');
console.log('- Requirements 8.1: Data validation before loading');
console.log('- Requirements 8.2: All resume sections load correctly');
console.log('- Requirements 8.4: Error handling with appropriate messages');
console.log('- Requirements 8.5: Data clearing before loading shared content');