import { REPO_COUNT } from './lib/build'

export const profile = {
  name: "Ihya' Nashirudin Abrar",
  email: 'ihyakpati1144@gmail.com',
  github: 'https://github.com/ihyaabrar',
  linkedin: 'https://www.linkedin.com/in/ihya-nashirudin-abrar-9978a6243/',
  instagram: 'https://www.instagram.com/ihyaabrar/',
  orcid: 'https://orcid.org/0009-0004-3993-3585',
  orcidId: '0009-0004-3993-3585',
}

type Track = 'work' | 'edu' | 'res' | 'org'

export const content = {
  nav: { about: 'About', projects: 'Projects', research: 'Research', education: 'Education', experience: 'Experience', contact: 'Contact', menu: 'Menu', close: 'Close', skip: 'Skip to content', toDark: 'Switch to dark theme', toLight: 'Switch to light theme' },
  hero: {
    titleA: 'I build small, useful products ',
    titleB: 'and measure whether they work.',
    body: 'Developer in Pontianak. I ship web and mobile apps, browser extensions and data research, and I am in my third semester of the Master of Informatics at Universitas Ahmad Dahlan.',
    ctaPrimary: 'See my projects',
    status: 'Open to freelance projects, taken on at a relaxed pace while I focus on research.',
    ctaSecondary: 'Download CV',
    hint: 'Drag the card and let go to toss it. Double-click or double-tap to see the back.',
    flip: 'Flip the ID card',
    failed: 'The interactive card could not load on this device, so this one is a still image.',
  },
  card: { sub: 'Master of Informatics student, UAD', location: 'Pontianak, Indonesia' },
  about: {
    title: 'About',
    lead: 'I started in 2018 laying out a magazine, then moved into frontend work, IT support at a clinic and teaching kids to code. Most of what I build now is health-tech and point of sale.',
    facts: [
      { value: String(REPO_COUNT), label: 'public repositories', href: 'https://github.com/ihyaabrar?tab=repositories' },
      { value: '2', label: 'journal papers', href: '#research' },
      { value: '2018', label: 'first job, magazine layout', href: '#experience' },
    ],
    nowTitle: 'Right now',
    now: [
      { k: 'Researching', v: 'Safety-gated checkpoint selection for medical language models. Preregistered, code private until publication.' },
      { k: 'Exploring', v: 'On-device AI: browser extensions, local-first desktop apps, camera-driven interfaces.' },
    ],
  },
  projects: {
    title: 'Projects',
    body: 'Six picked from GitHub. The first one is live and in daily use.',
    admit: 'Admit one',
    live: 'Live',
    openLive: 'Open the live site',
    source: 'Source on GitHub',
    also: 'Also on GitHub: Catetin, Scanin Lah, SuperPDF, Planer, Territory Runner, Coffee Shop CCTV Analytics, AutoML.',
    all: `All ${REPO_COUNT} repositories`,
  },
  research: {
    title: 'Research',
    body: 'At UAD I study machine learning on health data: which models predict whether patients keep taking their medication, and whether a language model can prepare clinical data as well as a person. Two papers are out in Jurnal Sisfokom; one is submitted to IJEEEMI.',
    published: 'Published',
    submission: 'Submitted',
    read: 'Read the paper',
    notebooks: 'See the notebooks',
  },
  education: {
    title: 'Education',
    body: 'Two degrees in informatics, and the courses I took along the way.',
    coursesTitle: 'Courses and certificates',
    logoPending: 'Logo to come',
  },
  experience: {
    title: 'Experience',
    body: 'Work and organisation, newest first.',
    now: 'Current',
    tracks: { work: 'Work', edu: 'Study', res: 'Research', org: 'Organisation' } as Record<Track, string>,
  },
  tools: {
    title: 'Tools I use',
    groups: ['Web and mobile', 'Data and AI', 'Databases and deployment'],
  },
  contact: {
    title: 'Get your pass',
    body: 'I take on freelance work in health-tech, data analysis and applied AI, at a relaxed pace while I focus on research.',
    cv: 'Download my CV (PDF)',
    email: 'Email',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy. Select the address instead.',
  },
  footer: 'Small progress is still progress.',
}

export type Dict = typeof content

type Project = { name: string; cat: string; url: string; live?: string; desc: string; stack: string[] }

