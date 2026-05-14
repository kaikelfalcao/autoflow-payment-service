"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: { '^.+\\.(t|j)s$': 'ts-jest' },
    collectCoverageFrom: ['**/*.(t|j)s', '!**/node_modules/**', '!**/*.spec.ts'],
    coverageDirectory: '../coverage',
    coverageThreshold: {
        global: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    testEnvironment: 'node',
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map