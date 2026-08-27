import re

with open('src/components/squad/GlobalPodiumLeague.tsx', 'r') as f:
    content = f.read()

# Update Mock Data to better fit the app theme (but matching layout exactly)
new_mock_data = """const MOCK_GLOBAL_LEADERBOARD = [
  { id: 'g1', name: 'FaisalX', subtitle: 'Grandmaster', rank: 1, hours: '14:15', avatar: 'F' },
  { id: 'g2', name: 'NovaStar', subtitle: 'Master I', rank: 2, hours: '13:02', avatar: 'N' },
  { id: 'g3', name: 'Proton_BUET', subtitle: 'Diamond I', rank: 3, hours: '12:50', avatar: 'P' },
  { id: 'g4', name: 'ShadowKnight', subtitle: 'Magic Kingdom', rank: 4, hours: '03:29', avatar: 'S' },
  { id: 'g5', name: 'Zayan F.', subtitle: 'Ranked Competitor', rank: 5, hours: '03:09', avatar: 'Z' },
  { id: 'g6', name: 'Rahim M.', subtitle: 'Division II', rank: 6, hours: '03:45', avatar: 'R' },
  { id: 'g7', name: 'Sarah K.', subtitle: 'Division II', rank: 7, hours: '03:45', avatar: 'S' },
  { id: 'g8', name: 'Nadia S.', subtitle: 'Challenger', rank: 8, hours: '03:02', avatar: 'N' },
];"""

content = re.sub(r'const MOCK_GLOBAL_LEADERBOARD = \[.*?\];', new_mock_data, content, flags=re.DOTALL)

with open('src/components/squad/GlobalPodiumLeague.tsx', 'w') as f:
    f.write(content)
