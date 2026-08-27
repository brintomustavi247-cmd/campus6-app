const fs = require('fs');

let code = fs.readFileSync('src/components/FocusTimer.tsx', 'utf8');

// Replace imports
code = code.replace(
  "import { usePresence } from '../contexts/PresenceContext';",
  "import { usePresence } from '../contexts/PresenceContext';\nimport { useGlobalTimer } from '../contexts/TimerContext';"
);

// Replace state variables with useGlobalTimer inside FocusTimer
const target = `  const { startFocus, stopFocus } = usePresence();

  const [mode, setMode] = useState<'2min' | '25min' | '5min' | '50min' | '15min' | 'custom' | 'infinity'>('25min');
  const [minutes, setMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [topicName, setTopicName] = useState<string>(initialTopic);`;

const replacement = `  const { startFocus, stopFocus } = usePresence();
  
  const { isRunning, secondsLeft, mode, topicName, setTopicName: setGlobalTopic, setMode: setGlobalMode, startTimer, pauseTimer, stopTimer } = useGlobalTimer();

  const [minutes, setMinutes] = useState<number>(25);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [customMins, setCustomMins] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when mode changes
  const handleModeChange = (newMode: '2min' | '25min' | '5min' | '50min' | '15min' | 'custom' | 'infinity') => {
    stopFocus(); // Reset global presence
    if (newMode === 'infinity') {
      setMinutes(0);
      setGlobalMode(newMode, 0);
    } else {
      let duration = 25;
      if (newMode === '2min') duration = 2;
      if (newMode === '5min') duration = 5;
      if (newMode === '50min') duration = 50;
      if (newMode === '15min') duration = 15;
      if (newMode === 'custom') duration = customMins;
      setMinutes(duration);
      setGlobalMode(newMode, duration * 60);
    }
  };
`;

code = code.replace(target, replacement);

// We need to remove these lines since we already defined them above:
code = code.replace("  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);", "");
code = code.replace("  const [quoteIndex, setQuoteIndex] = useState<number>(0);", "");
code = code.replace("  const [customMins, setCustomMins] = useState<number>(30);", "");
code = code.replace("  const timerRef = useRef<NodeJS.Timeout | null>(null);", "");

// Let's replace the whole handleModeChange that was already there
code = code.replace(`  // Synchronize when mode changes
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setIsRunning(false);
    stopFocus(); // Reset global presence
    if (newMode === 'infinity') {
      setMinutes(0);
      setSecondsLeft(0);
    } else {
      let duration = 25;
      if (newMode === '2min') duration = 2;
      if (newMode === '5min') duration = 5;
      if (newMode === '50min') duration = 50;
      if (newMode === '15min') duration = 15;
      if (newMode === 'custom') duration = customMins;
      setMinutes(duration);
      setSecondsLeft(duration * 60);
    }
  };`, "");

// Remove old timer useEffect
const oldEffectRegex = /\/\/ Timer effect[\s\S]*?\}, \[isRunning, mode\]\);/g;
code = code.replace(oldEffectRegex, "// Timer handled globally");

// Replace toggleTimer
code = code.replace(`  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      stopFocus('break');
    } else {
      setIsRunning(true);
      startFocus(topicName || 'সাধারণ পড়া');
    }
  };`, `  const toggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      let duration = 25;
      if (mode === '2min') duration = 2;
      if (mode === '5min') duration = 5;
      if (mode === '50min') duration = 50;
      if (mode === '15min') duration = 15;
      if (mode === 'custom') duration = customMins;
      startTimer(mode, topicName || 'সাধারণ পড়া', mode === 'infinity' ? secondsLeft : secondsLeft > 0 ? secondsLeft : duration * 60);
    }
  };`);

// Replace resetTimer
code = code.replace(`  const resetTimer = () => {
    setIsRunning(false);
    stopFocus();
    
    if (mode === 'infinity') {
      setSecondsLeft(0);
    } else {
      setSecondsLeft(minutes * 60);
    }
  };`, `  const resetTimer = () => {
    stopTimer();
    if (mode === 'infinity') {
      setGlobalMode(mode, 0);
    } else {
      setGlobalMode(mode, minutes * 60);
    }
  };`);

// Replace setTopicName inline
code = code.replace(
  "setTopicName(e.target.value);\n            // If already running, update the global task name too\n            if (isRunning) {\n              startFocus(e.target.value || 'সাধারণ পড়া');\n            }",
  "setGlobalTopic(e.target.value);"
);

fs.writeFileSync('src/components/FocusTimer.tsx', code);
