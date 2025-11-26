# Neon Calendar 团队协作平台 - 架构评估与规划

## 执行摘要

基于对当前代码库的深入分析，本文档提供从个人工具升级为 AI 驱动团队协作平台的完整评估和规划。

---

## 1. 当前架构评估

### 1.1 现状分析

```
当前架构:
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)               │
├─────────────────────────────────────────────────────┤
│  Pages (app/)     │  Components      │  UI Layer   │
│  - calendar/      │  - calendar/     │  - Button   │
│  - todos/         │  - todos/        │  - Card     │
├─────────────────────────────────────────────────────┤
│                    lib/ (工具层)                     │
│  - storage.ts (localStorage)                        │
│  - aiParser.ts                                      │
│  - icsExport.ts                                     │
├─────────────────────────────────────────────────────┤
│  API Routes       │  Types           │  Constants  │
│  - ai-schedule/   │  - index.ts      │  - lib/     │
└─────────────────────────────────────────────────────┘
```

### 1.2 架构问题评估

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| **数据层耦合** | 🔴 高 | localStorage 直接在页面组件中调用，无法扩展为多用户 |
| **无业务逻辑层** | 🔴 高 | 业务逻辑散落在页面组件中 (handleAddEvent, handleToggle) |
| **无认证机制** | 🔴 高 | 没有用户身份概念 |
| **无实时同步** | 🟡 中 | 单用户设计，无需同步 |
| **状态管理简单** | 🟡 中 | 仅使用 useState，适合当前规模 |

### 1.3 架构适配性结论

**当前架构不适合直接扩展为多用户系统**，原因：
1. 数据存储在本地 localStorage，无法跨设备/用户共享
2. 无用户身份标识，所有数据模型缺少 `userId` / `teamId`
3. 业务逻辑与 UI 强耦合，难以复用

---

## 2. 推荐架构：模块化单体 (Modular Monolith)

### 2.1 为什么不是微服务？

| 因素 | 微服务 | 模块化单体 | 推荐 |
|------|--------|------------|------|
| 团队规模 | 多团队 | 小团队 | ✅ 单体 |
| 运维复杂度 | 高 | 低 | ✅ 单体 |
| 开发速度 | 慢 | 快 | ✅ 单体 |
| 初期成本 | 高 | 低 | ✅ 单体 |
| 未来拆分 | - | 可拆分 | ✅ 单体 |

**结论**: 采用**模块化单体架构**，业务逻辑按领域清晰分层，未来可按需拆分为微服务。

### 2.2 目标架构

