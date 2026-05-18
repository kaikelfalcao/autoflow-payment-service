import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/node_modules/**', '!**/*.spec.ts'],
  coverageDirectory: '../coverage',
  // TODO: subir threshold conforme cobertura de testes evolui (alvo: 80/80/70/80)
  coverageThreshold: {
    global: { lines: 10, functions: 10, branches: 5, statements: 10 },
  },
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};

export default config;
