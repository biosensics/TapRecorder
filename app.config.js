/**
 * This pulls the `./app.json` file and adds any additional config to it.
 * Add any additional config here. Useful for adding dynamic values to the app.
 */
export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      versionCode: process.env.VERSION_CODE,
    },
  };
};
