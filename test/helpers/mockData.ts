import type { CalendarEvent } from '@/types';
import { nanoid } from 'nanoid';

// ===== PRISMA MODEL TYPES =====
// Define Prisma model interfaces for testing
interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CalendarEventPrisma {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  color: string;
  recurrence: string | null;
  teamId: string | null;
  creatorId: string;
  aiGenerated: boolean;
  sourceMessageId: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Board {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  dueDate: Date | null;
  estimate: number | null;
  assigneeId: string | null;
  creatorId: string;
  aiGenerated: boolean;
  sourceMessageId: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Label {
  id: string;
  name: string;
  color: string;
  teamId: string;
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: Date;
  updatedAt: Date;
}

interface Channel {
  id: string;
  name: string;
  teamId: string;
  createdAt: Date;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  teamId: string;
  aiResult: any;
  createdAt: Date;
}

interface AIProcessingLog {
  id: string;
  success: boolean;
  error: string | null;
  processingTime: number;
  createdAt: Date;
}

// ===== PRISMA MODEL FACTORIES =====

/**
 * 创建模拟的日历事件 (old interface for backward compatibility)
 */
export function createMockEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const now = new Date();
  return {
    id: 'test-event-1',
    title: 'Test Event',
    start: now,
    end: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour later
    description: 'Test description',
    location: 'Test location',
    allDay: false,
    ...overrides,
  };
}

/**
 * 创建多个模拟事件
 */
export function createMockEvents(count: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const baseDate = new Date('2024-01-15T10:00:00.000Z');
  
  for (let i = 0; i < count; i++) {
    const start = new Date(baseDate.getTime() + i * 2 * 60 * 60 * 1000); // Every 2 hours
    events.push({
      id: `event-${i + 1}`,
      title: `Event ${i + 1}`,
      start,
      end: new Date(start.getTime() + 60 * 60 * 1000),
      description: `Description for event ${i + 1}`,
      allDay: false,
    });
  }
  
  return events;
}

// ===== PRISMA MODEL FACTORIES (NEW) =====

/**
 * User工厂
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user_' + nanoid(),
    clerkId: 'clerk_' + nanoid(),
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Team工厂
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team_' + nanoid(),
    name: 'Test Team',
    slug: 'test-team',
    description: null,
    avatarUrl: null,
    ownerId: 'user_owner',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * CalendarEvent Prisma工厂
 */
export function createMockCalendarEvent(overrides: Partial<CalendarEventPrisma> = {}): CalendarEventPrisma {
  const start = new Date('2024-01-15T10:00:00Z');
  const end = new Date('2024-01-15T11:00:00Z');

  return {
    id: 'event_' + nanoid(),
    title: 'Test Event',
    description: null,
    location: null,
    startTime: start,
    endTime: end,
    allDay: false,
    color: '#3B82F6',
    recurrence: null,
    teamId: null,
    creatorId: 'user_creator',
    aiGenerated: false,
    sourceMessageId: null,
    confidence: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Board工厂
 */
export function createMockBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'board_' + nanoid(),
    name: 'Test Board',
    description: null,
    teamId: 'team_test',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Column工厂
 */
export function createMockColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: 'column_' + nanoid(),
    name: 'Test Column',
    color: '#3B82F6',
    order: 0,
    boardId: 'board_test',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Task工厂
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task_' + nanoid(),
    title: 'Test Task',
    description: null,
    columnId: 'column_test',
    order: 0,
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: null,
    estimate: null,
    assigneeId: null,
    creatorId: 'user_creator',
    aiGenerated: false,
    sourceMessageId: null,
    confidence: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Label工厂
 */
export function createMockLabel(overrides: Partial<Label> = {}): Label {
  return {
    id: 'label_' + nanoid(),
    name: 'Test Label',
    color: '#EF4444',
    teamId: 'team_test',
    ...overrides,
  };
}

/**
 * TeamMember工厂
 */
export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'member_' + nanoid(),
    userId: 'user_member',
    teamId: 'team_test',
    role: 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Channel工厂
 */
export function createMockChannel(overrides: Partial<Channel> = {}): Channel {
  return {
    id: 'channel_' + nanoid(),
    name: 'general',
    teamId: 'team_test',
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Message工厂
 */
export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message_' + nanoid(),
    content: 'Test message',
    userId: 'user_test',
    teamId: 'team_test',
    aiResult: null,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * AIProcessingLog工厂
 */
export function createMockAIProcessingLog(overrides: Partial<AIProcessingLog> = {}): AIProcessingLog {
  return {
    id: 'log_' + nanoid(),
    success: true,
    error: null,
    processingTime: 1500,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * AI API 成功响应的模拟数据
 */
export const mockAISuccessResponse = {
  events: [
    {
      title: 'Meeting with Team',
      start: '2024-01-16T14:00:00.000Z',
      end: '2024-01-16T15:00:00.000Z',
      description: 'Discuss project roadmap',
      location: 'Conference Room A',
      allDay: false,
    },
    {
      title: 'Doctor Appointment',
      start: '2024-01-17T09:00:00.000Z',
      end: '2024-01-17T10:00:00.000Z',
      description: 'Annual checkup',
      location: 'Medical Center',
      allDay: false,
    },
  ],
};

/**
 * AI API 错误响应的模拟数据
 */
export const mockAIErrorResponses = {
  noApiKey: { error: 'AI_API_KEY is not defined in environment variables' },
  noText: { error: 'No text provided' },
  parseError: { error: 'Failed to parse AI response', raw: 'invalid json' },
  networkError: { error: 'Network request failed' },
  serverError: { error: 'Internal Server Error' },
};

/**
 * 各种用户输入示例
 */
export const mockUserInputs = {
  // 标准格式输入
  standard: '明天下午3点开会',
  standardWithDuration: '明天下午3点开会，持续2小时',
  standardEnglish: 'Meeting tomorrow at 3 PM',
  
  // 模糊输入
  fuzzy: '下周某天',
  fuzzyVague: '找个时间开会',
  
  // 多种日期格式
  dateFormats: {
    chinese: '2024年1月15日上午10:00',
    iso: '2024-01-15T10:00:00',
    relative: 'next Monday at 10 AM',
    american: '1/15/2024 10:00 AM',
  },
  
  // 多种时间格式
  timeFormats: {
    chinese24: '14:30',
    chineseAM: '上午 10:00',
    chinesePM: '下午 2:30',
    chineseNight: '晚上 8:00',
    english12: '2:30 PM',
  },
  
  // 缺失字段
  missingFields: {
    noTime: '明天开会',
    noDate: '下午3点开会',
    titleOnly: '开会',
  },
  
  // 无效输入
  invalid: {
    empty: '',
    whitespace: '   ',
    random: 'asdfghjkl',
    specialChars: '!@#$%^&*()',
  },
  
  // Markdown 格式输入
  markdown: `# 2024年1月15日 学习计划

- **上午 11:00 - 下午 2:30 (3小时):**
  - **科目:** 数学
  - **目标:** 完成微积分第5章

- **下午 3:00 - 下午 5:00 (2小时):**
  - **科目:** 英语
  - **目标:** 阅读理解练习
`,
};

/**
 * 边界条件测试数据
 */
export const boundaryConditions = {
  // 极端日期
  pastDate: new Date('1900-01-01T00:00:00.000Z'),
  farFutureDate: new Date('2099-12-31T23:59:59.999Z'),
  epochDate: new Date(0),
  
  // 空值
  nullValue: null,
  undefinedValue: undefined,
  emptyString: '',
  emptyArray: [],
  emptyObject: {},
  
  // 特殊字符
  specialChars: '<script>alert("xss")</script>',
  unicodeChars: '日程安排 📅 ✨ 🎉',
  longText: 'A'.repeat(10000),
};

// ===== PRISMA MOCK HELPERS =====

// Import prisma from setup for use in helpers
const { prisma } = require('@/lib/prisma');

/**
 * Prisma Mock助手
 */
export const mockPrisma = {
  /**
   * 重置所有mocks
   */
  reset: () => {
    Object.values(prisma).forEach(model => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach(method => {
          if (jest.isMockFunction(method)) {
            (method as jest.Mock).mockReset();
          }
        });
      }
    });
  },

  /**
   * 配置成功响应
   */
  mockSuccess: (model: string, method: string, returnValue: any) => {
    if (prisma[model] && prisma[model][method]) {
      (prisma[model][method] as jest.Mock).mockResolvedValue(returnValue);
    } else {
      throw new Error(`Prisma model ${model} or method ${method} not found`);
    }
  },

  /**
   * 配置失败响应
   */
  mockError: (model: string, method: string, error: Error) => {
    if (prisma[model] && prisma[model][method]) {
      (prisma[model][method] as jest.Mock).mockRejectedValue(error);
    } else {
      throw new Error(`Prisma model ${model} or method ${method} not found`);
    }
  },

  /**
   * 配置事务成功
   */
  mockTransactionSuccess: (returnValue: any) => {
    (prisma.$transaction as jest.Mock).mockResolvedValue(returnValue);
  },

  /**
   * 配置事务失败
   */
  mockTransactionError: (error: Error) => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(error);
  },

  /**
   * 验证方法调用
   */
  expectCalledWith: (model: string, method: string, expectedParams: any) => {
    expect(prisma[model][method]).toHaveBeenCalledWith(expectedParams);
  },

  /**
   * 验证方法调用次数
   */
  expectCallCount: (model: string, method: string, count: number) => {
    expect(prisma[model][method]).toHaveBeenCalledTimes(count);
  },

  /**
   * 获取最后一次调用的参数
   */
  getLastCall: (model: string, method: string) => {
    return (prisma[model][method] as jest.Mock).mock.calls[(prisma[model][method] as jest.Mock).mock.calls.length - 1];
  },
};

// ===== TEST HELPERS =====

/**
 * 创建测试上下文
 */
export function createTestContext(overrides: {
  user?: User;
  team?: Team;
  board?: Board;
} = {}) {
  const user = overrides.user || createMockUser();
  const team = overrides.team || createMockTeam({ ownerId: user.id });
  const board = overrides.board || createMockBoard({ teamId: team.id });

  return {
    user,
    team,
    board,
    // 创建基本团队成员关系
    createTeamMember: (role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER') =>
      createMockTeamMember({
        userId: user.id,
        teamId: team.id,
        role,
      }),
  };
}

/**
 * 创建测试用的权限场景
 */
export function createPermissionScenarios(context: ReturnType<typeof createTestContext>) {
  const { user, team } = context;

  return {
    // 场景1: 用户是团队所有者
    owner: () => ({
      user,
      team,
      member: createMockTeamMember({
        userId: user.id,
        teamId: team.id,
        role: 'OWNER',
      }),
    }),

    // 场景2: 用户是管理员
    admin: () => ({
      user,
      team,
      member: createMockTeamMember({
        userId: user.id,
        teamId: team.id,
        role: 'ADMIN',
      }),
    }),

    // 场景3: 用户是普通成员
    member: () => ({
      user,
      team,
      member: createMockTeamMember({
        userId: user.id,
        teamId: team.id,
        role: 'MEMBER',
      }),
    }),

    // 场景4: 用户不是团队成员
    nonMember: () => ({
      user,
      team,
      member: null,
    }),
  };
}

/**
 * 验证事务操作的辅助函数
 */
export function expectTransactionOperations(expectedCount: number) {
  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  const transactionCall = (prisma.$transaction as jest.Mock).mock.calls[0];
  if (typeof transactionCall[0] === 'function') {
    // 函数形式的事务
    expect(typeof transactionCall[0]).toBe('function');
  } else if (Array.isArray(transactionCall[0])) {
    // 数组形式的事务
    expect(transactionCall[0]).toHaveLength(expectedCount);
  }
}

/**
 * 创建复杂的测试数据集
 */
export function createComplexTestData() {
  const users = Array.from({ length: 5 }, () => createMockUser());
  const team = createMockTeam({ ownerId: users[0].id });
  const members = users.map((user, index) =>
    createMockTeamMember({
      userId: user.id,
      teamId: team.id,
      role: index === 0 ? 'OWNER' : index === 1 ? 'ADMIN' : 'MEMBER',
    })
  );
  const board = createMockBoard({ teamId: team.id });
  const columns = Array.from({ length: 4 }, (_, index) =>
    createMockColumn({
      boardId: board.id,
      order: index,
      name: ['To Do', 'In Progress', 'In Review', 'Done'][index],
    })
  );
  const tasks = columns.flatMap((column, columnIndex) =>
    Array.from({ length: 3 }, (_, taskIndex) =>
      createMockTask({
        columnId: column.id,
        order: taskIndex,
        title: `Task ${columnIndex}-${taskIndex}`,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][columnIndex] as any,
        assigneeId: users[Math.floor(Math.random() * users.length)].id,
      })
    )
  );

  return {
    users,
    team,
    members,
    board,
    columns,
    tasks,
  };
}

