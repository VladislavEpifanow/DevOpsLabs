module.exports = {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { 
        runtime: 'automatic',
        importSource: '@emotion/react' // Добавляем поддержку Emotion для MUI
      }],
      '@babel/preset-typescript'
    ],
    plugins: ['@emotion/babel-plugin'] // Важно для корректной работы MUI
  };