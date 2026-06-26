# @viewfoundry/vite

**Stub package.** This release ships a no-op Vite plugin placeholder so the package name is reserved on npm.

The `viewfoundry()` plugin registers the name `viewfoundry` but does not transform modules or provide dev-server integration yet.

Full Vite integration is planned for **v0.5.0**. Do not depend on this package for production workflows until then.

```ts
import { viewfoundry } from '@viewfoundry/vite';

export default {
  plugins: [viewfoundry()],
};
```
