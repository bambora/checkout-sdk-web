import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
  files: ['test/**/*spec.ts'],
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
  nodeResolve: true,
}
