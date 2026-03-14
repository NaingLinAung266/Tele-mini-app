/* =========================================
   SCRIPT.JS - COMPLETE COMPILED JAVASCRIPT
   ========================================= */

const API_BASE_URL = "https://kyawzin.online";

const API_KEY = "kzh12345"; // ကိုယ်ပိုင် API Key ပြောင်းရန်

/* --- TELEGRAM INITIALIZATION --- */
const tg = window.Telegram.WebApp;
tg.expand();

let tg_user_id = 0;
let tg_username = "Guest";

if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tg_user_id = tg.initDataUnsafe.user.id;
    tg_username = tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name || "Guest";
}

let user_id = tg_user_id;
let isAppMode = false;

// App Token Check
const appToken = localStorage.getItem('app_token');
const urlParams = new URLSearchParams(window.location.search);
const urlUserId = urlParams.get('app_user_id');

if (urlUserId) {
    user_id = urlUserId;
    isAppMode = true;
    document.getElementById('app-profile-btn').style.display = 'flex';
    document.getElementById('app-username-text').innerText = urlParams.get('app_username') || "App User";
} else if (appToken) {
    try {
        const decoded = JSON.parse(atob(appToken.split('.')[1]));
        if (decoded && decoded.user_id) {
            user_id = decoded.user_id;
            isAppMode = true;
            document.getElementById('app-profile-btn').style.display = 'flex';
            document.getElementById('app-username-text').innerText = decoded.username || "App User";
        }
    } catch(e) { console.error("Token error"); }
}

const isTelegram = window.Telegram.WebApp.initData !== "";
const isApp = localStorage.getItem('app_token') !== null;

/* // 🔒 BROWSER BLOCK (Optional - ဖွင့်ချင်ရင် အောက်က comment ဖြုတ်ပါ)
if (!isTelegram && !isApp) { 
    document.getElementById('browser-block-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
} 
*/

/* --- GLOBAL VARIABLES --- */
let isReseller = false;
let resDailyLimit = 0;
let currentProducts = [];
let selectedItem = null;
let currentQty = 1;
let gNameGlobal = '';
let gCodeGlobal = '';
let checkedIGN = '';
let isChecking = false;

