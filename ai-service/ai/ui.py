LANDMARK_UI_HTML = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TravelAI - Nhận Diện Địa Danh Du Lịch Thông Minh</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .laser-line {
      animation: scan 2s ease-in-out infinite alternate;
    }
    @keyframes scan {
      0% { top: 0%; opacity: 0.8; }
      100% { top: 100%; opacity: 0.8; }
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <!-- Navbar -->
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl">
          🏛️
        </div>
        <div>
          <h1 class="font-bold text-lg leading-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
            TravelAI Landmark Vision
          </h1>
          <p class="text-xs text-slate-400">Hệ Thống Nhận Diện Địa Danh Đa Mô Hình (ONNX + Google Vision)</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ONNX Model Ready
        </span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Upload & Controls (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur">
          <h2 class="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <span>📷</span> Tải Ảnh Địa Danh
          </h2>
          <p class="text-xs text-slate-400 mb-4">
            Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 10 MB). Mô hình cục bộ sẽ phân tích đặc trưng hình học trong 20ms.
          </p>

          <!-- Dropzone -->
          <div id="dropzone" class="relative group border-2 border-dashed border-slate-600 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-800/40 hover:bg-slate-800/80">
            <input type="file" id="fileInput" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
            
            <div id="uploadPrompt" class="space-y-3">
              <div class="w-14 h-14 mx-auto rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📸
              </div>
              <div>
                <p class="text-sm font-medium text-slate-200">Kéo thả ảnh vào đây hoặc <span class="text-sky-400 underline underline-offset-2">chọn từ máy</span></p>
                <p class="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP</p>
              </div>
            </div>

            <!-- Preview Image (hidden initially) -->
            <div id="previewContainer" class="hidden relative rounded-xl overflow-hidden aspect-video bg-black/40">
              <img id="previewImg" class="w-full h-full object-cover" alt="Preview">
              <div id="laserScan" class="hidden absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] laser-line"></div>
              <button id="btnRemoveImg" class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 text-xs z-20 transition">
                ✕
              </button>
            </div>
          </div>

          <!-- Sample Quick Pick Buttons -->
          <div class="mt-4">
            <label class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              💡 Thử nhanh các địa danh trong Model train (14 danh thắng):
            </label>
            <div class="flex flex-wrap gap-2" id="sampleContainer">
              <button onclick="loadSample('benThanh.jpeg', 'Chợ Bến Thành')" class="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 hover:border-emerald-500 border border-emerald-700/60 text-xs rounded-lg transition text-emerald-200 flex items-center gap-1">
                <span>🏛️</span> Chợ Bến Thành
              </button>
              <button onclick="loadSample('test1.jpeg', 'Nhà thờ Đức Bà')" class="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 hover:border-emerald-500 border border-emerald-700/60 text-xs rounded-lg transition text-emerald-200 flex items-center gap-1">
                <span>⛪</span> Nhà thờ Đức Bà
              </button>
              <button onclick="loadSample('test5.jpeg', 'Chùa Thiên Mụ')" class="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 hover:border-emerald-500 border border-emerald-700/60 text-xs rounded-lg transition text-emerald-200 flex items-center gap-1">
                <span>🛕</span> Chùa Thiên Mụ
              </button>
              <button onclick="loadSample('thap.jpeg', 'Tháp Eiffel')" class="px-3 py-1.5 bg-slate-700/60 hover:bg-sky-600/40 hover:border-sky-500 border border-slate-600 text-xs rounded-lg transition text-slate-300 flex items-center gap-1">
                <span>🗼</span> Tháp Eiffel (Cloud)
              </button>
              <button onclick="loadSample('berlin.jpeg', 'Berlin Cathedral')" class="px-3 py-1.5 bg-slate-700/60 hover:bg-sky-600/40 hover:border-sky-500 border border-slate-600 text-xs rounded-lg transition text-slate-300 flex items-center gap-1">
                <span>🏰</span> Berlin (Cloud)
              </button>
            </div>
          </div>

          <!-- Analyze & Cancel Action Buttons -->
          <div class="mt-6 flex gap-3">
            <button id="btnAnalyze" onclick="analyzeImage()" disabled class="flex-1 py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition duration-200">
              <span id="btnIcon">🔍</span>
              <span id="btnText">Bắt Đầu Nhận Diện</span>
            </button>
            <button id="btnCancel" onclick="handleCancel()" title="Huỷ ảnh đang chọn hoặc dừng quét" class="hidden px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 font-semibold text-sm rounded-xl border border-rose-500/30 transition flex items-center justify-center gap-1.5">
              <span>✕</span>
              <span id="btnCancelText">Huỷ</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Results Dashboard (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- Idle State Placeholder -->
        <div id="idleState" class="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
          <div class="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl mb-4 text-slate-400">
            🧭
          </div>
          <h3 class="text-lg font-semibold text-white">Chưa có kết quả nhận diện</h3>
          <p class="text-sm text-slate-400 max-w-sm mt-1">
            Hãy tải lên một bức ảnh hoặc bấm chọn một ảnh mẫu bên trái để mô hình AI nhận diện danh thắng.
          </p>
        </div>

        <!-- Error Card (hidden initially) -->
        <div id="errorCard" class="hidden bg-slate-800/80 border border-rose-500/40 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div class="flex items-center gap-3 text-rose-400 font-semibold text-base mb-2">
            <span>⚠️</span> Thông Báo Phản Hồi Từ Hệ Thống
          </div>
          <p id="errorMessageText" class="text-sm text-slate-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-mono text-xs"></p>
          <div id="visionErrorHint" class="hidden mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
            <p class="font-bold mb-1 text-amber-300">💡 Giải thích nguyên nhân:</p>
            <p>1. Bức ảnh này không nằm trong 14 địa danh du lịch Việt Nam mà mô hình ONNX cục bộ hỗ trợ (hoặc độ tin cậy thấp).</p>
            <p class="mt-1">2. Hệ thống đã tự động chuyển tiếp sang Google Cloud Vision để nhận diện, nhưng tài khoản Google Cloud hiện tại báo lỗi xác thực (401: Key đã hết hạn hoặc chưa kích hoạt billing).</p>
            <p class="mt-2 font-semibold text-emerald-300">👉 Để kiểm tra mô hình AI cục bộ của bạn, hãy thử tải lên các ảnh thuộc 14 địa danh như: Chợ Bến Thành, Nhà thờ Đức Bà Sài Gòn, Cầu Long Biên, Chùa Một Cột, Cầu Vàng, Dinh Độc Lập...</p>
          </div>
          <div class="mt-4 text-right">
            <button onclick="resetAll()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded-lg text-slate-200">
              Đặt lại / Thử ảnh khác
            </button>
          </div>
        </div>

        <!-- Result Card (hidden initially) -->
        <div id="resultCard" class="hidden space-y-6">
          <div class="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur relative overflow-hidden">
            
            <div class="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/80 pb-5">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span id="engineBadge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 ONNX Model
                  </span>
                  <span id="statusBadge" class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Đã xác định
                  </span>
                </div>
                <h2 id="resName" class="text-2xl font-bold text-white tracking-tight">Tên Địa Danh</h2>
                <p id="resSub" class="text-xs text-slate-400 mt-0.5">Địa điểm du lịch</p>
              </div>

              <!-- Confidence Box & Reset Button -->
              <div class="text-right flex flex-col items-end gap-2">
                <button onclick="resetAll()" class="px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 hover:text-white transition flex items-center gap-1">
                  <span>🔄</span> Đặt lại / Quét ảnh khác
                </button>
                <div>
                  <div class="text-3xl font-extrabold text-sky-400" id="resConfidence">98.6%</div>
                  <div class="text-xs text-slate-400">Độ tin cậy (Confidence)</div>
                </div>
              </div>
            </div>

            <!-- Confidence Progress Bar -->
            <div class="mt-4">
              <div class="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                <div id="confidenceBar" class="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-700" style="width: 0%"></div>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-5 bg-slate-900/60 rounded-xl p-4 border border-slate-800">
              <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">📖 Giới Thiệu Địa Danh</h4>
              <p id="resDesc" class="text-sm text-slate-200 leading-relaxed"></p>
            </div>

            <!-- Decision Reason -->
            <div class="mt-3 text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
              <span>💡</span> <span id="resReason">Cơ chế xác nhận</span>
            </div>

            <!-- Top Candidates Table from Model -->
            <div id="candidatesSection" class="mt-5">
              <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">📊 Phân Phối Xác Suất Top 3 (Model Softmax)</h4>
              <div class="space-y-2" id="candidatesList"></div>
            </div>

            <!-- Technical Metadata Footer -->
            <div class="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div id="resLatency" class="flex items-center gap-1">⏱️ Suy luận: ~20ms</div>
              <button onclick="toggleJson()" class="text-sky-400 hover:underline">Xem JSON gốc</button>
            </div>

            <!-- Raw JSON Collapsible -->
            <pre id="rawJsonBox" class="hidden mt-4 p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs overflow-x-auto max-h-60 border border-slate-800"></pre>
          </div>
        </div>

      </div>
    </div>
  </main>

  <script>
    let currentBlob = null;
    let activeAbortController = null;

    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const btnRemoveImg = document.getElementById('btnRemoveImg');
    const btnAnalyze = document.getElementById('btnAnalyze');
    const btnCancel = document.getElementById('btnCancel');
    const btnCancelText = document.getElementById('btnCancelText');
    const laserScan = document.getElementById('laserScan');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        currentBlob = file;
        showPreview(URL.createObjectURL(file));
      }
    });

    btnRemoveImg.addEventListener('click', (e) => {
      e.stopPropagation();
      resetAll();
    });

    function showPreview(url) {
      previewImg.src = url;
      uploadPrompt.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      btnAnalyze.disabled = false;
      btnCancel.classList.remove('hidden');
      btnCancelText.innerText = 'Huỷ';
    }

    function resetAll() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }
      currentBlob = null;
      fileInput.value = '';
      previewContainer.classList.add('hidden');
      uploadPrompt.classList.remove('hidden');
      laserScan.classList.add('hidden');
      btnAnalyze.disabled = true;
      btnCancel.classList.add('hidden');
      document.getElementById('btnIcon').innerText = '🔍';
      document.getElementById('btnText').innerText = 'Bắt Đầu Nhận Diện';

      // Reset right column
      document.getElementById('idleState').classList.remove('hidden');
      document.getElementById('errorCard').classList.add('hidden');
      document.getElementById('resultCard').classList.add('hidden');
    }

    function handleCancel() {
      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
        laserScan.classList.add('hidden');
        btnAnalyze.disabled = false;
        btnCancelText.innerText = 'Huỷ';
        document.getElementById('btnIcon').innerText = '🔍';
        document.getElementById('btnText').innerText = 'Bắt Đầu Nhận Diện';
        return;
      }
      resetAll();
    }

    async function loadSample(filename, name) {
      try {
        const res = await fetch('/samples/' + encodeURIComponent(filename));
        if (!res.ok) throw new Error('Không tải được ảnh mẫu');
        const blob = await res.blob();
        currentBlob = new File([blob], filename, { type: blob.type || 'image/jpeg' });
        showPreview(URL.createObjectURL(blob));
        analyzeImage();
      } catch (err) {
        showErrorBanner('Lỗi tải ảnh mẫu: ' + err.message);
      }
    }

    async function analyzeImage() {
      if (!currentBlob) return;

      activeAbortController = new AbortController();
      btnAnalyze.disabled = true;
      btnCancel.classList.remove('hidden');
      btnCancelText.innerText = 'Dừng quét';
      document.getElementById('btnIcon').innerText = '⏳';
      document.getElementById('btnText').innerText = 'Đang phân tích hình ảnh...';
      laserScan.classList.remove('hidden');

      const startTime = performance.now();
      const formData = new FormData();
      formData.append('file', currentBlob);
      formData.append('consent', 'true');

      try {
        const resp = await fetch('/detect', {
          method: 'POST',
          body: formData,
          signal: activeAbortController.signal
        });

        activeAbortController = null;
        const elapsed = Math.round(performance.now() - startTime);
        const data = await resp.json();

        laserScan.classList.add('hidden');
        btnAnalyze.disabled = false;
        btnCancelText.innerText = 'Huỷ';
        document.getElementById('btnIcon').innerText = '🔍';
        document.getElementById('btnText').innerText = 'Bắt Đầu Nhận Diện';

        if (!resp.ok) {
          showErrorBanner(data.detail || 'Không thể nhận diện ảnh');
          return;
        }

        renderResult(data, elapsed);
      } catch (err) {
        if (err.name === 'AbortError') {
          activeAbortController = null;
          laserScan.classList.add('hidden');
          btnAnalyze.disabled = false;
          btnCancelText.innerText = 'Huỷ';
          document.getElementById('btnIcon').innerText = '🔍';
          document.getElementById('btnText').innerText = 'Bắt Đầu Nhận Diện';
          return;
        }
        activeAbortController = null;
        laserScan.classList.add('hidden');
        btnAnalyze.disabled = false;
        btnCancelText.innerText = 'Huỷ';
        document.getElementById('btnIcon').innerText = '🔍';
        document.getElementById('btnText').innerText = 'Bắt Đầu Nhận Diện';
        showErrorBanner('Lỗi kết nối máy chủ: ' + err.message);
      }
    }

    function showErrorBanner(msg) {
      document.getElementById('idleState').classList.add('hidden');
      document.getElementById('resultCard').classList.add('hidden');
      const errorCard = document.getElementById('errorCard');
      const errorText = document.getElementById('errorMessageText');
      const visionHint = document.getElementById('visionErrorHint');
      errorText.textContent = String(msg || 'Không thể nhận diện ảnh');
      if (String(msg || '').includes('Google Cloud Vision')) {
        visionHint.classList.remove('hidden');
      } else {
        visionHint.classList.add('hidden');
      }
      errorCard.classList.remove('hidden');
    }

    function renderResult(data, elapsed) {
      document.getElementById('idleState').classList.add('hidden');
      document.getElementById('errorCard').classList.add('hidden');
      document.getElementById('resultCard').classList.remove('hidden');

      const name = data.displayName || data.name || data.location || 'Không xác định';
      document.getElementById('resName').innerText = name;
      document.getElementById('resSub').innerText = (data.category || 'Địa điểm') + (data.province ? ' • ' + data.province : '');
      document.getElementById('resDesc').innerText = data.description || 'Không có mô tả chi tiết.';
      document.getElementById('resReason').innerText = data.reason || 'Dự đoán dựa trên mô hình';
      document.getElementById('resLatency').innerText = `⏱️ Phản hồi: ${elapsed} ms`;

      // Confidence
      const conf = Math.round((data.confidence || 0) * 100);
      document.getElementById('resConfidence').innerText = conf + '%';
      document.getElementById('confidenceBar').style.width = conf + '%';

      // Engine badge
      const engineBadge = document.getElementById('engineBadge');
      if (data.engine === 'onnx' || data.source === 'trained_model') {
        engineBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        engineBadge.innerText = '🟢 ONNX Local Model';
      } else {
        engineBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30';
        engineBadge.innerText = '🔵 ' + (data.engine || 'Google Vision');
      }

      // Status badge
      const statusBadge = document.getElementById('statusBadge');
      if (data.recognitionStatus === 'identified') {
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        statusBadge.innerText = 'Độ chính xác cao (Identified)';
      } else if (data.recognitionStatus === 'predicted') {
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30';
        statusBadge.innerText = 'Dự đoán (Predicted)';
      } else {
        statusBadge.className = 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30';
        statusBadge.innerText = 'Chưa xác định rõ';
      }

      // Candidates
      const candContainer = document.getElementById('candidatesList');
      candContainer.replaceChildren();
      if (data.modelCandidates && data.modelCandidates.length > 0) {
        data.modelCandidates.forEach(cand => {
          const p = Math.max(0, Math.min(100, Math.round((Number(cand.score) || 0) * 100)));
          const rowEl = document.createElement('div');
          rowEl.className = 'flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded-lg border border-slate-800';

          const codeSpan = document.createElement('span');
          codeSpan.className = 'font-mono text-slate-300';
          codeSpan.textContent = String(cand.code || '');

          const rightWrap = document.createElement('div');
          rightWrap.className = 'flex items-center gap-2';

          const barBg = document.createElement('div');
          barBg.className = 'w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden';

          const barFill = document.createElement('div');
          barFill.className = 'h-full bg-sky-400 rounded-full';
          barFill.style.width = p + '%';
          barBg.appendChild(barFill);

          const pctSpan = document.createElement('span');
          pctSpan.className = 'font-semibold text-slate-200 w-8 text-right';
          pctSpan.textContent = p + '%';

          rightWrap.appendChild(barBg);
          rightWrap.appendChild(pctSpan);
          rowEl.appendChild(codeSpan);
          rowEl.appendChild(rightWrap);
          candContainer.appendChild(rowEl);
        });
      }

      document.getElementById('rawJsonBox').innerText = JSON.stringify(data, null, 2);
    }

    function toggleJson() {
      const box = document.getElementById('rawJsonBox');
      box.classList.toggle('hidden');
    }
  </script>
</body>
</html>
"""
