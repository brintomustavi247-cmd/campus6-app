import re

with open('src/components/squad/GlobalPodiumLeague.tsx', 'r') as f:
    content = f.read()

# Replace 'mb-3' with '-mb-6' in the relative container of avatars to make them overlap
content = content.replace('className="relative mb-3"', 'className="relative -mb-6 z-30"')

# Make the pedestal gradient look more 3D-like, matching the dark vibe
content = content.replace('bg-gradient-to-t from-[#0F111A] to-[#1E2030]', 'bg-gradient-to-t from-[#0F111A] via-[#161825] to-[#1E2030]')
content = content.replace('bg-gradient-to-t from-[#0F111A] to-[#25283D]', 'bg-gradient-to-t from-[#0F111A] via-[#1a1c29] to-[#25283D]')
content = content.replace('bg-gradient-to-t from-[#0F111A] to-[#1A1C29]', 'bg-gradient-to-t from-[#0F111A] via-[#141520] to-[#1A1C29]')

# Adjust the pt-* of the blocks since avatars overlap by 6
content = content.replace('justify-start pt-3"', 'justify-start pt-8"')
content = content.replace('justify-start pt-4"', 'justify-start pt-10"')
content = content.replace('justify-start pt-2"', 'justify-start pt-8"')

with open('src/components/squad/GlobalPodiumLeague.tsx', 'w') as f:
    f.write(content)
