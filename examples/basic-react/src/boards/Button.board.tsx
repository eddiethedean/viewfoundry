import { createBoard } from '@viewfoundry/board';
import { ButtonFixture } from '../code-first/fixture.js';

export default createBoard({
  name: 'Button',
  component: ButtonFixture,
  props: {},
  sourceFile: 'src/code-first/fixture.tsx',
  viewport: { width: 360, height: 200 },
});
