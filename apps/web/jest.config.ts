import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

const presetConfig = createCjsPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json',
});

export default {
  displayName: 'web',
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  coverageDirectory: '../../coverage/apps/web',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/environment*.ts',
    '!src/**/*.routes.ts',
  ],
  moduleNameMapper: {
    '^@coaching-app/shared/types$': '<rootDir>/../../libs/shared/types/src/index.ts',
    '^@coaching-app/coaching-ui$': '<rootDir>/../../libs/coaching-ui/src/index.ts',
    '^@coaching-app/api-client$': '<rootDir>/../../libs/api-client/src/index.ts',
    '^@coaching-app/coaching-utils$': '<rootDir>/../../libs/coaching-utils/src/index.ts',
    '^rxjs(/.*)?$': '<rootDir>/../../node_modules/rxjs$1',
  },
};
