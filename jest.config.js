/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    'lib/aiParser.ts',
    'lib/storage.ts',
    'lib/icsExport.ts',
    'app/api/ai-schedule/route.ts',
    'components/calendar/AIImport.tsx',
    // 新增services目录
    'services/**/*.ts',
    // 排除types文件（纯类型定义）
    '!services/**/types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        moduleResolution: 'node',
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid|framer-motion)/)',
  ],
};

