// Data proyek (10 real projects dari folder /projects)
const projects = [
  // ORIGINAL IDEAS
  // (empty - no original ideas yet)

  // MINI GAMES
  { id:1, name:"Janken Game", category:"games", description:"Batu-gunting-kertas melawan AI dengan skor dinamis", tech:["HTML","CSS","JS"], demoUrl:"projects/janken-game/", date:"2025-09-15" },
  { id:2, name:"Slot Machine", category:"games", description:"Mesin slot kasino mini dengan animasi gulungan", tech:["HTML","CSS","JS"], demoUrl:"projects/slot-machine/", date:"2025-09-28" },
  { id:3, name:"Plinko", category:"games", description:"Simulasi Plinko dengan physics dasar dan hadiah", tech:["HTML","CSS","JS"], demoUrl:"projects/plinko-web-game/", date:"2025-10-10" },
  { id:4, name:"Roulette", category:"games", description:"Roulette kasino Eropa dengan taruhan virtual dan animasi", tech:["HTML","CSS","JS"], demoUrl:"projects/roulette-web-game/", date:"2025-10-20" },
  { id:10, name:"Meowdoku", category:"games", description:"Puzzle Sudoku interaktif dengan tema kucing yang menggemaskan", tech:["HTML","CSS","JS"], demoUrl:"projects/meowdoku/", date:"2025-12-15" },

  // TRACING / CLONE PRACTICE
  // (empty - no tracing projects yet)

  // WEB APPS
  { id:5, name:"TechPulse", category:"webapps", description:"Portal review teknologi AI dan software terkini dengan slider dan kategori", tech:["HTML","CSS","JS"], demoUrl:"projects/techpulse/", date:"2025-11-01" },
  { id:6, name:"Web Alumni", category:"webapps", description:"Portal data alumni sekolah dengan sistem CRUD lengkap, database, dan networking", tech:["HTML","CSS","JS"], demoUrl:"projects/web-alumni/", date:"2025-11-05" },
  { id:7, name:"Event Slot", category:"webapps", description:"Sistem event online dengan kode QR, staff control, dan slot machine interaktif", tech:["HTML","CSS","JS"], demoUrl:"projects/event-slot/", date:"2025-11-10" },
  { id:8, name:"All Sales Order", category:"webapps", description:"Tool data cleaning & deduplikasi untuk WhatsApp Lead dari All Sales Order", tech:["HTML","CSS","JS","Excel"], demoUrl:"projects/all-sales-order/", date:"2025-11-12" },
  { id:9, name:"CRM Birthday", category:"webapps", description:"Sistem CRM otomatis untuk monitoring dan tracking birthday customer", tech:["HTML","CSS","JS"], demoUrl:"projects/crm-birthday/", date:"2025-11-15" },

  // TUTORIAL / BELAJAR
  // (empty - no tutorial projects yet)
];

// Tooltip untuk teknologi
const techDesc = {
  HTML: "HyperText Markup Language — struktur halaman web",
  CSS: "Cascading Style Sheets — styling & layout visual",
  JS: "JavaScript — interaktivitas & logika di browser",
  Excel: "Data processing & export",
};
