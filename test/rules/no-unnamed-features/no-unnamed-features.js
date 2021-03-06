const ruleName = 'no-unnamed-features';
const ruleTestBase = require('../rule-test-base');
const rule = require('../../../src/rules/no-unnamed-features.js');
const runTest = ruleTestBase.createRuleTest(rule, () => 'Missing Feature name');

describe('No Unnamed Features Rule', function() {
  it('doesn\'t raise errors when there are no violations', function() {
    runTest('no-unnamed-features/NoViolations.feature', {}, []);
  });

  it('detects errors for scenarios, and scenario outlines', function() {
    runTest('no-unnamed-features/Violations.feature', {}, [{
      location: {
        line: 3,
        column: 4,
      },
      rule: ruleName,
      messageElements: {},
    }]);
  });
});
