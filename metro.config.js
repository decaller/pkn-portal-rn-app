const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Ensure we explicitly set root for easier resolution
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

module.exports = config;



