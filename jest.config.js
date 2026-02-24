module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts',
    '!src/index-new.ts',
    '!src/shared/utils/canvas.ts',
    '!src/domain/qr/entities/data-segments/alphanumeric-data.ts',
    '!src/domain/qr/entities/data-segments/byte-data.ts',
    '!src/domain/qr/entities/data-segments/kanji-data.ts',
    '!src/domain/qr/entities/data-segments/numeric-data.ts',
    '!src/domain/qr/infrastructure/polynomial.ts',
    '!src/domain/qr/infrastructure/reed-solomon-encoder.ts',
    '!src/domain/qr/infrastructure/dijkstra.ts',
    '!src/domain/qr/value-objects/encoding-mode.ts',
    '!src/domain/qr/services/qr-code-generator.ts',
    '!src/domain/qr/infrastructure/segments.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};