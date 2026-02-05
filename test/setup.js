// Test setup file
import { vi } from 'vitest';

// Mock browser APIs that are used in the application
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

// Mock URL constructor
global.URL = class URL {
  constructor(url) {
    this.href = url;
    this.searchParams = new URLSearchParams(url.split('?')[1] || '');
  }
};

// Mock URLSearchParams
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
  
  set(key, value) {
    this.params.set(key, value);
  }
};

// Mock window.location
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000',
      pathname: '/resume-builder',
      href: 'http://localhost:3000/resume-builder'
    },
    history: {
      replaceState: vi.fn()
    }
  },
  writable: true
});

// Mock document methods
global.document = {
  createElement: vi.fn(() => ({
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    },
    appendChild: vi.fn(),
    remove: vi.fn(),
    querySelector: vi.fn(),
    addEventListener: vi.fn()
  })),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  body: {
    appendChild: vi.fn(),
    setAttribute: vi.fn()
  },
  title: 'Resume Builder'
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};