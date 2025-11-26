/**
 * AI Schedule API 单元测试
 * 测试 /api/ai-schedule 端点的各种场景
 */

import type { NextRequest } from 'next/server';
import { mockAISuccessResponse, mockAIErrorResponses, mockUserInputs } from '../helpers/mockData';

// Mock next/server before importing the route
jest.mock('next/server', () => ({
  NextRequest: class {
    private body: any;
    constructor(url: string, init?: any) {
      this.body = init?.body;
    }
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  },
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

// Import mocked module
import { GoogleGenerativeAI } from '@google/generative-ai';
const mockGoogleAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

// Import after mocks are set up
import { POST } from '@/app/api/ai-schedule/route';

// Helper to create mock request
function createMockRequest(body: object): any {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('AI Schedule API - /api/ai-schedule', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('API Key 验证', () => {
    it('应该在缺少API密钥时返回500错误', async () => {
      delete process.env.AI_API_KEY;

      const req = createMockRequest({ text: 'Meeting tomorrow' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('AI_API_KEY is not defined in environment variables');
    });

    it('应该在API密钥为空字符串时返回500错误', async () => {
      process.env.AI_API_KEY = '';

      const req = createMockRequest({ text: 'Meeting tomorrow' });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('AI_API_KEY is not defined in environment variables');
    });
  });

  describe('输入验证', () => {
    beforeEach(() => {
      process.env.AI_API_KEY = 'test-api-key';
    });

    it('应该在没有提供文本时返回400错误', async () => {
      const req = createMockRequest({ currentDate: new Date().toISOString() });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No text provided');
    });

    it('应该在文本为空字符串时返回400错误', async () => {
      const req = createMockRequest({ text: '', currentDate: new Date().toISOString() });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No text provided');
    });

    it('应该在文本为null时返回400错误', async () => {
      const req = createMockRequest({ text: null, currentDate: new Date().toISOString() });
      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No text provided');
    });
  });

  describe('成功的API调用', () => {
    beforeEach(() => {
      process.env.AI_API_KEY = 'test-api-key';
    });

    it('应该成功解析标准输入并返回事件', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockAISuccessResponse.events),
          },
        }),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toEqual(mockAISuccessResponse.events);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1);
    });

    it('应该正确清理markdown格式的响应', async () => {
      const markdownResponse = '```json\n' + JSON.stringify(mockAISuccessResponse.events) + '\n```';
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => markdownResponse,
          },
        }),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standardEnglish,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toEqual(mockAISuccessResponse.events);
    });

    it('应该在没有提供currentDate时使用当前日期', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockAISuccessResponse.events),
          },
        }),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.events).toBeDefined();
    });
  });

  describe('API调用失败场景', () => {
    beforeEach(() => {
      process.env.AI_API_KEY = 'test-api-key';
    });

    it('应该在AI返回无效JSON时返回500错误', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => 'This is not valid JSON',
          },
        }),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to parse AI response');
      expect(data.raw).toBe('This is not valid JSON');
    });

    it('应该在网络错误时返回500错误', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Network request failed')),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Network request failed');
    });

    it('应该在API超时时返回500错误', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Request timeout')),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Request timeout');
    });

    it('应该在未知错误时返回Internal Server Error', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue({ notAnError: true }),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
    });

    it('应该在API密钥无效时处理错误', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('API key invalid')),
      };
      mockGoogleAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }) as any);

      const req = createMockRequest({
        text: mockUserInputs.standard,
        currentDate: '2024-01-15T10:00:00.000Z',
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('API key invalid');
    });

    it('应该在请求体解析失败时返回错误', async () => {
      const req = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON in request body')),
      } as unknown as NextRequest;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Invalid JSON in request body');
    });
  });
});
