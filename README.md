# Tap Recorder App

App to record taps on the screen and write them to a file. The most recent tap is highlighted red.

Upon install, the tablet is assigned a unique ID that is displayed on the bottom right of the screen. This ID will persist between launches/updates.

## CSV Format

The CSV file has the following columns:

| ID  | Timestamp | X   | Y   | Light (sensor) | Battery Level | Charging | App Version | Build Number |
| --- | --------- | --- | --- | -------------- | ------------- | -------- | ----------- | ------------ |

## Config

The Mason configuraton can be found in `mason.yml`

## Running

### Pre-requisites

- [Node.js](https://nodejs.org/en/)
- [Expo CLI ](https://docs.expo.dev/more/expo-cli/)
- [Yarn](https://yarnpkg.com/)

### Install dependencies

```bash
yarn
```

### Run the app

```bash
yarn expo start --android
```

- The app will open in the Expo Go app on your device.
- You may need to open the Expo Go App and scan the QR code to open the app.
- Your device and computer must be on the same network.
- Files are written to the external directory that is chosen initial app launch and can be easily accessed
