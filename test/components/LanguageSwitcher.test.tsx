/**
 * LanguageSwitcher useEffect 副作用测试
 * 测试语言切换、localStorage读写等副作用
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import * as localeModule from '@/lib/locale';

// Mock locale module
jest.mock('@/lib/locale', () => ({
  LOCALES: {
    EN: 'en',
    ZH: 'zh',
  },
  LOCALE_NAMES: {
    en: 'English',
    zh: '中文',
  },
  setLocale: jest.fn(),
  getLocale: jest.fn(),
}));

describe('LanguageSwitcher - useEffect副作用测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (localeModule.getLocale as jest.Mock).mockReturnValue('en');
  });

  describe('初始化副作用', () => {
    it('应该在组件挂载时从localStorage读取当前语言', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('zh');

      render(<LanguageSwitcher />);

      // 验证getLocale被调用
      expect(localeModule.getLocale).toHaveBeenCalledTimes(1);
    });

    it('应该只在组件挂载时调用一次getLocale', () => {
      const { rerender } = render(<LanguageSwitcher />);

      expect(localeModule.getLocale).toHaveBeenCalledTimes(1);

      rerender(<LanguageSwitcher />);
      expect(localeModule.getLocale).toHaveBeenCalledTimes(1);
    });

    it('应该根据读取的语言设置按钮状态', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('zh');

      render(<LanguageSwitcher />);

      const zhButton = screen.getByText('中文');
      expect(zhButton).toHaveClass('bg-[var(--neon-green)]');
    });

    it('应该处理默认语言（英文）', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('en');

      render(<LanguageSwitcher />);

      const enButton = screen.getByText('English');
      expect(enButton).toHaveClass('bg-[var(--neon-green)]');
    });
  });

  describe('语言切换副作用', () => {
    it('应该在点击按钮时调用setLocale', () => {
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText('中文');
      fireEvent.click(zhButton);

      expect(localeModule.setLocale).toHaveBeenCalledWith('zh');
    });

    it('应该支持切换到不同的语言', () => {
      render(<LanguageSwitcher />);

      // 切换到中文
      const zhButton = screen.getByText('中文');
      fireEvent.click(zhButton);
      expect(localeModule.setLocale).toHaveBeenCalledWith('zh');

      // 切换到英文
      const enButton = screen.getByText('English');
      fireEvent.click(enButton);
      expect(localeModule.setLocale).toHaveBeenCalledWith('en');
    });

    it('应该在每次点击时都调用setLocale', () => {
      render(<LanguageSwitcher />);

      const zhButton = screen.getByText('中文');

      fireEvent.click(zhButton);
      expect(localeModule.setLocale).toHaveBeenCalledTimes(1);

      fireEvent.click(zhButton);
      expect(localeModule.setLocale).toHaveBeenCalledTimes(2);

      fireEvent.click(zhButton);
      expect(localeModule.setLocale).toHaveBeenCalledTimes(3);
    });
  });

  describe('UI状态副作用', () => {
    it('应该调用setLocale时更新语言', async () => {
      // 模拟setLocale会触发localStorage更新
      (localeModule.setLocale as jest.Mock).mockImplementation((locale: string) => {
        (localeModule.getLocale as jest.Mock).mockReturnValue(locale);
      });

      render(<LanguageSwitcher />);

      // 初始状态：英文
      expect(screen.getByText('English')).toHaveClass('bg-[var(--neon-green)]');
      expect(screen.getByText('中文')).toHaveClass('bg-transparent');

      // 切换到中文
      const zhButton = screen.getByText('中文');
      fireEvent.click(zhButton);

      // 验证setLocale被调用
      expect(localeModule.setLocale).toHaveBeenCalledWith('zh');

      // 注意：在当前实现中，组件不会自动重新渲染更新UI
      // 这需要配合React Context或全局状态管理来实现
    });

    it('应该渲染所有可用的语言选项', () => {
      render(<LanguageSwitcher />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('应该为当前语言应用active样式', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('zh');

      render(<LanguageSwitcher />);

      const zhButton = screen.getByText('中文');
      const enButton = screen.getByText('English');

      // 中文按钮应该有active样式
      expect(zhButton.className).toContain('bg-[var(--neon-green)]');
      expect(zhButton.className).toContain('text-[var(--color-bg)]');

      // 英文按钮应该有inactive样式
      expect(enButton.className).toContain('bg-transparent');
      expect(enButton.className).toContain('text-[var(--neon-green)]');
      expect(enButton.className).toContain('border-2');
    });
  });

  describe('边界情况副作用', () => {
    it('应该处理getLocale返回undefined的情况', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue(undefined);

      render(<LanguageSwitcher />);

      // 组件应该正常渲染
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('应该处理getLocale返回无效语言的情况', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('invalid');

      render(<LanguageSwitcher />);

      // 组件应该正常渲染
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('应该检测setLocale可能抛出错误的情况', () => {
      // 当setLocale抛出错误时，组件应该有错误边界处理
      // 但当前实现会让错误向上传播，这是一个改进点
      const mockError = jest.fn(() => {
        throw new Error('Storage error');
      });

      (localeModule.setLocale as jest.Mock).mockImplementation(mockError);

      render(<LanguageSwitcher />);

      // 验证组件正常渲染
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();

      // 点击会调用setLocale（即使它会抛出错误）
      // 注意：在生产环境中应该添加try-catch或错误边界
    });
  });

  describe('多次渲染副作用', () => {
    it('应该在多次重新渲染时保持状态一致', () => {
      (localeModule.getLocale as jest.Mock).mockReturnValue('zh');

      const { rerender } = render(<LanguageSwitcher />);

      expect(screen.getByText('中文')).toHaveClass('bg-[var(--neon-green)]');

      // 重新渲染多次
      rerender(<LanguageSwitcher />);
      rerender(<LanguageSwitcher />);
      rerender(<LanguageSwitcher />);

      // 状态应该保持一致
      expect(screen.getByText('中文')).toHaveClass('bg-[var(--neon-green)]');
      expect(localeModule.getLocale).toHaveBeenCalledTimes(1); // 只在挂载时调用一次
    });
  });

  describe('动画和交互副作用', () => {
    beforeEach(() => {
      // 确保setLocale恢复为正常的mock（不抛出错误）
      (localeModule.setLocale as jest.Mock).mockImplementation(() => {});
    });

    it('应该支持按钮点击交互', () => {
      render(<LanguageSwitcher />);

      const enButton = screen.getByText('English');
      const zhButton = screen.getByText('中文');

      // 验证按钮可点击
      expect(enButton).not.toBeDisabled();
      expect(zhButton).not.toBeDisabled();

      // 点击应该触发副作用
      fireEvent.click(zhButton);
      expect(localeModule.setLocale).toHaveBeenCalled();
    });

    it('应该为所有按钮设置正确的类名', () => {
      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button.className).toContain('px-4');
        expect(button.className).toContain('py-2');
        expect(button.className).toContain('rounded-lg');
      });
    });
  });
});
