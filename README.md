# Tap Recorder App

App to record taps on the screen and write them to a file. The most recent tap is highlighted red.

Upon install, the tablet is assigned a unique ID that is displayed on the bottom right of the screen. This ID will persist between launches/updates.

## CSV Format

The CSV file has the following columns:

| ID  | Timestamp | X   | Y   | Light (sensor) | Battery Level | Charging | App Version | Build Number |
| --- | --------- | --- | --- | -------------- | ------------- | -------- | ----------- | ------------ |

## Config

The Mason configuraton can be found in `mason.yml`
