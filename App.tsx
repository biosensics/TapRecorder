import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from "react";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightSensor } from "expo-sensors";
import * as Application from "expo-application";
import { BatteryState, useBatteryLevel, useBatteryState } from "expo-battery";

const StorageAccessFramework = FileSystem.StorageAccessFramework;

interface Tap {
  x: number;
  y: number;
}

export default function App() {
  const [taps, setTaps] = useState<Tap[]>([]);
  const [id, setId] = useState<string>("");
  const [light, setLight] = useState<number>(0);
  const [filePath, setFilePath] = useState<string>("");

  const isWriting = useRef<boolean>(false);
  const rowQueue = useRef<string[]>([]);

  const battery = useBatteryLevel();
  const batteryState = useBatteryState();

  useKeepAwake();

  const initialize = async () => {
    let storedFolder = await AsyncStorage.getItem("externalDirectory");

    if (!storedFolder) {
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync(
          StorageAccessFramework.getUriForDirectoryInRoot("Documents")
        );

      if (permissions.granted) {
        storedFolder = permissions.directoryUri;
        await AsyncStorage.setItem("externalDirectory", storedFolder);
      } else {
        throw new Error("No directory permissions");
      }
    }

    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    );

    const storedID = await AsyncStorage.getItem("id");
    if (storedID) {
      setId(storedID);
    } else {
      const newID = Math.floor(100000 + Math.random() * 900000).toString();
      setId(newID);
      await AsyncStorage.setItem("id", newID);
    }

    const newFilename = `Taps-${Date.now()}.csv`;
    const newFile = await StorageAccessFramework.createFileAsync(
      storedFolder,
      newFilename,
      "text/csv"
    );
    setFilePath(newFile);

    const cols =
      "ID,Time,X,Y,Light,Battery Level,Charging,App Version,Build Number\n";

    await FileSystem.writeAsStringAsync(newFile, cols);
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const lightSub = LightSensor.addListener((data) => {
      setLight(data.illuminance);
    });

    return () => {
      lightSub.remove();
    };
  }, []);

  const handleTap = async (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setTaps((prev) => [...prev, { x: locationX, y: locationY }]);

    const version = Application.nativeApplicationVersion;
    const buildNumber = Application.nativeBuildVersion;
    const batteryStateReadable =
      batteryState === BatteryState.UNKNOWN
        ? "N/A"
        : batteryState === BatteryState.FULL
        ? "FULL"
        : batteryState === BatteryState.CHARGING
        ? "CHARGING"
        : "UNPLUGGED";

    const row = `${id},${Date.now()},${locationX},${locationY},${light},${battery},${batteryStateReadable},${version},${buildNumber}\n`;
    rowQueue.current.push(row);

    writeRows();
  };

  const writeRows = async () => {
    if (isWriting.current) {
      return;
    }

    isWriting.current = true;

    const file = await FileSystem.readAsStringAsync(filePath);
    let newRows = "";

    while (rowQueue.current.length > 0) {
      const row = rowQueue.current.shift();
      newRows += row;
    }

    await FileSystem.writeAsStringAsync(filePath, file + newRows);

    isWriting.current = false;

    if (rowQueue.current.length > 0) {
      writeRows();
    }
  };

  useEffect(() => {}, [rowQueue]);

  return (
    <>
      <Pressable
        pointerEvents="box-only"
        onPress={handleTap}
        style={styles.container}
      >
        <Text onPress={handleTap} style={styles.id}>
          {id}
        </Text>
        {taps.map((tap, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                position: "absolute",
                left: tap.x - 5, // make sure its centered on the tap
                top: tap.y - 5,
              },
            ]}
          />
        ))}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    opacity: 0.7,
  },
  id: {
    position: "absolute",
    bottom: 10,
    right: 10,
    fontSize: 12,
    opacity: 0.6,
  },
});
