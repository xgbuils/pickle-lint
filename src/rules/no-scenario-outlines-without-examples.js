const rule = 'no-scenario-outlines-without-examples';
const {compose, intoArray} = require('../utils/generic');
const {filter, map} = require('../utils/transducers');
const {getFeatureNodes} = require('../utils/selectors');

const isScenarioOutline = ({type}) => type === 'ScenarioOutline';
const hasNoExamples = ({examples}) => !(examples.length > 0 &&
  examples.some(({tableHeader, tableBody}) => tableHeader && tableBody.length > 0));

const createError = (scenario) => ({
  type: 'rule',
  message: 'Scenario Outline does not have any Examples',
  rule: rule,
  location: scenario.location,
});

const noScenarioOutlinesWithoutExamples = (feature) => {
  return intoArray(compose(
    filter(isScenarioOutline),
    filter(hasNoExamples),
    map(createError)
  ))(getFeatureNodes(feature));
};

module.exports = {
  name: rule,
  run: noScenarioOutlinesWithoutExamples,
  isValidConfig: () => [],
};
