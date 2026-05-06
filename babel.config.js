module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@context': './src/context',
          '@theme': './src/theme',
          '@types': './src/types',
          '@utils': './src/utils',
          '@navigation': './src/navigation',
          '@data': './src/data',
        },
      },
    ],
  ],
};
