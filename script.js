/* script.js - oh,結び (omusubi) 共通スクリプト */
document.addEventListener('DOMContentLoaded', () => {
  // --- 1. ユーザープロフィールの表示・更新 ---
  const storedName = localStorage.getItem('omusubi_user_name') || '利用者A';
  const displayUserName = document.getElementById('display-user-name');
  if (displayUserName) {
    displayUserName.textContent = storedName;
  }

  const nameInput = document.getElementById('user-name-input');
  if (nameInput) {
    nameInput.value = storedName;
  }

  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newName = nameInput.value.trim() || '利用者A';
      localStorage.setItem('omusubi_user_name', newName);

      const pushNotif = document.getElementById('notif-push')?.checked;
      const boardNotif = document.getElementById('notif-board')?.checked;
      const eventNotif = document.getElementById('notif-event')?.checked;

      localStorage.setItem('omusubi_notif_push', pushNotif ? 'true' : 'false');
      localStorage.setItem('omusubi_notif_board', boardNotif ? 'true' : 'false');
      localStorage.setItem('omusubi_notif_event', eventNotif ? 'true' : 'false');

      alert('プロフィールおよび通知設定を保存しました。');
      window.location.href = './home.html';
    });
  }

  // --- 2. 2枠言語選択 (From / To) の連動 & テキスト入力翻訳 ---
  let fromLang = localStorage.getItem('omusubi_from_lang') || '日本語';
  let toLang = localStorage.getItem('omusubi_to_lang') || '英語';

  const fromLangDisplay = document.getElementById('display-from-lang');
  const toLangDisplay = document.getElementById('display-to-lang');

  if (fromLangDisplay) fromLangDisplay.textContent = fromLang;
  if (toLangDisplay) toLangDisplay.textContent = toLang;

  // 言語入れ替えボタン
  const swapBtn = document.getElementById('swap-lang-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = fromLang;
      fromLang = toLang;
      toLang = temp;
      localStorage.setItem('omusubi_from_lang', fromLang);
      localStorage.setItem('omusubi_to_lang', toLang);
      if (fromLangDisplay) fromLangDisplay.textContent = fromLang;
      if (toLangDisplay) toLangDisplay.textContent = toLang;
      
      // テキスト入力があれば自動再翻訳
      doTextTranslate();
    });
  }

  // テキスト文字入力翻訳機能
  const textInputElem = document.getElementById('translate-text-input');
  const translateBtnElem = document.getElementById('do-translate-btn');
  const outputElem = document.getElementById('translate-output-text');

  function doTextTranslate() {
    if (!textInputElem || !outputElem) return;
    const inputText = textInputElem.value.trim();
    if (!inputText) {
      outputElem.innerHTML = '<div style="color:#888;">翻訳したいテキストを上に入力してください。</div>';
      return;
    }

    // 擬似翻訳ロジック（言語設定に応じた変換表示）
    let translatedText = '';
    if (toLang === '英語') {
      translatedText = `[English Translation]: "${inputText}" (Simulated translated text into English)`;
    } else if (toLang === '韓国語') {
      translatedText = `[한국어 번역]: "${inputText}" (Simulated translated text into Korean)`;
    } else if (toLang === '中国語') {
      translatedText = `[中文翻译]: "${inputText}" (Simulated translated text into Chinese)`;
    } else {
      translatedText = `[${toLang}への翻訳]: "${inputText}"`;
    }

    outputElem.innerHTML = `
      <div style="font-weight:bold; color:#666; font-size:12px; margin-bottom:4px;">${fromLang} ➔ ${toLang}</div>
      <div style="font-size:14px; color:#555; margin-bottom:8px;">「${inputText}」</div>
      <hr style="border:0; border-top:1px dashed #ccc; margin:8px 0;">
      <div style="font-size:16px; color:#000; font-weight:bold;">${translatedText}</div>
    `;
  }

  if (translateBtnElem) {
    translateBtnElem.addEventListener('click', doTextTranslate);
  }
  if (textInputElem) {
    textInputElem.addEventListener('input', () => {
      if (textInputElem.value.trim().length > 0) {
        doTextTranslate();
      }
    });
  }

  // 言語選択画面 (language.html) の設定
  const fromItems = document.querySelectorAll('.lang-item-from');
  const toItems = document.querySelectorAll('.lang-item-to');

  if (fromItems.length > 0) {
    fromItems.forEach(item => {
      if (item.getAttribute('data-lang') === fromLang) {
        fromItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      }
      item.addEventListener('click', () => {
        fromItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        fromLang = item.getAttribute('data-lang');
        localStorage.setItem('omusubi_from_lang', fromLang);
      });
    });
  }

  if (toItems.length > 0) {
    toItems.forEach(item => {
      if (item.getAttribute('data-lang') === toLang) {
        toItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      }
      item.addEventListener('click', () => {
        toItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        toLang = item.getAttribute('data-lang');
        localStorage.setItem('omusubi_to_lang', toLang);
      });
    });
  }

  // --- 3. 掲示板へのリアルタイム投稿＆読み込み機能 ---
  const postSubmitBtn = document.getElementById('submit-post-btn');
  if (postSubmitBtn) {
    postSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const spotName = document.getElementById('post-spot-select')?.value || '吉村食堂';
      const commentText = document.getElementById('post-comment-input')?.value.trim() || '';
      
      // 選択されたタグの収集
      const selectedTags = [];
      document.querySelectorAll('.tag-selectable.selected').forEach(tag => {
        const isSpecial = tag.classList.contains('tag-special');
        selectedTags.push({
          name: tag.textContent.trim(),
          isSpecial: isSpecial
        });
      });

      if (selectedTags.length === 0 && !commentText) {
        alert('タグを選択するか、コメントを入力してください。');
        return;
      }

      const newPost = {
        id: Date.now(),
        spot: spotName,
        time: 'たった今',
        comment: commentText,
        tags: selectedTags
      };

      // localStorageに保存
      const existingPosts = JSON.parse(localStorage.getItem('omusubi_custom_posts') || '[]');
      existingPosts.unshift(newPost);
      localStorage.setItem('omusubi_custom_posts', JSON.stringify(existingPosts));

      // 投稿後、獲得ポイントを+5加算
      let userPoints = parseInt(localStorage.getItem('omusubi_user_points') || '12', 10);
      userPoints += 5;
      localStorage.setItem('omusubi_user_points', userPoints.toString());

      alert('【投稿完了】掲示板に投稿されました！\n（情報提供ボーナス：+5pt 獲得！）');
      window.location.href = './board.html';
    });
  }

  // 掲示板画面 (board.html) での動的投稿表示
  const boardPostsContainer = document.getElementById('user-posts-container');
  if (boardPostsContainer) {
    const customPosts = JSON.parse(localStorage.getItem('omusubi_custom_posts') || '[]');
    if (customPosts.length > 0) {
      customPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        if (post.tags.some(t => t.isSpecial)) {
          card.style.border = '2px solid #ffb3b3';
          card.style.background = '#fff0f0';
        }

        let tagsHtml = '';
        post.tags.forEach(t => {
          tagsHtml += `<span class="tag ${t.isSpecial ? 'tag-special' : ''}">${t.name}</span> `;
        });

        card.innerHTML = `
          <div class="post-header">
            <span>${post.spot}</span>
            <span style="font-size:12px; color:#888;">${post.time}</span>
          </div>
          ${post.comment ? `<p style="font-size:14px; font-weight:bold; color:#333; margin-bottom:6px;">${post.comment}</p>` : ''}
          <div class="tag-list">
            ${tagsHtml}
          </div>
          <div style="font-size:12px; color:#888; margin-top:8px;">[外国人画面自動変換: Live update from user]</div>
        `;

        boardPostsContainer.prepend(card);
      });
    }
  }

  // --- 4. 獲得ポイント＆保有特典・クーポン管理 ---
  let userPoints = parseInt(localStorage.getItem('omusubi_user_points') || '12', 10);
  const pointDisplayElems = document.querySelectorAll('.user-point-val');
  pointDisplayElems.forEach(elem => elem.textContent = userPoints);

  // 初期所有特典のセットアップ（まだ何もなければサンプル保有特典を1つ用意）
  if (!localStorage.getItem('omusubi_my_rewards')) {
    const defaultRewards = [
      { id: 101, title: '吉村食堂 名物おむすび1個無料券', date: '2026/11/11 獲得', code: 'COUPON-8821' }
    ];
    localStorage.setItem('omusubi_my_rewards', JSON.stringify(defaultRewards));
  }

  // 保有特典一覧の描画関数
  function renderMyRewards() {
    const myRewardsContainer = document.getElementById('my-rewards-container');
    if (!myRewardsContainer) return;

    const myRewards = JSON.parse(localStorage.getItem('omusubi_my_rewards') || '[]');
    if (myRewards.length === 0) {
      myRewardsContainer.innerHTML = '<div style="font-size:13px; color:#888; text-align:center; padding:12px; background:#f9f9f9; border-radius:6px;">現在獲得している特典・クーポンはありません。</div>';
      return;
    }

    let html = '';
    myRewards.forEach(r => {
      html += `
        <div class="my-reward-card">
          <div>
            <h4>🎟️ ${r.title}</h4>
            <p style="color:#e65100; font-weight:bold; font-size:12px;">【利用可能】 コード: ${r.code || 'USE-NOW'}</p>
            <p>${r.date}</p>
          </div>
          <button type="button" class="btn btn-use-reward" data-id="${r.id}" style="width:auto; padding:6px 12px; font-size:12px; margin-bottom:0; background:#333; color:#fff;">使用する</button>
        </div>
      `;
    });
    myRewardsContainer.innerHTML = html;

    // クーポン使用ボタンのイベント登録
    document.querySelectorAll('.btn-use-reward').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToUse = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('このクーポンを店舗スタッフに提示して使用しますか？')) {
          let updated = JSON.parse(localStorage.getItem('omusubi_my_rewards') || '[]');
          updated = updated.filter(item => item.id !== idToUse);
          localStorage.setItem('omusubi_my_rewards', JSON.stringify(updated));
          alert('クーポンを使用しました！');
          renderMyRewards();
        }
      });
    });
  }

  renderMyRewards();

  // 特典交換処理
  const exchangeBtns = document.querySelectorAll('.btn-exchange');
  exchangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);
      const rewardTitle = btn.getAttribute('data-title') || '特典';
      
      if (userPoints >= cost) {
        userPoints -= cost;
        localStorage.setItem('omusubi_user_points', userPoints.toString());
        pointDisplayElems.forEach(elem => elem.textContent = userPoints);

        // My特典リストに追加
        const myRewards = JSON.parse(localStorage.getItem('omusubi_my_rewards') || '[]');
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} 交換`;
        const randomCode = 'CPN-' + Math.floor(1000 + Math.random() * 9000);

        myRewards.unshift({
          id: Date.now(),
          title: rewardTitle,
          date: dateStr,
          code: randomCode
        });
        localStorage.setItem('omusubi_my_rewards', JSON.stringify(myRewards));

        renderMyRewards();
        alert(`【交換完了】「${rewardTitle}」を獲得しました！\n「My特典・保有クーポン」に追加されました。`);
      } else {
        alert(`ポイントが足りません（必要：${cost}pt / 所持：${userPoints}pt）`);
      }
    });
  });

  // --- 5. 通知設定の初期値反映 ---
  const pushNotifElem = document.getElementById('notif-push');
  if (pushNotifElem) pushNotifElem.checked = localStorage.getItem('omusubi_notif_push') !== 'false';
  const boardNotifElem = document.getElementById('notif-board');
  if (boardNotifElem) boardNotifElem.checked = localStorage.getItem('omusubi_notif_board') !== 'false';
  const eventNotifElem = document.getElementById('notif-event');
  if (eventNotifElem) eventNotifElem.checked = localStorage.getItem('omusubi_notif_event') === 'true';

  // --- 6. アバター選択機能 ---
  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  const avatarFileInput = document.getElementById('avatar-file-input');
  if (changeAvatarBtn && avatarFileInput) {
    changeAvatarBtn.addEventListener('click', () => avatarFileInput.click());
    avatarFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previews = document.querySelectorAll('.avatar-preview');
          previews.forEach(p => p.src = event.target.result);
          localStorage.setItem('omusubi_avatar_data', event.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  const savedAvatar = localStorage.getItem('omusubi_avatar_data');
  if (savedAvatar) {
    const previews = document.querySelectorAll('.avatar-preview');
    previews.forEach(p => p.src = savedAvatar);
  }

  // --- 7. 交通手段選択 ---
  const transportBtns = document.querySelectorAll('.transport-btn');
  transportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      transportBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // --- 8. 投稿タグ複数選択 ---
  const tags = document.querySelectorAll('.tag-selectable');
  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
    });
  });

  // --- 9. カメラ・マイク模擬起動 ---
  const cameraBtn = document.getElementById('camera-btn');
  if (cameraBtn) {
    cameraBtn.addEventListener('click', () => {
      alert('カメラ翻訳機能を起動しました（シミュレーション）');
    });
  }

  const micBtn = document.getElementById('mic-btn');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      alert('音声の録音を開始します（シミュレーション）');
    });
  }
});
