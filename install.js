module.exports = (api) => {
  api.extendPackageJson({
    scripts: {
      'generate': 'vue-cli-service generate'
    }
  });

  console.log(' ');
  console.log(' ');
  console.log('------------------------------------');
  console.log('To see the options, just run: npx vue-cli-service generate --help');
  console.log('How to use: npx vue-cli-service generate --name module-name --route true|false --store true|false');
  console.log('------------------------------------');
  console.log(' ');
  console.log(' ');
};