```
目标架构:
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Calendar │  │   Todo   │  │  Board   │  │   Chat   │     │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │            │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐      │
│  │              React Query + Zustand                 │      │
│  │         (Server State + Client State)              │      │
│  └────────────────────────┬───────────────────────────┘      │
└───────────────────────────┼──────────────────────────────────┘
                            │ API Calls
┌───────────────────────────┼──────────────────────────────────┐
│                     API Layer (Next.js)                       │
│  ┌────────────────────────┴───────────────────────────┐      │
│  │                   API Routes                        │      │
│  │  /api/events  /api/tasks  /api/boards  /api/chat   │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                   │
│  ┌────────────────────────┴───────────────────────────┐      │
│  │               Service Layer (业务逻辑)              │      │
│  │  CalendarService │ TaskService │ BoardService │ AI │      │
│  └────────────────────────┬───────────────────────────┘      │
│                           │                                   │
│  ┌────────────────────────┴───────────────────────────┐      │
│  │            Repository Layer (数据访问)              │      │
│  │     Prisma ORM  │  Auth (Clerk)  │  Realtime      │      │
│  └────────────────────────┬───────────────────────────┘      │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                      Data Layer                               │
│         PostgreSQL (Supabase/Neon.tech)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 技术选型推荐

### 3.1 数据库

| 选项 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **Supabase** | 内置 Auth/Realtime/Storage | 相对较新 | ⭐⭐⭐ |
| **Neon.tech** | 冷启动快，Serverless 原生 | 需自建 Auth | ⭐⭐ |
| **PlanetScale** | MySQL 分支，稳定 | 不支持外键约束 | ⭐ |

**推荐: Supabase + Prisma**
- Supabase 提供 PostgreSQL + 实时订阅 + Row Level Security
- Prisma 提供类型安全的数据库访问

### 3.2 认证方案

| 选项 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **Clerk** | 开箱即用，UI 美观，团队功能 | 付费较贵 | ⭐⭐⭐ |
| **NextAuth** | 免费，灵活 | 需要更多配置 | ⭐⭐ |
| **Supabase Auth** | 与数据库集成 | 功能相对简单 | ⭐⭐ |

**推荐: Clerk**
- 内置组织/团队管理
- 与 Next.js 深度集成
- 提供 Webhook 同步用户数据到数据库

### 3.3 实时同步

| 选项 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| **Supabase Realtime** | 与数据库无缝集成 | 需用 Supabase | ⭐⭐⭐ |
| **Pusher** | 稳定，易用 | 额外服务 | ⭐⭐ |
| **Socket.io** | 灵活 | 需自建服务器 | ⭐ |

**推荐: Supabase Realtime**
- 直接监听数据库变更
- 无需额外基础设施

### 3.4 状态管理

```typescript
// 推荐组合
- React Query (TanStack Query): 服务端状态缓存
- Zustand: 客户端 UI 状态
```

---

## 4. 数据模型设计 (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ 用户与团队 ============

model User {
  id            String   @id @default(cuid())
  clerkId       String   @unique  // Clerk 用户 ID
  email         String   @unique
  name          String?
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关系
  ownedTeams    Team[]   @relation("TeamOwner")
  memberships   TeamMember[]
  events        CalendarEvent[]
  tasks         Task[]
  assignedTasks Task[]   @relation("TaskAssignee")
  messages      Message[]
}

model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // URL 友好的标识
  avatarUrl   String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id])
  members     TeamMember[]
  events      CalendarEvent[]
  boards      Board[]
  channels    Channel[]
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      TeamRole @default(MEMBER)
  joinedAt  DateTime @default(now())

  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

// ============ 日历事件 ============

model CalendarEvent {
  id          String    @id @default(cuid())
  title       String
  description String?
  location    String?
  startTime   DateTime
  endTime     DateTime
  allDay      Boolean   @default(false)
  color       String?

  // 归属
  userId      String
  teamId      String?

  // AI 生成标记
  aiGenerated Boolean   @default(false)
  sourceMessageId String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
  team        Team?     @relation(fields: [teamId], references: [id])
  sourceMessage Message? @relation(fields: [sourceMessageId], references: [id])

  @@index([userId])
  @@index([teamId])
  @@index([startTime])
}

// ============ 看板系统 ============

model Board {
  id          String   @id @default(cuid())
  name        String
  description String?
  teamId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  columns     Column[]

  @@index([teamId])
}

model Column {
  id        String   @id @default(cuid())
  name      String
  order     Int
  boardId   String
  createdAt DateTime @default(now())

  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks     Task[]

  @@index([boardId])
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  order       Int
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(TODO)
  dueDate     DateTime?

  columnId    String
  creatorId   String
  assigneeId  String?

  // AI 生成标记
  aiGenerated Boolean    @default(false)
  sourceMessageId String?

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  column      Column     @relation(fields: [columnId], references: [id], onDelete: Cascade)
  creator     User       @relation(fields: [creatorId], references: [id])
  assignee    User?      @relation("TaskAssignee", fields: [assigneeId], references: [id])
  sourceMessage Message? @relation(fields: [sourceMessageId], references: [id])
  labels      TaskLabel[]

  @@index([columnId])
  @@index([creatorId])
  @@index([assigneeId])
}

model Label {
  id        String      @id @default(cuid())
  name      String
  color     String
  tasks     TaskLabel[]
}

model TaskLabel {
  taskId  String
  labelId String
  task    Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label   Label  @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([taskId, labelId])
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

// ============ 聊天系统 ============

model Channel {
  id        String    @id @default(cuid())
  name      String
  teamId    String
  createdAt DateTime  @default(now())

  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@index([teamId])
}

model Message {
  id        String   @id @default(cuid())
  content   String
  userId    String
  channelId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)

  // AI 解析生成的关联
  generatedEvents CalendarEvent[]
  generatedTasks  Task[]

  @@index([channelId])
  @@index([userId])
}
```

