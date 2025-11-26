/**
 * AIImport 组件副作用测试
 * 测试文件上传、API调用、状态管理等副作用
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIImport from '@/components/calendar/AIImport';
import type { CalendarEvent } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock alert
global.alert = jest.fn();

describe('AIImport - 副作用测试', () => {
  const mockOnImport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (global.alert as jest.Mock).mockClear();
  });

  describe('文件上传副作用', () => {
    it('应该通过FileReader读取文件内容', async () => {
      render(<AIImport onImport={mockOnImport} />);

      // 打开对话框
      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      // 创建测试文件
      const fileContent = '# 测试会议\n10:00-11:00 项目讨论';
      const file = new File([fileContent], 'schedule.md', { type: 'text/markdown' });

      // 查找文件输入框
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // 模拟FileReader
      const mockFileReader = {
        readAsText: jest.fn(),
        onload: null as any,
        result: fileContent,
      };

      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      // 上传文件
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);

      // 触发FileReader的onload
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: fileContent } } as any);
      }

      // 验证FileReader被调用
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
    });

    it('应该将文件内容设置到textarea', async () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const fileContent = '测试内容';
      const file = new File([fileContent], 'test.md', { type: 'text/markdown' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // 创建真实的FileReader行为
      const mockFileReader = {
        readAsText: jest.fn(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: fileContent } });
            }
          }, 0);
        }),
        onload: null as any,
      };

      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });
      fireEvent.change(fileInput);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
        expect(textarea).toHaveValue(fileContent);
      });
    });
  });

  describe('API调用副作用', () => {
    it('应该调用API并传递正确的参数', async () => {
      const mockResponse = {
        events: [
          {
            title: '测试事件',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '明天10点开会' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/ai-schedule',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('明天10点开会'),
          })
        );
      });
    });

    it('应该在加载时显示loading状态', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      // 验证loading状态
      expect(screen.getByText(/Parsing with AI/i)).toBeInTheDocument();
    });

    it('应该在API错误时显示alert', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'API Error' }),
      });

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Failed to parse schedule')
        );
      });
    });

    it('应该在网络错误时显示alert', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });
    });
  });

  describe('状态管理副作用', () => {
    it('应该在成功解析后显示预览事件', async () => {
      const mockResponse = {
        events: [
          {
            title: '测试事件',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/Found 1 Events/i)).toBeInTheDocument();
        expect(screen.getByText('测试事件')).toBeInTheDocument();
      });
    });

    it('应该调用onImport回调并清空状态', async () => {
      const mockResponse = {
        events: [
          {
            title: '测试事件',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/Found 1 Events/i)).toBeInTheDocument();
      });

      const importButton = screen.getByText(/Import All/i);
      fireEvent.click(importButton);

      // 验证onImport被调用
      expect(mockOnImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: '测试事件',
            id: expect.any(String),
          }),
        ])
      );
    });

    it('应该在点击Clear时清空预览事件', async () => {
      const mockResponse = {
        events: [
          {
            title: '测试事件',
            start: '2024-01-15T10:00:00.000Z',
            end: '2024-01-15T11:00:00.000Z',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '测试' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      await waitFor(() => {
        expect(screen.getByText(/Found 1 Events/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/Clear/i);
      fireEvent.click(clearButton);

      // 验证预览消失
      expect(screen.queryByText(/Found 1 Events/i)).not.toBeInTheDocument();
    });
  });

  describe('模态框副作用', () => {
    it('应该在点击打开按钮时显示模态框', () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      expect(screen.getByText(/AI Calendar Import/i)).toBeInTheDocument();
    });

    it('应该在点击Cancel时关闭模态框', () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/AI Calendar Import/i)).not.toBeInTheDocument();
    });

    it('应该在点击背景时关闭模态框', () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const backdrop = screen.getByText(/AI Calendar Import/i).parentElement?.parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(screen.queryByText(/AI Calendar Import/i)).not.toBeInTheDocument();
    });
  });

  describe('空输入处理副作用', () => {
    it('应该在输入为空时禁用Parse按钮', () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const parseButton = screen.getByText(/Parse Schedule/i);
      expect(parseButton).toBeDisabled();
    });

    it('应该在只有空白字符时不触发API调用', async () => {
      render(<AIImport onImport={mockOnImport} />);

      const openButton = screen.getByText(/AI Import from Markdown/i);
      fireEvent.click(openButton);

      const textarea = screen.getByPlaceholderText(/Describe your schedule/i);
      fireEvent.change(textarea, { target: { value: '   ' } });

      const parseButton = screen.getByText(/Parse Schedule/i);
      fireEvent.click(parseButton);

      // 等待一小段时间确保没有API调用
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
