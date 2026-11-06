/* script.js - oh,結び (omusubi) 共通スクリプト */
document.addEventListener('DOMContentLoaded', () => {
  // 交通手段選択のインタラクティブ制御
  const transportBtns = document.querySelectorAll('.transport-btn');
  transportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      transportBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // 投稿タグ選択のトグル処理
  const tags = document.querySelectorAll('.tag-selectable');
  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
    });
  });

  // 言語選択のトグル処理
  const langItems = document.querySelectorAll('.lang-item');
  langItems.forEach(item => {
    item.addEventListener('click', () => {
      langItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  // カメラボタン機能のダミー処理（画面遷移なし）
  const cameraBtn = document.getElementById('camera-btn');
  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
      alert('カメラ翻訳機能を起動しました（シミュレーション）');
    });
  }

  // マイクボタンのダミー処理
  const micBtn = document.getElementById('mic-btn');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      alert('音声の録音を開始します（シミュレーション）');
    });
  }
});
