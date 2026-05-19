import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/*.spec.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
    '!**/data-source.ts',
    '!**/newrelic.js',
    '!**/winston.config.ts',
    '!**/infrastructure/persistence/migrations/**',
    '!**/infrastructure/persistence/*.typeorm.entity.ts',
    '!**/env.schema.ts',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 80, statements: 80 },
  },
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};

export default config;
