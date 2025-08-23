// 節目表頁面專用JavaScript
document.addEventListener('DOMContentLoaded', () => {
  let currentWeek = 0; // 0 = 本週, -1 = 上週, 1 = 下週
  let currentDay = 'monday';
  let scheduleData = null;

  // 初始化
  initSchedulePage();

  // 初始化節目表頁面
  async function initSchedulePage() {
    await loadScheduleData();
    setupEventListeners();
    updateWeekDisplay();
    loadDaySchedule(currentDay);
    
    // 每分鐘更新一次節目狀態
    setInterval(() => {
      loadDaySchedule(currentDay);
    }, 60000);
  }

  // 載入節目數據
  async function loadScheduleData() {
    try {
      const response = await fetch('schedule.json');
      scheduleData = await response.json();
    } catch (error) {
      console.error('載入節目數據失敗:', error);
      // 使用預設數據
      scheduleData = {
        today: {
          schedule: []
        }
      };
    }
  }

  // 設置事件監聽器
  function setupEventListeners() {
    // 週導覽按鈕
    document.getElementById('prevWeek')?.addEventListener('click', () => {
      currentWeek--;
      updateWeekDisplay();
      loadDaySchedule(currentDay);
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
      currentWeek++;
      updateWeekDisplay();
      loadDaySchedule(currentDay);
    });

    // 日期標籤
    document.querySelectorAll('.schedule-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const day = tab.dataset.day;
        if (day && day !== currentDay) {
          currentDay = day;
          updateActiveTab();
          loadDaySchedule(day);
        }
      });
    });

    // 模態框關閉
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('program-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'program-modal') {
        closeModal();
      }
    });

    // ESC鍵關閉模態框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // 獲取台灣時間
  function getTaiwanTime() {
    const now = new Date();
    // 使用更精確的台灣時區轉換
    const taiwanOffset = 8 * 60; // 台灣時區 UTC+8
    const localOffset = now.getTimezoneOffset(); // 本地時區偏移（分鐘）
    const taiwanTime = new Date(now.getTime() + (taiwanOffset + localOffset) * 60 * 1000);
    return taiwanTime;
  }

  // 更新週顯示（使用台灣時間）
  function updateWeekDisplay() {
    const weekDateRange = document.getElementById('weekDateRange');
    if (!weekDateRange) return;

    const taiwanTime = getTaiwanTime();
    const weekStart = new Date(taiwanTime);
    weekStart.setUTCDate(taiwanTime.getUTCDate() - taiwanTime.getUTCDay() + 1 + (currentWeek * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

    const formatDate = (date) => {
      return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
    };

    weekDateRange.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  }

  // 更新活動標籤
  function updateActiveTab() {
    document.querySelectorAll('.schedule-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-day="${currentDay}"]`)?.classList.add('active');
  }

  // 載入指定日期的節目表
  function loadDaySchedule(day) {
    const contentEl = document.getElementById('schedule-day-content');
    if (!contentEl) return;

    // 使用今天的節目數據作為範例（實際應用中會根據日期載入不同數據）
    const programs = scheduleData?.today?.schedule || [];
    
    if (programs.length === 0) {
      contentEl.innerHTML = `
        <div class="schedule-empty">
          <div class="empty-icon">📺</div>
          <h3>暫無節目安排</h3>
          <p>該時段目前沒有節目安排，請稍後再查看</p>
        </div>
      `;
      return;
    }

    // 過濾節目：只顯示當前和未來的節目
    const filteredPrograms = programs.filter(program => !isPastProgram(program));

    if (filteredPrograms.length === 0) {
      contentEl.innerHTML = `
        <div class="schedule-empty">
          <div class="empty-icon">📺</div>
          <h3>今日節目已結束</h3>
          <p>今日的節目已全部播放完畢，請查看其他日期的節目表</p>
        </div>
      `;
      return;
    }

    // 創建節目表
    const scheduleHTML = `
      <div class="schedule-header">
        <div class="time-header">時間</div>
        <div class="program-header">節目</div>
        <div class="duration-header">時長</div>
      </div>
      <div class="schedule-list">
        ${filteredPrograms.map(program => createProgramItem(program)).join('')}
      </div>
    `;

    contentEl.innerHTML = scheduleHTML;

    // 添加節目點擊事件
    document.querySelectorAll('.schedule-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        openProgramModal(filteredPrograms[index]);
      });
    });
  }

  // 創建節目項目
  function createProgramItem(program) {
    const isCurrent = isCurrentProgram(program);
    const isNext = isNextProgram(program);
    
    let statusClass = '';
    let statusText = '';
    
    if (isCurrent) {
      statusClass = 'current';
      statusText = '● 現正播放';
    } else if (isNext) {
      statusClass = 'next';
      statusText = '▶ 即將播出';
    }
    
    return `
      <div class="schedule-item ${statusClass}">
        <div class="schedule-time">${program.time}</div>
        <div class="schedule-program">
          <div class="program-title">${escapeHtml(program.title)}</div>
          <div class="program-category">${escapeHtml(program.category)}</div>
        </div>
        <div class="schedule-duration">${program.duration}分</div>
        ${statusText ? `<div class="program-status">${statusText}</div>` : ''}
      </div>
    `;
  }

  // 判斷是否為已播放過的節目
  function isPastProgram(program) {
    const taiwanTime = getTaiwanTime();
    const currentTime = taiwanTime.getUTCHours() * 60 + taiwanTime.getUTCMinutes();
    
    const [programHour, programMinute] = program.time.split(':').map(Number);
    const programStartTime = programHour * 60 + programMinute;
    const programEndTime = programStartTime + parseInt(program.duration);
    
    return currentTime >= programEndTime;
  }

  // 判斷是否為當前節目（使用台灣時間）
  function isCurrentProgram(program) {
    const taiwanTime = getTaiwanTime();
    const currentTime = taiwanTime.getUTCHours() * 60 + taiwanTime.getUTCMinutes();
    
    const [programHour, programMinute] = program.time.split(':').map(Number);
    const programStartTime = programHour * 60 + programMinute;
    const programEndTime = programStartTime + parseInt(program.duration);
    
    return currentTime >= programStartTime && currentTime < programEndTime;
  }

  // 判斷是否為下一個節目
  function isNextProgram(program) {
    const taiwanTime = getTaiwanTime();
    const currentTime = taiwanTime.getUTCHours() * 60 + taiwanTime.getUTCMinutes();
    
    const [programHour, programMinute] = program.time.split(':').map(Number);
    const programStartTime = programHour * 60 + programMinute;
    
    // 找到當前節目
    const programs = scheduleData?.today?.schedule || [];
    const currentProgram = programs.find(p => isCurrentProgram(p));
    
    if (!currentProgram) {
      // 如果沒有當前節目，第一個未播放的節目就是下一個
      return !isPastProgram(program) && !isCurrentProgram(program);
    }
    
    // 找到當前節目的結束時間
    const [currentHour, currentMinute] = currentProgram.time.split(':').map(Number);
    const currentStartTime = currentHour * 60 + currentMinute;
    const currentEndTime = currentStartTime + parseInt(currentProgram.duration);
    
    // 下一個節目是緊接在當前節目之後的節目
    return programStartTime === currentEndTime;
  }

  // 打開節目詳情模態框
  function openProgramModal(program) {
    const modal = document.getElementById('program-modal');
    if (!modal) return;

    // 填充模態框內容
    document.getElementById('modalProgramImage').src = program.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop';
    document.getElementById('modalProgramTime').textContent = program.time;
    document.getElementById('modalProgramTitle').textContent = program.title;
    document.getElementById('modalProgramCategory').textContent = program.category;
    document.getElementById('modalProgramDuration').textContent = `${program.duration}分鐘`;
    document.getElementById('modalProgramDescription').textContent = program.description;

    // 顯示模態框
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 關閉模態框
  function closeModal() {
    const modal = document.getElementById('program-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 轉義HTML
  function escapeHtml(s='') {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
});

// 添加節目表空狀態樣式
const style = document.createElement('style');
style.textContent = `
  .schedule-empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--text-color-light);
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 20px;
  }
  
  .schedule-empty h3 {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
    color: var(--text-color);
  }
  
  .schedule-empty p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }
`;
document.head.appendChild(style);
