const rule = 'no-empty-background';

const {getFeatureNodes} = require('../utils/selectors');

const createError = (background) => ({
  type: 'rule',
  message: 'Empty backgrounds are not allowed.',
  rule: rule,
  location: background.location,
});

const noEmptyBackground = (feature) => {
  const children = getFeatureNodes(feature);
  const firstChild = children[0] || {};

  return firstChild.type === 'Background' && firstChild.steps.length === 0
    ? [createError(firstChild)]
    : [];
};

module.exports = {
  name: rule,
  run: noEmptyBackground,
  isValidConfig: () => [],
};
