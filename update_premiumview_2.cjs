const fs = require('fs');

let code = fs.readFileSync('src/views/ProfilePremiumView.tsx', 'utf8');

const target = `}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');

  return (
    <div className="profile-premium w-full max-w-full overflow-x-hidden px-4 sm:px-5 pb-24">`;

const replacement = `}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');
  const [dbUser, setDbUser] = useState<UserDocument | null>(null);

  useEffect(() => {
    if (!auth?.currentUser || !db) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setDbUser(snap.data() as UserDocument);
      }
    });
    return () => unsub();
  }, []);

  const xp = dbUser?.xp || 0;
  const level = dbUser?.level || 1;
  const tier = dbUser?.tier || 'BRONZE I';
  const studyHours = Math.floor((dbUser?.studyTime || 0) / 60);

  return (
    <div className="profile-premium w-full max-w-5xl mx-auto overflow-x-hidden px-4 sm:px-5 pb-24">`;

code = code.replace(target, replacement);
fs.writeFileSync('src/views/ProfilePremiumView.tsx', code);
