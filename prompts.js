module.exports = [
  {
    name: 'moduleName',
    message: 'What is the name of the new module?',
    type: 'input',
    validate: input => !!input,
    default: 'industry-journey',
  },
  {
    name: 'router',
    message: 'Would you like to generate and update routes?',
    type: 'confirm',
    default: true,
  },
  {
    name: 'store',
    message: 'Would you like to generate and update stores?',
    type: 'confirm',
    default: true,
  }
];