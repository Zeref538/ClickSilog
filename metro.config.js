// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude problematic directories from file watching
config.watchFolders = [__dirname];

// Block list for directories Metro should ignore
config.resolver = {
  ...config.resolver,
  blockList: [
    // Ignore build directories that cause file watching errors
    /.*\/node_modules\/@react-native\/gradle-plugin\/.*\/build\/.*/,
    /.*\/\.gradle\/.*/,
    /.*\/build\/.*/,
    /.*\/\.cxx\/.*/,
    // Ignore corrupted or inaccessible paths
    /C:\\1\\/,
    /.*\\utils\\$/,
  ],
  sourceExts: [...(config.resolver?.sourceExts || []), 'jsx', 'js', 'ts', 'tsx', 'json'],
};

module.exports = config;