---

## 5. Service Layer 设计

推荐创建以下服务层结构：

```
services/
├── calendar/
│   ├── calendarService.ts      # 日历业务逻辑
│   ├── calendarRepository.ts   # 数据访问
│   └── calendarTypes.ts        # 类型定义
├── board/
│   ├── boardService.ts
│   ├── taskService.ts
│   └── boardRepository.ts
├── team/
│   ├── teamService.ts
│   └── teamRepository.ts
├── chat/
│   ├── chatService.ts
│   └── messageRepository.ts
└── ai/
    ├── aiParserService.ts      # AI 解析服务
    ├── eventExtractor.ts       # 从消息提取事件
    └── taskExtractor.ts        # 从消息提取任务
```

### 示例: CalendarService

```typescript
// services/calendar/calendarService.ts

import { prisma } from '@/lib/prisma';
import type { CalendarEvent, CreateEventInput } from './calendarTypes';

export class CalendarService {
  /**
   * 获取用户可见的所有事件（个人 + 团队）
   */
  async getEventsForUser(userId: string, teamIds: string[]): Promise<CalendarEvent[]> {
    return prisma.calendarEvent.findMany({
      where: {
        OR: [
          { userId, teamId: null },  // 个人事件
          { teamId: { in: teamIds } } // 团队事件
        ]
      },
      orderBy: { startTime: 'asc' }
    });
  }

  /**
   * 创建事件（支持个人或团队）
   */
  async createEvent(input: CreateEventInput): Promise<CalendarEvent> {
    return prisma.calendarEvent.create({
      data: {
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        allDay: input.allDay ?? false,
        userId: input.userId,
        teamId: input.teamId,
        aiGenerated: input.aiGenerated ?? false,
        sourceMessageId: input.sourceMessageId,
      }
    });
  }

  /**
   * 批量创建 AI 生成的事件
   */
  async createEventsFromAI(
    events: CreateEventInput[],
    sourceMessageId: string
  ): Promise<CalendarEvent[]> {
    return prisma.$transaction(
      events.map(event =>
        prisma.calendarEvent.create({
          data: {
            ...event,
            aiGenerated: true,
            sourceMessageId,
          }
        })
      )
    );
  }
}

export const calendarService = new CalendarService();
```

---

## 6. 实施策略回答

### Q1: 先设计数据库模型还是先重构架构？

**推荐: 先设计数据库模型 (Prisma Schema)**

理由：
1. 数据模型是系统的核心，定义清楚后才能确定 Service 层接口
2. Prisma 可以生成类型，重构时有类型保护
3. 可以使用 `prisma db push` 快速迭代数据模型

执行步骤：
```bash
# 1. 安装 Prisma
npm install prisma @prisma/client

# 2. 初始化
npx prisma init

# 3. 设计 schema.prisma (如上文所示)

# 4. 生成客户端类型
npx prisma generate

# 5. 创建数据库表
npx prisma db push
```

### Q2: TDD 还是直接实现？

**推荐: 混合策略 (Hybrid Approach)**

| 模块 | 策略 | 理由 |
|------|------|------|
| Service 层 | ✅ TDD | 核心业务逻辑，必须有测试 |
| Repository 层 | ⚠️ 集成测试 | 依赖数据库，单元测试价值低 |
| UI 组件 | ❌ 后写测试 | UI 变化快，先实现再补测试 |
| API Routes | ✅ TDD | 接口契约稳定，适合 TDD |

