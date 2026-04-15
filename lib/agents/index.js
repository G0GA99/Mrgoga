// G0GA Team — Complete Agent System
// Import this file to access any agent or developer

export { AGENT as ALEX } from './alex.js'
export { AGENT as NOVA } from './nova.js'
export { AGENT as KAI }  from './kai.js'
export { AGENT as ZION } from './zion.js'
export { AGENT as ZARA } from './zara.js'

export {
  DEVELOPERS,
  getDeveloper,
  getAllDevelopers,
  assignDeveloper,
} from './developers.js'

// Full team roster for display/dashboard
export const TEAM = {
  management: [
    { name: 'MrGoga', role: 'CEO & Founder',        status: 'online', type: 'human' },
    { name: 'Alex',          role: 'Sales Consultant',      status: 'online', type: 'agent' },
    { name: 'Nova',          role: 'Marketing Manager',     status: 'online', type: 'agent' },
    { name: 'Zara',          role: 'Project Manager',       status: 'online', type: 'agent' },
    { name: 'Kai',           role: 'SEO Specialist',        status: 'online', type: 'agent' },
    { name: 'Zion',          role: 'Content Creator',       status: 'online', type: 'agent' },
  ],
  developers: [
    { name: 'Orion',  role: 'Full Stack Developer',         status: 'available', type: 'agent', stack: 'React · Node.js · APIs' },
    { name: 'Cypher', role: 'AI & ML Engineer',             status: 'available', type: 'agent', stack: 'Python · LangChain · Groq' },
    { name: 'Blaze',  role: 'UI/UX & Frontend',             status: 'available', type: 'agent', stack: 'Figma · React · Three.js' },
    { name: 'Atlas',  role: 'DevOps & Cloud',               status: 'available', type: 'agent', stack: 'Vercel · AWS · Docker' },
    { name: 'Rex',    role: 'Blockchain & Web3',            status: 'available', type: 'agent', stack: 'Solidity · Ethereum · NFT' },
  ],
}
