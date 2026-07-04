# WeekView - Architektur-Dokumentation

## Übersicht

WeekView wurde von einer monolithischen Komponente in spezialisierte, wiederverwendbare Teile aufgeteilt. Die neue Struktur trennt klar zwischen **Logik (Hooks)** und **UI-Komponenten**.

## Struktur

### 📦 Hooks (Business Logic)

#### `useWeekData` - Datenvorbereitung

**Datei:** `src/hooks/useWeekData.ts`

Verwaltet alle datenverwandten Operationen:

- Konvertiert flache Meal-Liste in organisierte Tages-/Typ-Struktur
- Bereitstellung von Helfer-Funktionen zum Abrufen von Mahlzeiten pro Tag
- Berechnung des aktuellen Datums, Wochentage und Indizes

**Exports:**

```typescript
{
  (todayKey, // Heute als formatierter Key
    weekDays, // Array der 7 Wochentage mit Labels
    slots, // Map<dateKey, Map<mealType, meals[]>>
    getMealsForDay(dateKey, type)); // Hole Mahlzeiten für einen Tag/Typ
  getMaxRowsForDay(dateKey); // Maximale Zeilen für einen Tag
  formatDate(date); // Konvertiere Date zu String-Key
}
```

#### `useMealSelection` - Selection & Move-Mode

**Datei:** `src/hooks/useMealSelection.ts`

Verwaltet die Auswahl von Mahlzeiten (zum Verschieben):

- Selektieren/Deselektieren einzelner Mahlzeiten
- Move-Mode aktivieren (wird später für Drag-Drop verwendet)
- Prüfung, ob Mahlzeit ausgewählt ist

**Exports:**

```typescript
{
  (selectedMealId, // ID der ausgewählten Mahlzeit
    isMoveMode, // Boolean: Sind wir im Move-Mode?
    selectMealForMove(mealId)); // Wähle Mahlzeit aus
  deselectMeal(); // Deselektiere
  toggleMealSelection(mealId); // Toggle select/deselect
  isMealSelected(mealId); // Prüfe ob ausgewählt
}
```

---

### 🎨 UI-Komponenten

#### `MealSlot` - Einzelner Mahlzeiten-Slot

**Datei:** `src/components/screens/MealSlot.tsx`

Stellt einen einzelnen Mahlzeiten-Slot dar (Lunch oder Dinner):

- Zeigt MealCard oder leeren Slot an
- Behandelt Presses (Navigation, Selection)
- Visuelles Feedback im Move-Mode

**Props:**

```typescript
{
  meal?: Meal                          // Mahlzeiten-Daten (optional)
  isSelected: boolean                  // Ist diese Mahlzeit ausgewählt?
  isMoveMode: boolean                  // Sind wir im Move-Mode?
  onLongPress: (mealId: string) => void // Long-Press Handler
  onPress: (mealId: string) => void    // Press Handler
}
```

#### `WeekViewDay` - Eine Tagesreihe

**Datei:** `src/components/screens/WeekViewDay.tsx`

Eine einzelne Reihe mit Datum und zwei Meal-Slots:

- Zeigt Wochentag (nur in Reihe 0)
- Lunch- und Dinner-Slots nebeneinander
- Plus-Button (für zukünftige "Add Meal" Funktionalität)

**Props:**

```typescript
{
  dateKey: string                           // Formatiertes Datum
  label: string                             // "Mo", "Di", etc.
  isToday: boolean                          // Ist heute?
  slotIndex: number                         // Index der Reihe (0, 1, 2...)
  lunchMeal?: Meal                          // Mahlzeit in diesem Slot
  dinnerMeal?: Meal
  selectedMealId: string | null             // Aktuell ausgewählte Mahlzeit
  isMoveMode: boolean
  onMealLongPress: (mealId: string) => void
  onMealPress: (mealId: string) => void
}
```

#### `WeekViewHeader` - Kopfzeile

**Datei:** `src/components/screens/WeekViewHeader.tsx`

