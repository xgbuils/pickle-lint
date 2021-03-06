const fs = require('fs');
const defaults = require('./defaults');
const getPath = require('./utils/get-path');
const {Successes, Failures} = require('./successes-failures');

class ConfigProvider {
  constructor({file, cwd}) {
    this.cwd = cwd;
    if (file) {
      this.fileName = file;
      this.message = `Could not find specified config file "${file}"`;
    } else {
      this.fileName = defaults.config;
      this.message = `Could not find default config file "${defaults.config}" ` +
        'in the working directory.\nTo use a custom name/path provide the config ' +
        'file using the "-c" arg.';
    }
  }

  provide() {
    const {fileName, message, cwd} = this;
    const configPath = getPath(cwd, fileName);
    if (!fs.existsSync(configPath)) {
      return Failures.of({
        type: 'config-error',
        message,
      });
    }

    try {
      return Successes.of(JSON.parse(fs.readFileSync(configPath)));
    } catch (e) {
      return Failures.of({
        type: 'config-error',
        message: e.toString(),
      });
    }
  }
}

module.exports = ConfigProvider;
