const enablingSettings = ['on', 'off'];
const {Successes, Failures} = require('./successes-failures');
const RuleCommand = require('./rule-command');

function isValidEnablingSetting(enablingSetting) {
  return enablingSettings.indexOf(enablingSetting) !== -1;
}

function normalizeRule(rules, config, ruleName) {
  const rule = rules[ruleName];
  const ruleConfig = config[ruleName];
  if (!rule) {
    return Failures.of([{
      type: 'undefined-rule',
      message: `Rule "${ ruleName }" does not exist`,
    }]);
  } else if (Array.isArray(ruleConfig)) {
    if (!isValidEnablingSetting(ruleConfig[0])) {
      return Failures.of([{
        type: 'config-rule-error',
        message: 'The first part of config should be "on" or "off"',
      }]);
    }

    if (ruleConfig.length != 2 ) {
      return Failures.of([{
        type: 'config-rule-error',
        message: 'The config should only have 2 parts.',
      }]);
    }
    const errorList = rule.isValidConfig(config);
    errorList.forEach((error) => error.type = 'config-rule-error');
    if (errorList.length > 0) {
      return Failures.of(errorList);
    } else if (ruleConfig[0] === 'off') {
      return Successes.of([]);
    }
    return Successes.of([new RuleCommand({
      name: rule.name,
      run: rule.run,
      init: rule.init,
      config: ruleConfig[1],
      suppressOtherRules: rule.suppressOtherRules,
    })]);
  } else {
    if (!isValidEnablingSetting(ruleConfig)) {
      return Failures.of([{
        type: 'config-rule-error',
        message: 'config should be "on" or "off"',
      }]);
    } else if (ruleConfig === 'off') {
      return Successes.of([]);
    }
    return Successes.of([new RuleCommand({
      name: rule.name,
      run: rule.run,
      init: rule.init,
      suppressOtherRules: rule.suppressOtherRules,
    })]);
  }
}

function RuleParser(rules) {
  this.rules = rules;
}

RuleParser.prototype.parse = function(config) {
  const {rules} = this;
  const result = Object.keys(config).reduce(function(result, ruleName) {
    return result.append(normalizeRule(rules, config, ruleName));
  }, Successes.of([]));
  return result.isSuccess()
    ? result
    : Failures.of({
      type: 'config-error',
      message: 'Error(s) in configuration file:',
      errors: result.getFailures(),
    });
};

module.exports = RuleParser;