Zeigt den Header mit:

- Sun-Icon + "Mittagessen"
- Moon-Icon + "Abendessen"

Keine Props erforderlich.

#### `WeekViewContainer` - ScrollView Wrapper

**Datei:** `src/components/screens/WeekViewContainer.tsx`

Stellt einen ScrollView mit RefreshControl bereit:

- Scrollable Content
- Pull-to-Refresh
- Korrekte Padding-Anpassung für Android/iOS

**Props:**

```typescript
{
  children: ReactNode
  refreshing: boolean
  onRefresh: () => void
}
```

#### `WeekView` - Main Component

**Datei:** `src/components/screens/WeekView.tsx`

Die Haupt-Komponente, die alles zusammenführt:

- Orchestriert die Hooks
- Rendert Header + Woche mit Tagen
- Verwaltet Props-Passing zu Sub-Komponenten

**Props:**

```typescript
{
  meals?: Meal[]
  weekStart: Date
  refreshing: boolean
  onRefresh: () => void
}
```

---

## Verwendungsbeispiel

```tsx
import WeekView from "@/components/screens/WeekView";

export default function MyScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Lade Daten...
    setRefreshing(false);
  };

  return (
    <WeekView
      meals={mealsData}
      weekStart={new Date()}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}
```

---

## Erweiterbarkeit

### Szenario 1: Drag-Drop Verschieben hinzufügen

1. Erweitere `useMealSelection`:

```typescript
const moveMeal = (fromDateKey, toDateKey, mealId) => {
  // API Call
};
```

2. Passe `MealSlot` an (Drop-Zone Handling):

```typescript
const handleDropOnSlot = (draggedMealId) => {
  onMealDrop?.(draggedMealId, dateKey);
};
```

3. WeekView nutzt die neue Funktion:

```typescript
onMealDrop={(mealId, targetDateKey) => {
  moveMeal(selectedMealId, targetDateKey, mealId);
}}
```

### Szenario 2: "Mahlzeit hinzufügen" Button

1. Erstelle neue Komponente `AddMealButton`:

```tsx
export default function AddMealButton({ dateKey, mealType }: any) {
  return <Pressable onPress={() => openMealPicker(dateKey, mealType)} />;
}
```

2. Nutze in `WeekViewDay`:

```tsx
{
  !lunchMeal && <AddMealButton dateKey={dateKey} mealType="lunch" />;
}
```

### Szenario 3: Globale Filter/Suche

1. Erweitere `useWeekData`:

```typescript
const filteredSlots = useMemo(() => {
  return applyFilter(slots, filterCriteria);
}, [slots, filterCriteria]);
```

2. Übergebe gefilterte Daten weiter

---

## Best Practices

✅ **Logik in Hooks halten** - Verwende Custom Hooks für komplexe Zustandsverwaltung  
✅ **Props klar typisieren** - Interfaces für alle Komponenten-Props  
✅ **Komponenten klein halten** - Eine Verantwortung pro Komponente  
✅ **Styles lokal** - StyleSheet innerhalb der Komponente  
✅ **Callbacks benennen** - `onMealPress`, `onMealLongPress`, etc.

---

## Testing

Jede Komponente/Hook kann isoliert getestet werden:

```typescript
// Test: useWeekData
test("getMealsForDay returns correct meals", () => {
  const meals = [...];
  const { getMealsForDay } = renderHook(() => useWeekData(meals, startDate));
  expect(getMealsForDay("2024-01-01", "lunch")).toHaveLength(2);
});

// Test: MealSlot
test("MealSlot shows MealCard when meal exists", () => {
  render(<MealSlot meal={mockMeal} ... />);
  expect(screen.getByTestId("meal-card")).toBeTruthy();
});
```

---

## Migration vom alten Code

Falls alte Code-Stellen WeekView direkt verwenden:

- Die Props sind gleich geblieben → **keine Migration nötig**
- Internal Struktur hat sich nur geändert
- Alle Features funktionieren wie zuvor