**具体做法：**
```typescript
// 1. 先写 Service 接口和测试
// services/calendar/__tests__/calendarService.test.ts
describe('CalendarService', () => {
  it('should create event for user', async () => {
    // 先写测试，定义预期行为
  });

  it('should filter events by team', async () => {
    // ...
  });
});

// 2. 再实现 Service
// services/calendar/calendarService.ts
```

### Q3: 实施顺序和优先级

```
Phase 1: 基础设施 (Week 1-2)
├── [P0] 设置 Supabase + Prisma
├── [P0] 设计并创建数据库模型
├── [P0] 集成 Clerk 认证
└── [P0] 创建 Service 层基础结构

Phase 2: 核心迁移 (Week 3-4)
├── [P0] 迁移 Calendar 功能到数据库
├── [P0] 迁移 Todo 功能到数据库
├── [P1] 实现用户/团队管理 API
└── [P1] 添加实时同步 (Supabase Realtime)

Phase 3: 新功能 - 看板 (Week 5-6)
├── [P0] Board/Column/Task 数据模型
├── [P0] 看板 CRUD API
├── [P1] 拖拽排序 (复用 @dnd-kit)
└── [P2] 标签和过滤

Phase 4: AI 团队协作 (Week 7-8)
├── [P0] 聊天系统基础
├── [P0] AI 消息解析 → 事件
├── [P1] AI 消息解析 → 任务
└── [P2] AI 智能建议
```

---

## 7. 迁移策略：渐进式迁移

**不要一次性重写**，而是：

```
                    Current                    Target
                    ┌─────────┐                ┌─────────┐
                    │ localStorage │    →       │ Database │
                    └─────────┘                └─────────┘
                         ↓
              ┌──────────────────────┐
              │   Migration Layer    │
              │  (Feature Flags)     │
              └──────────────────────┘
                    ↓          ↓
            ┌───────────┐  ┌───────────┐
            │ Old Code  │  │ New Code  │
            │ (localStorage) │ │(Database)│
            └───────────┘  └───────────┘
```

### 示例: Feature Flag 迁移

```typescript
// lib/featureFlags.ts
export const FEATURES = {
  USE_DATABASE_STORAGE: process.env.NEXT_PUBLIC_USE_DB === 'true',
};

// services/calendar/calendarService.ts
import { eventStorage } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { FEATURES } from '@/lib/featureFlags';

export async function getEvents(userId: string) {
  if (FEATURES.USE_DATABASE_STORAGE) {
    return prisma.calendarEvent.findMany({ where: { userId } });
  } else {
    return eventStorage.getAll(); // 旧实现
  }
}
```

---

## 8. 目录结构建议

```
calendar/
├── app/
│   ├── (auth)/                 # 认证相关页面
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/            # 登录后页面
│   │   ├── calendar/
│   │   ├── boards/
│   │   ├── chat/
│   │   └── settings/
│   └── api/
│       ├── events/
│       ├── tasks/
│       ├── boards/
│       ├── teams/
│       └── webhooks/           # Clerk webhooks
├── components/
│   ├── calendar/
│   ├── board/                  # 新增
│   ├── chat/                   # 新增
│   ├── team/                   # 新增
│   └── ui/
├── services/                   # 新增 Service 层
│   ├── calendar/
│   ├── board/
│   ├── team/
│   ├── chat/
│   └── ai/
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # Clerk helpers
│   ├── realtime.ts             # Supabase realtime
│   └── ...
├── prisma/
│   └── schema.prisma
└── types/
    └── index.ts
```

---

## 9. 总结

| 决策点 | 推荐方案 |
|--------|----------|
| 架构模式 | 模块化单体 |
| 数据库 | Supabase (PostgreSQL) |
| ORM | Prisma |
| 认证 | Clerk |
| 实时同步 | Supabase Realtime |
| 状态管理 | React Query + Zustand |
| 实施顺序 | 数据模型 → 认证 → 迁移 → 新功能 |
| 测试策略 | Service 层 TDD，UI 后补测试 |

**下一步行动：**
1. 确认技术选型
2. 创建 Supabase 项目
3. 编写 Prisma Schema
4. 设置 Clerk 认证

