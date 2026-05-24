// Data proyek (24 proyek sesuai original)
const projects = [
  // ORIGINAL IDEAS
  { id:1, name:"TechPulse", category:"original", description:"Portal review teknologi AI dan software terkini", tech:["HTML","CSS","JS"], demoUrl:"/techpulse/", githubUrl:"#", date:"2025-10-01" },
  { id:2, name:"Personal Portfolio", category:"original", description:"Website portofolio personal dengan animasi smooth", tech:["HTML","CSS","JS"], demoUrl:"/portfolio/", githubUrl:"#", date:"2025-10-15" },
  { id:3, name:"Company Profile", category:"original", description:"Landing page company profile fiktif modern", tech:["HTML","CSS","JS"], demoUrl:"/company-profile/", githubUrl:"#", date:"2025-11-01" },
  { id:4, name:"Tech Blog", category:"original", description:"Template blog teknologi dengan dark mode bawaan", tech:["HTML","CSS","JS"], demoUrl:"/tech-blog/", githubUrl:"#", date:"2025-11-20" },
  { id:5, name:"Dev Dashboard", category:"original", description:"Dashboard statistik developer dengan chart interaktif", tech:["HTML","CSS","JS"], demoUrl:"/dev-dashboard/", githubUrl:"#", date:"2025-12-01" },

  // MINI GAMES
  { id:6, name:"Janken Game", category:"games", description:"Batu-gunting-kertas melawan AI dengan skor dinamis", tech:["HTML","CSS","JS"], demoUrl:"/janken-game/", date:"2025-09-15" },
  { id:7, name:"Slot Machine", category:"games", description:"Mesin slot kasino mini dengan animasi gulungan", tech:["HTML","CSS","JS"], demoUrl:"/slot-machine/", date:"2025-09-28" },
  { id:8, name:"Plinko", category:"games", description:"Simulasi Plinko Price is Right dengan physics dasar", tech:["HTML","CSS","JS"], demoUrl:"/plinko/", date:"2025-10-10" },
  { id:9, name:"Roulette", category:"games", description:"Roulette kasino Eropa dengan taruhan virtual", tech:["HTML","CSS","JS"], demoUrl:"/roulette/", date:"2025-10-25" },
  { id:10, name:"Memory Match", category:"games", description:"Card matching game dengan timer dan leaderboard lokal", tech:["HTML","CSS","JS"], demoUrl:"/memory-match/", date:"2025-11-05" },
  { id:11, name:"Snake Classic", category:"games", description:"Remake game ular klasik di atas canvas HTML5", tech:["HTML","CSS","JS"], demoUrl:"/snake-game/", date:"2025-11-15" },

  // TRACING / CLONE
  { id:12, name:"Stripe Clone", category:"tracing", description:"Landing page Stripe.com — tracing layout & gradien", tech:["HTML","CSS"], demoUrl:"/stripe-clone/", date:"2025-09-05" },
  { id:13, name:"Tailwind UI Clone", category:"tracing", description:"Komponen UI dari Tailwind UI — latihan utility-first CSS", tech:["HTML","CSS","JS"], demoUrl:"/tailwindui-clone/", date:"2025-09-20" },
  { id:14, name:"Linear Clone", category:"tracing", description:"Homepage Linear.app dengan animasi scroll reveal", tech:["HTML","CSS","JS"], demoUrl:"/linear-clone/", date:"2025-10-05" },
  { id:15, name:"Vercel Clone", category:"tracing", description:"Tracing halaman dashboard Vercel — layout & dark theme", tech:["HTML","CSS","JS"], demoUrl:"/vercel-clone/", date:"2025-10-20" },

  // WEB APPS
  { id:16, name:"Mini CRM", category:"webapps", description:"Sistem CRM sederhana untuk kelola kontak & deal", tech:["HTML","CSS","JS","PHP","MySQL"], demoUrl:"/mini-crm/", githubUrl:"#", date:"2025-09-10" },
  { id:17, name:"Helpdesk System", category:"webapps", description:"Sistem tiket helpdesk dengan status tracking", tech:["PHP","MySQL","Bootstrap"], demoUrl:"/helpdesk/", githubUrl:"#", date:"2025-09-25" },
  { id:18, name:"Alumni Portal", category:"webapps", description:"Portal data alumni sekolah/kampus dengan CRUD lengkap", tech:["PHP","MySQL","Bootstrap"], demoUrl:"/alumni-portal/", githubUrl:"#", date:"2025-10-08" },
  { id:19, name:"Expense Tracker", category:"webapps", description:"Pencatat keuangan harian dengan grafik pie chart", tech:["HTML","CSS","JS"], demoUrl:"/expense-tracker/", date:"2025-10-22" },
  { id:20, name:"Task Board", category:"webapps", description:"Kanban board sederhana drag-and-drop tanpa library", tech:["HTML","CSS","JS"], demoUrl:"/task-board/", date:"2025-11-08" },

  // TUTORIAL / BELAJAR
  { id:21, name:"Laravel Blog", category:"tutorial", description:"Blog CRUD mengikuti tutorial Laravel 10 Pemula", tech:["PHP","Laravel","MySQL"], demoUrl:"/laravel-blog/", githubUrl:"#", date:"2025-09-01" },
  { id:22, name:"Laravel POS", category:"tutorial", description:"Point of Sale sederhana ikut tutorial Laravolt", tech:["PHP","Laravel","MySQL"], demoUrl:"/laravel-pos/", githubUrl:"#", date:"2025-09-18" },
  { id:23, name:"CSS Flexbox Playground", category:"tutorial", description:"Visualisasi interaktif semua properti CSS Flexbox", tech:["HTML","CSS","JS"], demoUrl:"/flexbox-play/", date:"2025-10-03" },
  { id:24, name:"Vanilla JS 30", category:"tutorial", description:"30 mini-project JavaScript murni (ikut JS30 Wesbos)", tech:["HTML","CSS","JS"], demoUrl:"/js30/", githubUrl:"#", date:"2025-10-18" },
];

// Tooltip untuk teknologi
const techDesc = {
  HTML: "HyperText Markup Language — struktur halaman web",
  CSS: "Cascading Style Sheets — styling & layout visual",
  JS: "JavaScript — interaktivitas & logika di browser",
  PHP: "Server-side scripting language",
  Laravel: "PHP framework modern & elegan",
  MySQL: "Relational database management system",
  Bootstrap: "CSS framework responsif dari Twitter",
  React: "Library UI dari Meta/Facebook",
  Tailwind: "Utility-first CSS framework",
};
