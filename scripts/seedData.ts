import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  MOCK_SHG_MEMBERS,
  MOCK_UTTERANCES,
  MOCK_SPOKEN_TRANSACTIONS,
  MOCK_REGISTER_DATA,
  generateRegisterSvg,
} from '../server/services/mockService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Generating fictional seed data for SHG Auditor hackathon demonstration...');

// 1. Fictional members roster
fs.writeFileSync(
  path.join(dataDir, 'fictional_shg_roster.json'),
  JSON.stringify(MOCK_SHG_MEMBERS, null, 2)
);
console.log('✓ Created data/fictional_shg_roster.json (8 fictional members)');

// 2. Fictional meeting dialogue transcript
const scriptText = MOCK_UTTERANCES.map(
  u => `[${Math.floor(u.startMs / 1000)}s - ${Math.floor(u.endMs / 1000)}s] ${u.speakerName || u.speaker}: ${u.text}`
).join('\n\n');

fs.writeFileSync(path.join(dataDir, 'fictional_meeting_script.txt'), scriptText);
console.log('✓ Created data/fictional_meeting_script.txt (Hinglish conversational script with planted corrections)');

// 3. Fictional register structured data
fs.writeFileSync(
  path.join(dataDir, 'example_register_data.json'),
  JSON.stringify(MOCK_REGISTER_DATA, null, 2)
);
console.log('✓ Created data/example_register_data.json');

// 4. Example register SVG image
const svg = generateRegisterSvg(MOCK_REGISTER_DATA);
fs.writeFileSync(path.join(dataDir, 'example_register.svg'), svg);
console.log('✓ Created data/example_register.svg (handwritten notebook layout mockup)');

console.log('\nSeed generation complete! All data is 100% fictional.');
