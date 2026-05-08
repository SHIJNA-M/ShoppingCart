const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: [path.resolve(__dirname, 'src')],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': path.resolve(__dirname, 'src/components'),
          '@screens':    path.resolve(__dirname, 'src/screens'),
          '@context':    path.resolve(__dirname, 'src/context'),
          '@theme':      path.resolve(__dirname, 'src/theme'),
          '@types':      path.resolve(__dirname, 'src/types'),
          '@utils':      path.resolve(__dirname, 'src/utils'),
          '@navigation': path.resolve(__dirname, 'src/navigation'),
          '@data':       path.resolve(__dirname, 'src/data'),
        },
      },
    ],
  ],
};
