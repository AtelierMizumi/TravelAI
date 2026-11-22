import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Action, ui } from "./ui";
import { isoDay, monthDays } from "@/services/calendar";

export function DateField({ label, value, onChange, min }: { label: string; value: string; onChange: (value: string) => void; min?: string }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
  const year = month.getFullYear(), index = month.getMonth();
  function show() {
    const initial = value || min;
    setMonth(initial ? new Date(`${initial}T12:00:00`) : new Date());
    setOpen(true);
  }
  return <View style={{ gap: 8 }}>
    <Text style={ui.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || "Chọn ngày"}`} onPress={show} style={styles.input}>
      <Text style={ui.text}>{value ? value.split("-").reverse().join("/") : "Chọn ngày trên lịch"}  ▦</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}><View style={styles.panel} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={ui.heading}>{label}</Text>
        <View style={styles.bar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Tháng trước" onPress={() => setMonth(new Date(year, index - 1, 1))} style={styles.arrow}><Text>‹</Text></Pressable>
          <Text style={ui.label}>Tháng {index + 1} năm {year}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Tháng sau" onPress={() => setMonth(new Date(year, index + 1, 1))} style={styles.arrow}><Text>›</Text></Pressable>
        </View>
        <View style={styles.grid}>
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(day => <View key={day} style={styles.cell}><Text style={ui.label}>{day}</Text></View>)}
          {monthDays(year, index).map((day, cell) => {
            const date = day ? isoDay(year, index, day) : "";
            const disabled = !day || (!!min && date < min);
            return <Pressable key={cell} disabled={disabled} accessibilityRole="button" accessibilityLabel={date || "Ngày trống"} accessibilityState={{ disabled, selected: date === value }} onPress={() => { onChange(date); setOpen(false); }} style={[styles.cell, date === value && styles.selected, disabled && { opacity: 0.3 }]}>
              <Text style={{ color: date === value ? "white" : "#142b28" }}>{day || ""}</Text>
            </Pressable>;
          })}
        </View>
        <Action secondary title="Đóng lịch" onPress={() => setOpen(false)} />
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 14, padding: 14, backgroundColor: "white" },
  overlay: { flex: 1, backgroundColor: "#0008", justifyContent: "center", alignItems: "center", padding: 16 },
  panel: { width: "100%", maxWidth: 390, borderRadius: 24, padding: 18, backgroundColor: "white", gap: 14 },
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  arrow: { padding: 12, minWidth: 44, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2857%", minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  selected: { backgroundColor: "#087fba" },
});
