const fs = require('fs').promises;
const path = require('path');

module.exports = async (api, options) => {
  const { moduleName, router, store } = options;
  const moduleNameCamelCase = moduleName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
  const moduleNamePascalCase = moduleName.replace(/(\w)(\w*)/g, (g0, g1, g2) => { return g1.toUpperCase() + g2.toLowerCase(); });
  const scaffoldDirectory = path.resolve(path.join(__dirname, 'scaffold'));

  const directory = path.resolve(path.join(__dirname, `templates/src/modules/${moduleName}`));
  await fs.mkdir(directory, { recursive: true }, (err) => { if (err) throw err; });

  const routerDir = path.resolve(path.join(directory, 'router'));
  const storeDir = path.resolve(path.join(directory, 'store'));
  const componentsDir = path.resolve(path.join(directory, 'components'));
  const pagesDir = path.resolve(path.join(directory, 'pages'));

  // Remove all directories
  await fs.rmdir(routerDir, { recursive: true, force: true }, (error) => console.log(error));
  await fs.rmdir(storeDir, { recursive: true, force: true }, (error) => console.log(error));
  await fs.rmdir(componentsDir, { recursive: true, force: true }, (error) => console.log(error));
  await fs.rmdir(pagesDir, { recursive: true, force: true }, (error) => console.log(error));

  // Create components and pages directories
  await fs.mkdir(pagesDir, { recursive: true }, (err) => { if (err) throw err; });
  const scaffoldPagesDirectory = path.resolve(path.join(scaffoldDirectory, 'pages/Home.vue'));
  const filePagesDirectory = path.resolve(path.join(pagesDir, 'Home.vue'));
  await fs.copyFile(scaffoldPagesDirectory, filePagesDirectory);

  await fs.mkdir(componentsDir, { recursive: true }, (err) => { if (err) throw err; });
  const scaffoldComponentsDirectory = path.resolve(path.join(scaffoldDirectory, 'components/Component.vue'));
  const fileComponentsDirectory = path.resolve(path.join(componentsDir, 'Component.vue'));
  await fs.copyFile(scaffoldComponentsDirectory, fileComponentsDirectory);

  if (router) {
    await fs.mkdir(routerDir, (err) => {
      if (err) throw err;
    });

    const routeContent = `
      const ${moduleNameCamelCase}Routes = [
        {
          path: '/${moduleName}',
          component: () => import(/* webpackChunkName: "${moduleName}" */ '@/modules/${moduleName}/pages/Home.vue'),
          children: [
            {
              path: '',
              name: '${moduleNamePascalCase}',
              component: () => import(/* webpackChunkName: "${moduleName}" */ '@/modules/${moduleName}/pages/${moduleNamePascalCase}.vue'),
            },
          ],
        }
      ];

      export default ${moduleNameCamelCase}Routes;
    `;

    const routerFile = path.resolve(path.join(routerDir, 'index.js'));
    await fs.writeFile(routerFile, routeContent.toString(), (err) => {
      if (err) throw err;
      console.log('Router was created successfully.');
    });

    const fileModuleNameDirectory = path.resolve(path.join(pagesDir, `${moduleNamePascalCase}.vue`));
    await fs.copyFile(scaffoldComponentsDirectory, fileModuleNameDirectory);


    api.injectImports('src/router/index.js', `import ${moduleNameCamelCase}Routes from '@/modules/${moduleName}/router'`);

    api.afterInvoke(() => {
      const { EOL } = require('os');
      const fs = require('fs');
      const contentMain = fs.readFileSync(api.resolve('src/router/index.js'), { encoding: 'utf-8' });
      const lines = contentMain.split(/\r?\n/g);
      const renderIndex = lines.findIndex(line => line.match(/const router = new VueRouter/));
      lines[renderIndex - 3] += `${EOL}  ...${moduleNameCamelCase}Routes,`;

      fs.writeFileSync(api.resolve('src/router/index.js'), lines.join(EOL), { encoding: 'utf-8' })
    });
  }

  if (store) {
    await fs.mkdir(storeDir, {}, (err) => {
      if (err) throw err;
    });

    const storeContent = `
      const ${moduleNameCamelCase}Store = {
        namespaced: true,
        state: {},
        getters: {},
        mutations: {},
        actions: {},
      };

      export default ${moduleNameCamelCase}Store;
    `;

    const storeFile = path.resolve(path.join(storeDir, 'index.js'));

    await fs.writeFile(storeFile, storeContent.toString(), (err) => {
      if (err) throw err;
    });

    api.injectImports('src/store/index.js', `import ${moduleNameCamelCase}Store from '@/modules/${moduleName}/store'`);

    api.afterInvoke(() => {
      const { EOL } = require('os');
      const fs = require('fs');
      const contentMain = fs.readFileSync(api.resolve('src/store/index.js'), { encoding: 'utf-8' });
      const lines = contentMain.split(/\r?\n/g);
      lines[lines.length - 4] += `${EOL}    ${moduleNameCamelCase}Store,`;

      fs.writeFileSync(api.resolve('src/store/index.js'), lines.join(EOL), { encoding: 'utf-8' })
    })
  }

  api.render('./templates');

  // const paths = `path.resolve(path.join(__dirname, 'src/modules/${moduleName}/assets'))`;
  // const alias = `@assets${moduleNamePascalCase}`;
  // const resolveAlias = {
  //   resolve: {
  //     alias: {
  //       [alias]: paths,
  //     },
  //   },
  // };
  // api.configureWebpack(resolveAlias);

  api.onCreateComplete(() => {
    fs.rmdir(directory, { recursive: true, force: true }, (error) => console.log(error));
  });
};
