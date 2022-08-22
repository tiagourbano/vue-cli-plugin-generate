const fs = require('fs').promises;
const path = require('path');

module.exports = async (api, options) => {
  api.registerCommand(
    'generate',
    {
      description: 'Generates a new module with or without route and store',
      usage: 'vue-cli-service generate',
      options: {
        '--name': '(string) - Specify module name',
        '--route': '(boolean) - Generate routes',
        '--store': '(boolean) - Generate stores'
      }
    },
    async (args) => {
      if (!args.name) {
        console.log("\x1b[31m%s\x1b[0m", "[GENERATE] Argument --name is required!");
        return false;
      }

      let router = true;
      let store = true;

      if (args.route) {
        router = (args.route === 'true');
      }

      if (args.store) {
        store = (args.store === 'true');
      }

      // console.log("\x1b[30m%s\x1b[0m", `[GENERATE] --router ${router}: args ${args.route} ${typeof args.route}`);
      // console.log("\x1b[30m%s\x1b[0m", `[GENERATE] --store ${store}`);

      // return false;

      const moduleName = args.name;
      const moduleNameCamelCase = moduleName.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
      const moduleNamePascalCase = moduleName.replace(/(\w)(\w*)/g, (g0, g1, g2) => { return g1.toUpperCase() + g2.toLowerCase(); });
      const rootDir = path.resolve(path.join(api.getCwd()));
      const scaffoldDirectory = path.resolve(path.join(__dirname, 'generator/scaffold'));

      // Create module dir
      const moduleDir = path.resolve(path.join(rootDir, `/src/modules/${moduleName}`));
      await fs.mkdir(moduleDir, { recursive: true }, (err) => { if (err) throw err; });
      console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New module folder was created: ${moduleDir}`);

      // Define structure directories
      const routerDir = path.resolve(path.join(moduleDir, 'router'));
      const storeDir = path.resolve(path.join(moduleDir, 'store'));
      const componentsDir = path.resolve(path.join(moduleDir, 'components'));
      const pagesDir = path.resolve(path.join(moduleDir, 'pages'));

      // Remove all directories case exists
      await fs.rmdir(routerDir, { recursive: true, force: true }, (error) => console.log(error));
      await fs.rmdir(storeDir, { recursive: true, force: true }, (error) => console.log(error));
      await fs.rmdir(componentsDir, { recursive: true, force: true }, (error) => console.log(error));
      await fs.rmdir(pagesDir, { recursive: true, force: true }, (error) => console.log(error));

      // Create components and pages directories
      await fs.mkdir(pagesDir, { recursive: true }, (err) => { if (err) throw err; });
      console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New folder pages was created: ${pagesDir}`);
      await fs.mkdir(componentsDir, { recursive: true }, (err) => { if (err) throw err; });
      console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New folder components was created: ${componentsDir}`);

      // Copy files from template for pages and components
      const scaffoldPagesDirectory = path.resolve(path.join(scaffoldDirectory, 'pages/Home.vue'));
      const filePagesDirectory = path.resolve(path.join(pagesDir, 'Home.vue'));
      await fs.copyFile(scaffoldPagesDirectory, filePagesDirectory);

      const scaffoldComponentsDirectory = path.resolve(path.join(scaffoldDirectory, 'components/Component.vue'));
      const fileComponentsDirectory = path.resolve(path.join(componentsDir, 'Component.vue'));
      await fs.copyFile(scaffoldComponentsDirectory, fileComponentsDirectory);

      if (router) {
        await fs.mkdir(routerDir, (err) => { if (err) throw err; });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New folder router was created: ${routerDir}`);

        const routeContent = `const ${moduleNameCamelCase}Routes = [
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
  },
];

export default ${moduleNameCamelCase}Routes;
`;

        const routerFile = path.resolve(path.join(routerDir, 'index.js'));
        await fs.writeFile(routerFile, routeContent.toString(), (err) => { if (err) throw err; });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New router file was created: ${routerFile}`);

        const fileModuleNameDirectory = path.resolve(path.join(pagesDir, `${moduleNamePascalCase}.vue`));
        await fs.copyFile(scaffoldComponentsDirectory, fileModuleNameDirectory);


        // Inject import inside main router
        const routerMainFile = path.resolve(path.join(rootDir, 'src/router/index.js'));

        const routerMain = await fs.readFile(routerMainFile, { encoding: 'utf-8' });
        const lines = routerMain.split(/\r?\n/g);
        const renderImportLinesIndex = lines.findIndex(line => line.match(/const routes = /));
        lines[renderImportLinesIndex - 4] += `\nimport ${moduleNameCamelCase}Routes from '@/modules/${moduleName}/router';`;

        const renderPushRouteIndex = lines.findIndex(line => line.match(/const router = new VueRouter/));
        lines[renderPushRouteIndex - 3] += `\n  ...${moduleNameCamelCase}Routes,`;


        await fs.writeFile(routerMainFile, lines.join('\n'), { encoding: 'utf-8' });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] Main router file was updated: ${routerMainFile}`);
      }

      if (store) {
        await fs.mkdir(storeDir, {}, (err) => { if (err) throw err; });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New folder store was created: ${storeDir}`);

        const storeContent = `const ${moduleNameCamelCase}Store = {
  namespaced: true,
  state: {},
  getters: {},
  mutations: {},
  actions: {},
};

export default ${moduleNameCamelCase}Store;
`;

        const storeFile = path.resolve(path.join(storeDir, 'index.js'));
        await fs.writeFile(storeFile, storeContent.toString(), (err) => { if (err) throw err; });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] New store file was created: ${storeFile}`);

        // Inject import inside main store
        const storeMainFile = path.resolve(path.join(rootDir, 'src/store/index.js'));

        const storeMain = await fs.readFile(storeMainFile, { encoding: 'utf-8' });
        const lines = storeMain.split(/\r?\n/g);
        const renderImportLinesIndex = lines.findIndex(line => line.match(/export default new/));
        lines[renderImportLinesIndex - 4] += `\nimport ${moduleNameCamelCase}Store from '@/modules/${moduleName}/store';`;
        lines[lines.length - 4] += `\n    ${moduleNameCamelCase}Store,`;

        await fs.writeFile(storeMainFile, lines.join('\n'), { encoding: 'utf-8' });
        console.log("\x1b[32m%s\x1b[0m", `[GENERATE] Main store file was updated: ${storeMainFile}`);
      }
    }
  );
};