// Order carries the hierarchy: 01 is the only product in daily use, 02 and 03 are the health and
// computer-vision flagships, the rest are smaller tools.
export const projects: Project[] = [
  {
    name: 'Gerai BKMT',
    cat: 'Point of sale, web',
    live: 'https://gerai-bkmt.vercel.app',
    url: 'https://github.com/ihyaabrar/Gerai_BKMT',
    desc: 'Point of sale, inventory, profit sharing and a public storefront for PD BKMT Kubu Raya.',
    stack: ['Next.js 14', 'Prisma', 'Tailwind'],
  },
  {
    name: 'MediCode',
    cat: 'Health-tech, browser extension',
    url: 'https://github.com/ihyaabrar/MediCode',
    desc: 'Looks up ICD-10 and ICD-9 codes and estimates INA-CBG tariffs while health workers fill in their forms.',
    stack: ['React', 'TypeScript', 'Dexie'],
  },
  {
    name: 'VisionPOS',
    cat: 'Computer vision, point of sale',
    url: 'https://github.com/ihyaabrar/VisionPOS',
    desc: 'A cashier that recognises products through the camera instead of a barcode scanner.',
    stack: ['FastAPI', 'React', 'YOLO'],
  },
  {
    name: 'Desktop AI Companion',
    cat: 'Desktop app',
    url: 'https://github.com/ihyaabrar/Desktop-AI-Companion',
    desc: 'Local-first companion that remembers you, sees your screen and talks back.',
    stack: ['Tauri 2', 'React', 'TypeScript'],
  },
  {
    name: 'CertGen',
    cat: 'Web tool',
    url: 'https://github.com/ihyaabrar/Certificate-Generator',
    desc: 'Generates hundreds of certificates in the browser, with no backend and no upload.',
    stack: ['Next.js 15', 'Fabric.js', 'jsPDF'],
  },
  {
    name: 'LLM vs Manual Preprocessing',
    cat: 'Research notebooks',
    url: 'https://github.com/ihyaabrar/llm-vs-manual-preprocessing',
    desc: 'Supplementary notebooks for a medical-claims study. Every number recomputes from frozen inputs.',
    stack: ['Jupyter', 'scikit-learn', 'SHAP'],
  },
]

export const papers = [
  {
    year: '2026',
    when: 'July 2026',
    title:
      'Comparative Evaluation of Boosting Ensemble Models for Medication Adherence Prediction in Patients with Non-Communicable Diseases',
    meta: 'Jurnal Sisfokom, Vol. 15 No. 3, with M. K. Biddinika and H. Yuliansyah. LightGBM scored best, AUC-ROC 0.904.',
    url: 'https://doi.org/10.32736/sisfokom.v15i3.2712',
    published: true,
  },
  {
    year: '2026',
    when: '2026',
    title: 'Frozen LLM-generated vs manual preprocessing for medical-claims adherence classification',
    meta: 'Submitted to IJEEEMI. The supplementary notebooks are public on GitHub.',
    url: 'https://github.com/ihyaabrar/llm-vs-manual-preprocessing',
    published: false,
  },
  {
    year: '2023',
    when: 'December 2023',
    title: 'Liver Disease Classification Using the Elbow Method to Determine Optimal K in the K-Nearest Neighbor (K-NN) Algorithm',
    meta: 'Jurnal Sisfokom. Grew out of my undergraduate thesis at UM Pontianak.',
    url: 'https://jurnal.atmaluhur.ac.id/index.php/sisfokom/article/view/1643',
    published: true,
  },
]

export const CV_URL = '/Ihya-Nashirudin-Abrar-CV.pdf'

export const education: { school: string; degree: string; when: string; notes: string[]; logo?: string; initials: string; now?: boolean }[] = [
  {
    school: 'Universitas Ahmad Dahlan',
    degree: 'Master of Informatics',
    when: 'Oct 2025 to now',
    notes: ['Semester 3, research on machine learning for health data.', "Secretary of HM2IF, the Informatics master's student association, 2025/2026."],
    logo: '/logos/uad.webp',
    initials: 'UAD',
    now: true,
  },
  {
    school: 'Universitas Muhammadiyah Pontianak',
    degree: 'Bachelor of Informatics (Teknik Informatika)',
    when: 'Sep 2018 to Dec 2022',
    notes: ['Thesis on liver disease classification with K-NN, later published in Jurnal Sisfokom.', 'Computer lab assistant, Feb to Aug 2022.'],
    logo: '/logos/ump.webp',
    initials: 'UMP',
  },
]

export const experience: { when: string; title: string; place: string; track: Track; now?: boolean }[] = [
  { when: '2025 to now', title: 'Secretary, HM2IF', place: "Informatics master's student association, UAD, 2025/2026", track: 'org', now: true },
  { when: 'Jul to Oct 2025', title: 'Coding Teacher', place: 'Kalananti by Ruangguru. Scratch, Blockly, Python', track: 'work' },
  { when: '2024 to 2025', title: 'IT Support', place: 'Klinik Utama PKU Muhammadiyah Kitamura Pontianak', track: 'work' },
  { when: 'Feb to Jul 2023', title: 'Frontend Developer', place: 'Biro Logistik Polda Kalbar', track: 'work' },
  { when: 'Feb to Aug 2022', title: 'Computer Lab Assistant', place: 'Universitas Muhammadiyah Pontianak', track: 'work' },
  { when: '2018 to 2022', title: 'Layout Designer, then Advisor', place: 'Ukhuwah Magazine, Pati', track: 'work' },
]

export const tools = [
  ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Tailwind', 'Capacitor', 'Tauri'],
  ['Python', 'FastAPI', 'scikit-learn', 'LightGBM', 'SHAP', 'YOLO', 'Streamlit'],
  ['Prisma', 'MySQL', 'Docker', 'Git', 'Vercel'],
]

export const certificates = [
  'Learning Data Analytics: 1 Foundations',
  'Machine Learning with Python: Foundations',
  'Machine Learning with Python: Decision Trees',
  'Introduction to Data Analysis using Microsoft Excel',
  'Introducing Robotic Process Automation',
]
