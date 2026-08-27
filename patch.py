import re

with open('src/views/FriendsView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { \n  Copy",
    "import { GlobalPodiumLeague } from '../components/squad/GlobalPodiumLeague';\nimport { \n  Copy"
)

# Replace the entire global tab
old_block_pattern = r'\{/\* --- GLOBAL RANK TAB --- \*/\}\s*\{activeTab === \'global\' && \(\s*<div className="space-y-4 animate-in slide-in-from-right-4 duration-300">.*?</div>\n\s*</div>\n\s*\)\}'

new_block = """{/* --- GLOBAL RANK TAB --- */}
      {activeTab === 'global' && (
        <div className="w-full max-w-4xl mx-auto">
          <GlobalPodiumLeague />
        </div>
      )}"""

content = re.sub(old_block_pattern, new_block, content, flags=re.DOTALL)

with open('src/views/FriendsView.tsx', 'w') as f:
    f.write(content)
