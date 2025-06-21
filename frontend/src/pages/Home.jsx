import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

/********************
 * Helper utilities *
 ********************/
const lbToKg = (lb) => lb / 2.205;
const inchToCm = (inch) => inch * 2.54;

export function calcRanges({ weightLbs, heightInches, age, gender, activityFactor, phase }) {
  const W = lbToKg(Number(weightLbs)); // kg
  const H = inchToCm(Number(heightInches)); // cm
  const A = Number(age);
  const AF = Number(activityFactor);
  const Goal = phase;

  // --- Energy requirements ---
  const BMR = 10 * W + 6.25 * H - 5 * A + (gender === "male" ? 5 : -161);
  const TDEE = BMR * AF;
  const Cal = TDEE * { maintenance: 1, bulk: 1.1, cut: 0.8 }[Goal];

  // --- Macro ranges (g) ---
  // Protein (g/kg)
  const P_RANGE = Goal === "cut" ? [2.2, 2.6] : Goal === "bulk" ? [1.6, 2.0] : [1.6, 2.2];
  const proteinMin = P_RANGE[0] * W;
  const proteinMax = P_RANGE[1] * W;

  // Fat (g/kg)
  const F_RANGE = Goal === "cut" ? [0.6, 0.8] : [0.8, 1.0];
  const fatMin = F_RANGE[0] * W;
  const fatMax = F_RANGE[1] * W;

  // Carbs fill remaining kcal (4 cal per g)
  const carbMin = Math.max(0, (Cal - proteinMax * 4 - fatMax * 9) / 4);
  const carbMax = Math.max(0, (Cal - proteinMin * 4 - fatMin * 9) / 4);

  return {
    calories: { min: Cal * 0.95, max: Cal * 1.05 },
    protein: { min: proteinMin, max: proteinMax },
    fats: { min: fatMin, max: fatMax },
    carbs: { min: carbMin, max: carbMax },
  };
}

/************************
 * Global app contexts  *
 ************************/
const SettingsContext = React.createContext();

/********************
 * Dashboard screen *
 ********************/
function ProgressBar({ label, consumed, range, unit }) {
  const pct = Math.min(100, (consumed / range.max) * 100);
  const marker = (range.min / range.max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {Math.round(consumed)} / {Math.round(range.min)}–{Math.round(range.max)} {unit}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-300">
        <div style={{ width: `${pct}%` }} className="absolute h-3 rounded-full bg-green-500" />
        <div style={{ left: `${marker}%` }} className="absolute h-3 w-1 bg-black/70" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { ranges, intake } = React.useContext(SettingsContext);

  return (
    <div className="p-4 pb-16 space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <ProgressBar label="Calories" unit="kcal" consumed={intake.calories} range={ranges.calories} />
      <ProgressBar label="Protein" unit="g" consumed={intake.protein} range={ranges.protein} />
      <ProgressBar label="Carbs" unit="g" consumed={intake.carbs} range={ranges.carbs} />
      <ProgressBar label="Fats" unit="g" consumed={intake.fats} range={ranges.fats} />
    </div>
  );
}

/********************
 * Settings screen  *
 ********************/
function Settings() {
  const { settings, setSettings } = React.useContext(SettingsContext);
  const [local, setLocal] = useState(settings);
  const navigate = useNavigate();

  const handleChange = (e) => setLocal({ ...local, [e.target.name]: e.target.value });

  const save = () => {
    setSettings(local);
    localStorage.setItem("userSettings", JSON.stringify(local));
    navigate("/");
  };

  return (
    <div className="p-4 pb-16 space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <input name="heightInches" type="number" placeholder="Height (in)" value={local.heightInches} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="weightLbs" type="number" placeholder="Weight (lbs)" value={local.weightLbs} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="age" type="number" placeholder="Age" value={local.age} onChange={handleChange} className="w-full p-2 border rounded" />
      <select name="gender" value={local.gender} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <select name="activityFactor" value={local.activityFactor} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="1.2">Sedentary (1.2)</option>
        <option value="1.375">Light (1.375)</option>
        <option value="1.55">Moderate (1.55)</option>
        <option value="1.725">Active (1.725)</option>
        <option value="1.9">Very Active (1.9)</option>
      </select>
      <select name="phase" value={local.phase} onChange={handleChange} className="w-full p-2 border rounded">
        <option value="maintenance">Maintenance</option>
        <option value="cut">Cut</option>
        <option value="bulk">Bulk</option>
      </select>
      <button onClick={save} className="w-full p-2 text-white bg-blue-600 rounded">Save</button>
    </div>
  );
}

/************************
 * Bottom navigation UI *
 ************************/
function BottomNav() {
  const location = useLocation();
  const items = [
    { to: "/", label: "Dashboard" },
    { to: "/settings", label: "Settings" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-white shadow-inner">
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className={`flex-1 py-3 text-center ${location.pathname === i.to ? "font-bold" : "text-gray-600"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

/******************
 * Main App shell *
 ******************/
export default function App() {
  const defaultSettings =
    JSON.parse(localStorage.getItem("userSettings")) || {
      heightInches: 70,
      weightLbs: 180,
      age: 30,
      gender: "male",
      activityFactor: 1.55,
      phase: "maintenance",
    };

  const [settings, setSettings] = useState(defaultSettings);
  const [intake, setIntake] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  const ranges = React.useMemo(() => calcRanges(settings), [settings]);

  const ctxValue = { settings, setSettings, ranges, intake, setIntake };

  return (
    <SettingsContext.Provider value={ctxValue}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </Router>
    </SettingsContext.Provider>
  );
}