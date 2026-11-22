import { type PropsWithChildren } from "react";
import { type StyleProp, type ViewStyle, View, Platform } from "react-native";

/** Stable surface: no pointer measurement, tilt, scroll coupling or animation. */
export function DepthSurface({ children, style, hoverSurface = false }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; hoverSurface?: boolean }>) {
  return <View style={style} {...(hoverSurface && Platform.OS === "web" ? { dataSet: { hoverSurface: "card" } } : {})}>{children}</View>;
}
