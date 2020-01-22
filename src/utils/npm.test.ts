import { omit } from 'lodash';
import osenv from 'osenv';
import path from 'path';
import cross from './cross';
import { config, distTag, setRegistry, view, publish } from './npm';

describe('npm config', () => {
  it('cache', () => {
    expect(config.cache).toBe(
      path.join(require('pacote/lib/util/cache-dir')(), '_cacache'),
    );
  });
  it('tmp', () => {
    expect(config.tmp).toBe(osenv.tmpdir());
  });
});

describe('npm publishSingle', () => {
  it('packageJson', async () => {
    setRegistry('http://localhost:8081/repository/npm/');
    const data = await publish(
      path.join(__dirname, '../../temp/download/axios-0.19.2.tgz'),
      'false',
    );
    expect(data).toMatchInlineSnapshot(`true`);
  });
});

describe('npm view', () => {
  describe.each(cross(['npm', 'taobao'], ['axios@0.19.1', 'webpack@4.41.5']))(
    'registry: %s, package: %s',
    (registry, pkg) => {
      it(pkg, async () => {
        setRegistry(registry);
        const data = await view(pkg);
        const dataWithoutDistTags = omit(data, ['dist-tags']);
        expect(dataWithoutDistTags).toMatchSnapshot();
        expect(data['dist-tags']).toBeDefined();
      });
    },
  );
});

describe('npm dist-tags ls', () => {
  it('@babel/core', async () => {
    const data = await distTag.ls('@babel/core');
    expect(data).toMatchInlineSnapshot(`
      Object {
        "bridge6": "6.0.0-bridge.1",
        "latest": "7.8.3",
      }
    `);
  });
});
