const Linter = require('./');
const FeaturesProvider = require('../features-provider/features-provider');
const ConfigProvider = require('../config-provider');
const RulesProvider = require('../rules-provider');
const RulesParser = require('../rules-parser');
const formatterFactory = require('../formatters/formatter-factory');
const NoConfigurableLinter = require('./no-configurable-linter');
const ConfigurableLinter = require('./configurable-linter');
const Gherkin = require('gherkin');

const linterFactory = ({format, ignore, config, rulesDirs, args}) => {
  const cwd = process.cwd();
  const parser = new Gherkin.Parser();
  const formatter = formatterFactory(format);
  const noConfigurableFileLinter = new NoConfigurableLinter(parser);
  const configurableFileLinter = new ConfigurableLinter(noConfigurableFileLinter);
  const rulesProvider = new RulesProvider({rulesDirs, cwd});
  const rulesParser = new RulesParser(rulesProvider.provide());
  const featuresProvider = new FeaturesProvider(args, {ignore, cwd});
  const configProvider = new ConfigProvider({file: config, cwd});
  const linter = new Linter(
    configProvider,
    rulesParser,
    featuresProvider,
    configurableFileLinter
  );

  return {
    lint() {
      const results = linter.lint();
      const successful = results.isSuccess();
      const failures = successful ? results.getSuccesses() : results.getFailures();
      const errorLines = formatter.format(failures);
      return {
        logType: successful ? 'log' : 'error',
        errorLines,
        exit: errorLines.length > 0 ? 1 : 0,
      };
    },
  };
};

module.exports = linterFactory;
