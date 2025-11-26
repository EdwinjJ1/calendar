import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock nanoid to avoid ESM issues
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-' + Math.random().toString(36).substr(2, 9),
}));

// Mock framer-motion to avoid ESM issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock Request and Response for Next.js API routes
class MockRequest {
  private body: any;
  constructor(url: string, init?: RequestInit) {
    this.body = init?.body;
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
}

class MockResponse {
  static json(body: any, init?: ResponseInit) {
    return {
      status: init?.status || 200,
      json: async () => body,
    };
  }
}

global.Request = MockRequest as any;
global.Response = MockResponse as any;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Mock console.error to keep test output clean (optional)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Export for use in tests
export { localStorageMock };

// ===== SERVICES LAYER MOCKS =====

// Store original environment variables
const originalEnv = process.env;

// Mock environment variables for services
beforeAll(() => {
  process.env = {
    ...originalEnv,
    AI_API_KEY: 'test-ai-key',
    DATABASE_URL: 'postgresql://test',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    // Calendar models
    calendarEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    eventAttendee: {
      createMany: jest.fn(),
    },

    // Board models
    board: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    column: {
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    label: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    taskLabel: {
      createMany: jest.fn(),
      delete: jest.fn(),
    },

    // Team models
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    team: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teamMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    channel: {
      create: jest.fn(),
      findMany: jest.fn(),
    },

    // AI models
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    aIProcessingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },

    // Transactions
    $transaction: jest.fn((operations) => {
      // If operations is a function, execute it with mock prisma
      if (typeof operations === 'function') {
        return operations(prisma);
      }
      // If operations is an array, return mock results for each operation
      if (Array.isArray(operations)) {
        return Promise.resolve(operations.map(() => ({})));
      }
      // Default case
      return Promise.resolve({});
    }),

    // Raw query support
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  }
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            events: [],
            tasks: [],
          }))
        }
      })
    })
  }))
}));

// Import prisma for use in tests
const { prisma } = require('@/lib/prisma');