function getSecureHeaders() {
    let headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'X-User-ID': user_id.toString()
    };
    if (tg.initData) headers['X-Telegram-Init-Data'] = tg.initData;
    if (appToken) headers['Authorization'] = 'Bearer ' + appToken;
    return headers;
}
function toggleTheme() {
    // အဖြူနဲ့ အမည်း နှစ်ခုတည်းပဲ ထားပါမယ်
    const themes = ['theme-dark', 'theme-light']; 
    let currentTheme = localStorage.getItem('theme') || 'theme-light';
    let currentIndex = themes.indexOf(currentTheme);
    
    if (currentIndex === -1) currentIndex = 0; 
    
    let nextTheme = themes[(currentIndex + 1) % themes.length];

    document.body.className = document.body.className.replace(/theme-\w+(-\w+)?/g, '').trim();
    document.body.classList.add(nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    // Theme Icon ကို နေ/လ ပြောင်းရန်
    const themeIcon = document.querySelector('.theme-btn i');
    if(themeIcon) {
        if(nextTheme === 'theme-light') {
            themeIcon.className = 'fas fa-sun'; // အဖြူရောင်ဆိုရင် နေမင်းပုံ
            themeIcon.style.color = '#ff9900';
        } else {
            themeIcon.className = 'fas fa-moon'; // အမည်းရောင်ဆိုရင် လမင်းပုံ
            themeIcon.style.color = '#fff';
        }
    }
}


let isLowPowerOn = localStorage.getItem('lowPowerMode') === 'true';
const lpBtn = document.getElementById('lp-btn');

if (isLowPowerOn) {
    document.body.classList.add('android-lite-mode');
    document.body.classList.add('low-power');
    if (lpBtn) lpBtn.classList.add('active-lp');
}

function toggleLowPower() {
    isLowPowerOn = !isLowPowerOn;
    localStorage.setItem('lowPowerMode', isLowPowerOn);
    
    if (isLowPowerOn) {
        document.body.classList.add('android-lite-mode');
        document.body.classList.add('low-power');
        if(lpBtn) lpBtn.classList.add('active-lp');
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Lite Mode ON ⚡', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
    } else {
        document.body.classList.remove('android-lite-mode');
        document.body.classList.remove('low-power');
        if(lpBtn) lpBtn.classList.remove('active-lp');
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'Lite Mode OFF 🌟', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
    }
}

/* --- ANIMATIONS --- */
let alertLottie, downloadLottie, indicatorLottie, drawerInfoLottie, rsInfoLottie, historyLottie, chevronLottie, lottieImageAnim, orderLottie, savedLottie;

document.addEventListener('DOMContentLoaded', () => {
    alertLottie = lottie.loadAnimation({ container: document.getElementById('lottie-alert'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets2.lottiefiles.com/packages/lf20_t2v0x9o6.json' });
    downloadLottie = lottie.loadAnimation({ container: document.getElementById('lottie-download-icon'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets9.lottiefiles.com/packages/lf20_96bovxgw.json' });
    indicatorLottie = lottie.loadAnimation({ container: document.getElementById('lottie-drawer-indicator'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets3.lottiefiles.com/packages/lf20_1jofmcv4.json' });
    drawerInfoLottie = lottie.loadAnimation({ container: document.getElementById('lottie-info-icon'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });
    rsInfoLottie = lottie.loadAnimation({ container: document.getElementById('lottie-info-icon-2'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });
    historyLottie = lottie.loadAnimation({ container: document.getElementById('lottie-history'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });
    chevronLottie = lottie.loadAnimation({ container: document.getElementById('lottie-chevron'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets3.lottiefiles.com/packages/lf20_1jofmcv4.json' });
    lottieImageAnim = lottie.loadAnimation({ container: document.getElementById('lottie-image'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });
    
    orderLottie = lottie.loadAnimation({ container: document.getElementById('lottie-order'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });
    savedLottie = lottie.loadAnimation({ container: document.getElementById('lottie-saved'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets8.lottiefiles.com/packages/lf20_xsnvpcvt.json' });

    setTimeout(() => { document.getElementById('custom-loading-screen').style.opacity = '0'; setTimeout(() => document.getElementById('custom-loading-screen').style.display = 'none', 500); }, 800);
});

/* --- API CALLS & DATA HANDLING --- */
async function loadUserData() {
    if (!user_id || user_id == 0) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/${user_id}`, { headers: getSecureHeaders() });
        const data = await res.json();
        
        let bal = data.balance ? data.balance : 0;
        document.getElementById('user-balance').innerText = bal.toLocaleString() + " Ks";
        document.getElementById('header-balance').innerText = bal.toLocaleString() + " Ks";
        
        isReseller = data.is_reseller || false;
        
        const roleDisp = document.getElementById('drawer-role-display');
        const rsBox = document.getElementById('reseller-stats-box');
        
        if (isReseller) {
            roleDisp.innerText = "VIP Reseller";
            roleDisp.style.color = "#ffd700";
            rsBox.style.display = "block";
        } else {
            roleDisp.innerText = "Normal User";
            roleDisp.style.color = "#888";
            rsBox.style.display = "none";
        }

    } catch(e) { console.log("Balance fetch error", e); }
}

setInterval(loadUserData, 3000);
loadUserData();

async function checkID(mode = 'normal') {
    if (isChecking) return;
    
    const pref = mode === 'qb' ? 'qb-' : 'inp-';
    const ignEl = document.getElementById(`${pref}ign-display`);
    let idVal = document.getElementById(`${pref}id`).value.trim();
    let zoneVal = document.getElementById(`${pref}zone`).value.trim();
    let gCode = mode === 'qb' ? document.getElementById('qb-btn-buy').getAttribute('data-game') : gCodeGlobal;

    if (!idVal) {
        Swal.fire({ icon: 'warning', title: 'Oops', text: 'Game ID ထည့်ပါ။', background: '#222', color: '#fff' });
        return;
    }

    // Bypass ID checks for certain games
    if (gCode === 'roblox') { ignEl.innerHTML = "<span style='color:#39ff14;'>✅ Login Info Saved</span>"; checkedIGN = "Roblox Account"; return; }
    if (['hok', 'wwm', 'magic_chess', 'heartopia', 'sword_of_justice', 'blood_strike', 'genshin'].includes(gCode)) { 
        ignEl.innerHTML = "<span style='color:#39ff14;'>✅ Player</span>"; checkedIGN = "Player"; return; 
    }

    ignEl.innerHTML = "Checking...";
    isChecking = true;

    try {
        const res = await fetch(`${API_BASE_URL}/api/check_id`, {
            method: 'POST',
            headers: getSecureHeaders(),
            body: JSON.stringify({ player_id: idVal, zone_id: zoneVal, game: gCode })
        });
        const data = await res.json();
        isChecking = false;

        if (data.success && data.data && data.data.username) {
            checkedIGN = data.data.username;
            ignEl.innerHTML = `<span style="color:#39ff14; font-weight:900;">✅ ${checkedIGN}</span>`;
            saveToHistory(gCode, gNameGlobal, idVal, zoneVal, checkedIGN);
        } else {
            ignEl.innerHTML = `<span style="color:#ff3333;">❌ Not Found</span>`;
            checkedIGN = '';
        }
    } catch (e) {
        isChecking = false;
        ignEl.innerHTML = `<span style="color:#ff3333;">❌ Error</span>`;
    }
}

async function buyItem(mode = 'normal') {
    if (!selectedItem) return;
    
    const pref = mode === 'qb' ? 'qb-' : 'inp-';
    let idVal = document.getElementById(`${pref}id`).value.trim();
    let zoneVal = document.getElementById(`${pref}zone`).value.trim();
    let gCode = mode === 'qb' ? document.getElementById('qb-btn-buy').getAttribute('data-game') : gCodeGlobal;

    if (!idVal) { document.getElementById('id-modal').style.display = 'flex'; return; }
    if (!checkedIGN && !['roblox', 'hok', 'wwm', 'magic_chess', 'heartopia', 'sword_of_justice', 'blood_strike'].includes(gCode)) {
        Swal.fire({ icon: 'warning', title: 'Check ID First', text: 'Please CHECK ID before buying.', background: '#222', color: '#fff' });
        return;
    }

    let btn = document.getElementById(`${pref === 'qb-' ? 'qb-' : ''}btn-buy`);
    let originalText = btn.innerHTML;
    btn.innerHTML = 'PROCESSING...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE_URL}/api/buy`, {
            method: 'POST',
            headers: getSecureHeaders(),
            body: JSON.stringify({
                user_id: user_id,
                tg_username: tg_username,
                sku: selectedItem.sku,
                game_code: gCode,
                player_id: idVal,
                zone_id: zoneVal,
                ign: checkedIGN || "Unknown",
                quantity: currentQty
            })
        });
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('success-modal').style.display = 'flex';
            if (mode === 'qb') document.getElementById('quick-buy-modal').style.display = 'none';
            loadUserData(); 
        } else {
            Swal.fire({ icon: 'error', title: 'Failed', text: data.message || 'Purchase failed', background: '#222', color: '#fff' });
        }
    } catch(e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Server error, try again.', background: '#222', color: '#fff' });
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

/* --- UI NAVIGATION --- */
function openPage(pageId) {
    document.getElementById(pageId).classList.add('show');
    window.history.pushState({ page: pageId }, '', `#${pageId}`);
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove('show');
}

function goHome() {
    closePage('page-product');
    document.getElementById('checkout-bar').classList.remove('active');
    selectedItem = null;
    window.history.pushState({}, document.title, window.location.pathname);
}

function goHomeSafely() {
    document.querySelectorAll('.page-overlay.show').forEach(p => p.classList.remove('show'));
    document.getElementById('checkout-bar').classList.remove('active');
}

function goToVPN() { window.location.href = 'vpn-ui.html'; }
function goToOffers() { window.location.href = 'deals.html'; }
function goToQA(link) { window.location.href = link; }

function openGame(gCode) {
    gCodeGlobal = gCode;
    gNameGlobal = gCode.toUpperCase(); // Simplification
    
    document.getElementById('inp-id').value = '';
    document.getElementById('inp-zone').value = '';
    document.getElementById('ign-display').innerHTML = '';
    checkedIGN = '';
    
    // UI logic for different games
    if(gCode === 'roblox') {
        document.getElementById('inp-id').placeholder = "Roblox Username";
        document.getElementById('inp-zone').placeholder = "Password";
        document.getElementById('inp-note').classList.remove('hidden');
        document.getElementById('check-btn-group').style.display = 'none';
    } else {
        document.getElementById('inp-id').placeholder = "User ID";
        document.getElementById('inp-zone').placeholder = "Zone ID";
        document.getElementById('inp-note').classList.add('hidden');
        document.getElementById('check-btn-group').style.display = 'flex';
    }

    fetchProducts(gCode);
    openPage('page-product');
}

async function fetchProducts(gCode) {
    const container = document.getElementById('product-container');
    container.innerHTML = '<div style="text-align:center; padding: 20px;">Loading items...</div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${gCode}`);
        const data = await res.json();
        
        let html = '';
        if(data && data.length > 0) {
            data.forEach(item => {
                html += `
                <div class="product-item" onclick='selectProduct(${JSON.stringify(item)})'>
                    <div class="card-top">
                        <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" class="p-img">
                    </div>
                    <div class="card-bottom">
                        <div class="p-name">${item.name}</div>
                        <div class="p-price">${item.price.toLocaleString()} Ks</div>
                    </div>
                </div>`;
            });
            container.innerHTML = `<div class="product-list">${html}</div>`;
        } else {
            container.innerHTML = '<div style="text-align:center;">No items found</div>';
        }
    } catch(e) {
        container.innerHTML = '<div style="text-align:center; color:red;">Failed to load items</div>';
    }
}

function selectProduct(item) {
    selectedItem = item;
    currentQty = 1;
    
    document.querySelectorAll('.product-item').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    document.getElementById('total-price').innerText = item.price.toLocaleString() + ' Ks';
    document.getElementById('checkout-bar').classList.add('active');
}

/* --- DEPOSIT SYSTEM --- */
function openDeposit() {
    if (!user_id || user_id == 0) {
        Swal.fire({ icon: 'warning', title: 'Error', text: 'Telegram ID မရရှိပါ။' });
        return;
    }
    document.getElementById('deposit-modal').style.display = 'flex';
}

function selectAmount(amt, el) {
    document.getElementById('dep-amount').value = amt;
    document.querySelectorAll('.amount-tag').forEach(tag => tag.classList.remove('active'));
    el.classList.add('active');
}

function handlePayTap(phone, qrLink) {
    let clickCount = parseInt(event.currentTarget.getAttribute('data-clicks') || 0);
    clickCount++;
    event.currentTarget.setAttribute('data-clicks', clickCount);

    if (clickCount === 1) {
        navigator.clipboard.writeText(phone);
        Swal.fire({ toast: true, position: 'top', icon: 'success', title: `Copied: ${phone}`, showConfirmButton: false, timer: 1500 });
        setTimeout(() => event.currentTarget.setAttribute('data-clicks', 0), 400);
    } else if (clickCount === 2) {
        Swal.fire({ imageUrl: qrLink, imageWidth: 300, imageHeight: 300, imageAlt: 'QR Code', showConfirmButton: true, confirmButtonText: 'Close', background: '#222', color: '#fff' });
        event.currentTarget.setAttribute('data-clicks', 0);
    }
}

function triggerFileSelect() { document.getElementById('dep-file').click(); }

function handleNativeFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('dep-txt').innerHTML = `<span style="color:#39ff14;">✅ Selected: ${file.name.substring(0,10)}...</span>`;
        const reader = new FileReader();
        reader.onload = function(e) { document.getElementById('dep-file-base64').value = e.target.result; };
        reader.readAsDataURL(file);
    }
}

async function submitDeposit() {

let amt = document.getElementById('dep-amount').value;
let fileBase64 = document.getElementById('dep-file-base64').value;

if (!amt || parseInt(amt) < 1000) {
    Swal.fire('Error', 'အနည်းဆုံး ၁၀၀၀ ကျပ် ဖြည့်ပါ။', 'error');
    return;
}

if (!fileBase64) {
    Swal.fire('Error', 'ငွေလွှဲပြေစာ ပုံထည့်ပါ။', 'error');
    return;
}

let btn = document.getElementById('btn-submit-dep');
btn.innerHTML = 'Submitting...';
btn.disabled = true;

try {

    const res = await fetch("https://kyawzin.online/api/deposit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        },
        body: JSON.stringify({
            user_id: String(user_id),
            tg_username: String(tg_username),
            amount: parseInt(amt),
            file: fileBase64
        })
    });

    if (!res.ok) {
        throw new Error("HTTP error " + res.status);
    }

    const data = await res.json();

    if (data.success === true) {

        Swal.fire('Success', 'ပြေစာတင်ပြီးပါပြီ။ Admin မှစစ်ဆေးပေးပါမည်။', 'success');

        document.getElementById('deposit-modal').style.display = 'none';

        document.getElementById('dep-amount').value = "";
        document.getElementById('dep-file-base64').value = "";

    } else {

        Swal.fire('Error', data.detail || 'Failed to submit', 'error');

    }

} catch (e) {

    console.error("Deposit Error:", e);
    Swal.fire('Error', 'Server error / API မရောက်ပါ', 'error');

}

btn.innerHTML = 'Submit';
btn.disabled = false;

}


function openOrderHistory() {
    document.getElementById('order-history-modal').style.display = 'flex';
    fetchOrderHistory();
}


async function fetchOrderHistory() {
    const list = document.getElementById('order-history-list');
    list.innerHTML = `<div style="text-align:center; padding: 20px;"><div class="css-spinner" style="width:30px; height:30px; margin:auto;"></div></div>`;
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/history/${user_id}`);
        const data = await res.json();
        
        let html = '';
        if(data && data.length > 0) {
            data.forEach(item => {
                const statusClass = item.status === 'success' ? 'st-success' : 'st-refund';
                const statusIcon = item.status === 'success' ? 'fa-check-circle' : 'fa-times-circle';
                
                html += `
                <div class="order-card" onclick="openDetailsModal('${item.id}')">
                    <div class="order-header">
                        <div class="ord-id"><i class="fas fa-gamepad"></i> ${item.game.toUpperCase()}</div>
                        <div class="ord-ign">@${item.ign}</div>
                    </div>
                    <div class="ord-item">${item.item_name}</div>
                    <div class="order-footer">
                        <div class="ord-date"><i class="far fa-clock"></i> ${new Date(item.created_at).toLocaleDateString()}</div>
                        <div class="${statusClass}"><i class="fas ${statusIcon}"></i> ${item.status.toUpperCase()}</div>
                    </div>
                </div>`;
            });
            list.innerHTML = html;
        } else {
            
            list.innerHTML = `
                <div style="text-align:center; color:#555; padding: 50px 20px;">
                    <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p style="font-size: 13px; font-weight: 600;">မှတ်တမ်း မရှိသေးပါ</p>
                </div>`;
        }
    } catch(e) { 
        list.innerHTML = `<div style="text-align:center; color:#ff3333; padding:20px;">Error loading history</div>`; 
    }
}

function openDrawer() {
    document.getElementById('side-drawer').classList.add('open');
    document.getElementById('drawer-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('drawer-overlay').style.opacity = '1', 10);
    document.getElementById('drawer-name-display').innerText = tg_username;
}

function closeDrawer() {
    document.getElementById('side-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').style.opacity = '0';
    setTimeout(() => document.getElementById('drawer-overlay').style.display = 'none', 300);
}

function toggleAccordion(header) {
    const accordion = header.parentElement;
    accordion.classList.toggle('active');
}

function toggleQuickAccess() {
    const list = document.getElementById('qa-list');
    const icon = document.getElementById('qa-icon');
    if (list.style.display === 'flex') {
        list.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    } else {
        list.style.display = 'flex';
        icon.style.transform = 'rotate(180deg)';
        document.querySelector('.drawer-menu').scrollTo({ top: document.querySelector('.drawer-menu').scrollHeight, behavior: 'smooth' });
    }
}

function openResellerPage() {
    closeDrawer();
    openPage('page-reseller');
}

/* Utility Functions */
function playVibration() { if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); }
function copyUserID() { navigator.clipboard.writeText(user_id.toString()); Swal.fire({ toast: true, position: 'top', icon: 'success', title: 'ID Copied', showConfirmButton: false, timer: 1500 }); }

function toggleBalance(icon) {
    const balEl = document.getElementById('user-balance');
    const hdrEl = document.getElementById('header-balance');
    if (balEl.innerText === '******') {
        loadUserData();
        icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye');
    } else {
        balEl.innerText = '******'; hdrEl.innerText = '******';
        icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash');
    }
}