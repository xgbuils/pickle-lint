const assert = require('chai').assert;
const RulesParser = require('../src/rules-parser.js');

const rulesProvider = {
  provide() {
    return {
      'indentation': require('../src/rules/indentation'),
      'new-line-at-eof': require('../src/rules/new-line-at-eof'),
      'no-files-without-scenarios': require('../src/rules/no-files-without-scenarios'),
      'no-multiple-empty-lines': require('../src/rules/no-multiple-empty-lines'),
      'no-trailing-spaces': require('../src/rules/no-trailing-spaces'),
    };
  },
};

const hasRules = function(rulesOrErrors, expectedRules) {
  if (!rulesOrErrors.isSuccess()) {
    assert.fail(`Expected no errors. Found: ${ rulesOrErrors.errors}`);
  }
  const rules = rulesOrErrors.getSuccesses().map(function(rule) {
    return {
      name: rule.name,
      config: rule.config,
    };
  });
  assert.deepEqual(rules, expectedRules);
};

const hasErrors = function(rulesOrErrors, expectedErrors) {
  if (rulesOrErrors.isSuccess()) {
    assert.fail('Expected errors but not found');
  }
  assert.deepEqual(rulesOrErrors.getFailures(), {
    type: 'config-error',
    message: 'Error(s) in configuration file:',
    errors: expectedErrors,
  });
};

describe('Rule Parser', function() {
  context('When there are rules enabled and disabled', function() {
    it('return the list of enabled rules', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide()).parse({
        'no-files-without-scenarios': 'on',
        'no-multiple-empty-lines': 'off',
        'no-trailing-spaces': 'on',
      });
      hasRules(rulesOrErrors, [{
        name: 'no-files-without-scenarios',
        config: {},
      }, {
        name: 'no-trailing-spaces',
        config: {},
      }]);
    });
  });

  context('when the rule has enabled array configuration', function() {
    it('the rule has the configuration defined in second array item', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide()).parse({
        'new-line-at-eof': ['on', 'yes'],
      });
      hasRules(rulesOrErrors, [{
        name: 'new-line-at-eof',
        config: 'yes',
      }]);
    });
  });

  context('when the rule has disabled array configuration', function() {
    it('the rule is not returned', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide()).parse({
        'indentation': ['off', {
          'Feature': 1,
          'Background': 1,
          'Scenario': 1,
          'Step': 1,
          'given': 1,
          'and': 1,
        }],
      });
      hasRules(rulesOrErrors, []);
    });
  });

  describe('Verification fails when', function() {
    it('a non existing rule', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide()).parse({'fake-rule': 'on'});
      hasErrors(rulesOrErrors, [{
        type: 'undefined-rule',
        message: 'Rule "fake-rule" does not exist',
      }]);
    });

    it('first item is not "on" or "off"', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide())
        .parse({'indentation': ['yes', {}]});
      hasErrors(rulesOrErrors, [{
        type: 'config-rule-error',
        message: 'The first part of config should be "on" or "off"',
      }]);
    });

    it('array config does not have 2 items', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide())
        .parse({'indentation': ['on', {}, 2]});
      hasErrors(rulesOrErrors, [{
        type: 'config-rule-error',
        message: 'The config should only have 2 parts.',
      }]);
    });

    it('a non existing rule sub-config', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide()).parse({
        'indentation': ['on', {'featur': 0}],
        'new-line-at-eof': ['on', 'y'],
      });
      hasErrors(rulesOrErrors, [{
        type: 'config-rule-error',
        rule: 'indentation',
        message: 'The rule does not have the specified configuration option "featur"',
      }, {
        type: 'config-rule-error',
        rule: 'new-line-at-eof',
        message: 'The rule does not have the specified configuration option "y"',
      }]);
    });

    it('string config is not "on" or "off"', function() {
      const rulesOrErrors = new RulesParser(rulesProvider.provide())
        .parse({'indentation': 'no'});
      hasErrors(rulesOrErrors, [{
        type: 'config-rule-error',
        message: 'config should be "on" or "off"',
      }]);
    });
  });
});

