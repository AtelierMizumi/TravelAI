import { type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

/** Static ocean shell. Viewer interaction belongs inside the viewer, never on the page. */
export function DepthStage({ children }: PropsWithChildren) {
  return <View style={s.viewport} testID="depth-viewport">
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[s.orbit, s.far]}><View style={s.meridian} /><View style={s.equator} /></View>
      <View style={[s.orbit, s.near]}><View style={s.innerOrbit} /></View>
      <View style={s.horizon} />
    </View>
    <View testID="depth-camera" style={s.camera}>{children}</View>
  </View>;
}

const s = StyleSheet.create({
  viewport: { flex: 1, overflow: "hidden", backgroundColor: "#eaf6ff" },
  camera: { flex: 1 },
  orbit: { position: "absolute", borderWidth: 1, borderColor: "#91cfea", borderRadius: 500 },
  far: { width: 610, height: 610, right: -300, top: -120, backgroundColor: "#d5effc" },
  meridian: { width: "55%", height: "100%", borderRadius: 500, borderWidth: 1, borderColor: "#a5d8ee", alignSelf: "center" },
  equator: { position: "absolute", top: "34%", height: "32%", width: "100%", borderRadius: 500, borderWidth: 1, borderColor: "#a5d8ee" },
  near: { width: 430, height: 430, left: -290, top: "48%", backgroundColor: "#c6eafa", borderWidth: 28, borderColor: "#d9f0fc" },
  innerOrbit: { margin: 36, flex: 1, borderRadius: 500, borderWidth: 2, borderColor: "#99d6f0" },
  horizon: { position: "absolute", top: "72%", left: "12%", width: "80%", height: 1, backgroundColor: "#b5e1f6" },
});
