const webAppUrl = "https://script.google.com/macros/s/AKfycbxvlmlJ512BbiA9v5256n4JJVJwWHPl4CJL7vQIMU2dclfX4LxNYsww-EJfSoR77HkZ/exec";

function showHome() {
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('data-page').style.display = 'none';
    updateActiveUI('btn-home');
    loadNewsHighlight();
}

async function changePage(sheetName, element) {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('data-page').style.display = 'block';
    document.getElementById('page-title').innerText = sheetName === 'Database' ? 'Direktori Alumni' : 'Informasi ' + sheetName;
    
    updateActiveUI(element);

    const container = document.getElementById('main-content');
    container.innerHTML = '<div class="col-span-full py-20 text-center"><div class="loader mx-auto"></div><p class="mt-4 text-gray-400">Menghubungkan ke Tab: ' + sheetName + '...</p></div>';

    try {
        const response = await fetch(`${webAppUrl}?page=${sheetName}`, { redirect: "follow" });
        const data = await response.json();
        container.innerHTML = '';

        if (!data || data.length === 0 || data.error) {
            container.innerHTML = `<p class="col-span-full text-center py-20 text-gray-500 italic">Data di tab "${sheetName}" tidak ditemukan.</p>`;
            return;
        }

        data.forEach(item => {
            if (sheetName === 'Database') container.innerHTML += renderAlumni(item);
            else if (sheetName === 'Loker') container.innerHTML += renderLoker(item);
            else if (sheetName === 'Berita') container.innerHTML += renderBerita(item);
            else if (sheetName === 'Etalase') container.innerHTML += renderEtalase(item);
        });
    } catch (e) {
        container.innerHTML = '<div class="col-span-full py-20 text-center bg-red-50 rounded-2xl border border-red-100"><p class="text-red-600 font-bold">⚠️ Database Error</p><p class="text-red-400 text-sm">Gagal mengambil data. Pastikan Apps Script sudah di-deploy sebagai "Anyone".</p></div>';
    }
}

function updateActiveUI(target) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active-link'));
    if (typeof target === 'string') {
        const el = document.getElementById(target);
        if(el) el.classList.add('active-link');
    } else if(target) {
        target.classList.add('active-link');
    }
}

async function loadNewsHighlight() {
    const container = document.getElementById('news-highlight');
    if (!container) return;
    try {
        const response = await fetch(`${webAppUrl}?page=Berita`, { redirect: "follow" });
        const data = await response.json();
        if (data && data.length > 0 && !data.error) {
            container.innerHTML = '';
            data.slice(0, 3).forEach(item => {
                container.innerHTML += `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer" onclick="changePage('Berita')">
                        <img src="${item.LinkGambar || 'https://via.placeholder.com/400x200'}" class="w-full h-44 object-cover">
                        <div class="p-5">
                            <h3 class="font-bold text-gray-900 leading-tight">${item.Judul || 'Kabar Alumni'}</h3>
                        </div>
                    </div>`;
            });
        } else {
            container.innerHTML = '<p class="col-span-3 text-center text-gray-400 italic">Belum ada berita terbaru.</p>';
        }
    } catch (e) { container.innerHTML = ''; }
}

function renderAlumni(d) {
    return `
    <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
        <img src="${d['Foto (URL)']}" class="w-full h-52 object-cover rounded-2xl mb-4 shadow-sm">
        <h3 class="font-bold text-xl text-gray-900">${d.Nama}</h3>
        <p class="text-blue-600 font-semibold mb-4">Angkatan ${d.Angkatan}</p>
        <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
            <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">${d.Pekerjaan || 'Alumni'}</span>
            <a href="${d.LinkedIn}" target="_blank" class="text-blue-500 hover:text-blue-700 font-bold text-xs underline">LinkedIn</a>
        </div>
    </div>`;
}

function renderLoker(d) { return `<div class="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm"><h3 class="font-bold text-xl">${d.Posisi}</h3><p class="text-blue-600 mb-6">${d.Perusahaan}</p><a href="${d.Link}" target="_blank" class="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-bold">Lamar</a></div>`; }
function renderBerita(d) { return `<div class="bg-white rounded-3xl border overflow-hidden"><img src="${d.LinkGambar}" class="w-full h-44 object-cover"><div class="p-6"><h3 class="font-bold text-gray-900 mb-2">${d.Judul}</h3><p class="text-gray-600 text-sm">${d.Ringkasan}</p></div></div>`; }
function renderEtalase(d) { return `<div class="bg-white p-8 rounded-3xl border text-center"><img src="${d.FotoProduk}" class="w-20 h-20 mx-auto rounded-full object-cover mb-4 ring-4 ring-gray-50"><h3 class="font-bold text-gray-900">${d.NamaBisnis}</h3><p class="text-gray-500 text-xs mb-6">${d.Produk}</p><a href="https://wa.me/${d.WhatsApp}" target="_blank" class="block w-full bg-green-500 text-white py-3 rounded-xl font-bold">WhatsApp</a></div>`; }

window.addEventListener('DOMContentLoaded', showHome);
