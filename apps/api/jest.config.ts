export default {
  displayName: 'api',
  preset: '../../node_modules/@nx/jest/preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.guard.ts',
    '!src/**/*.strategy.ts',
  ],
  moduleNameMapper: {
    '^@coaching-app/shared/types$': '<rootDir>/../../libs/shared/types/src/index.ts',
    '^@coaching-app/data-access$': '<rootDir>/../../libs/data-access/src/index.ts',
    '^@coaching-app/coaching-utils$': '<rootDir>/../../libs/coaching-utils/src/index.ts',
  },
};
