const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    newArchEnabled: false,
    extra: {
      eas: {
        projectId: "d9016599-ff06-4355-a93f-383efb7ff1a1"
      }
    }
  },
};