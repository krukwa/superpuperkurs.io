// main.js - Кодекс Рыцаря
document.addEventListener('DOMContentLoaded', function() {
    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    const state = {
        user: null,
        currentModule: 1,
        currentLesson: 1,
        lessons: {},
        timer: null,
        timerSeconds: 0,
        isPlaying: false,
        musicEnabled: true,
        selectedTool: 'empty',
        demoMode: null, // 'teacher' | 'student' or null
        gridSize: { rows: 5, cols: 5 },
        currentLevel: {
            start: { x: 0, y: 0 },
            goal: { x: 4, y: 4 },
            walls: [[1, 1], [2, 2]],
            spikes: [[3, 3]]
        }
        ,
        mandatoryRegisterActive: false
    };

    // Примеры уроков
    const lessonsData = {
        1: {
            1: {
                title: "Первые шаги рыцаря",
                description: "Доберитесь до сокровища используя команды right и down",
                start: [0, 0],
                goal: [4, 4],
                walls: [[1, 1], [2, 2], [3, 3]],
                spikes: [],
                solution: "right right down right"
            },
            2: {
                title: "Обход препятствий",
                description: "Обойдите стены чтобы достичь цели",
                start: [0, 2],
                goal: [4, 2],
                walls: [[1, 1], [2, 1], [3, 1], [1, 3], [2, 3], [3, 3]],
                spikes: [],
                solution: "down down right right right right up up"
            },
            3: {
                title: "Опасные ловушки",
                description: "Избегайте ловушек на пути",
                start: [0, 0],
                goal: [4, 4],
                walls: [],
                spikes: [[1, 1], [2, 2], [3, 3]],
                solution: "right down right down right"
            },
            4: {
                title: "Комбинированный путь",
                description: "Используйте все доступные команды",
                start: [2, 0],
                goal: [2, 4],
                walls: [[2, 1], [1, 2], [3, 2], [2, 3]],
                spikes: [[0, 2], [4, 2]],
                solution: "right right down down down left left"
            }
        },
        2: {
            1: { title: "Базовая навигация", start: [0, 0], goal: [4, 4], walls: [], spikes: [] },
            2: { title: "Зигзагообразный путь", start: [0, 0], goal: [4, 4], walls: [], spikes: [] },
            3: { title: "Лабиринт новичка", start: [0, 0], goal: [4, 4], walls: [], spikes: [] },
            4: { title: "Поиск выхода", start: [0, 0], goal: [4, 4], walls: [], spikes: [] },
            5: { title: "Быстрый маршрут", start: [0, 0], goal: [4, 4], walls: [], spikes: [] }
        }
        ,
        3: {
            1: { title: "Легко и просто", start: [0,0], goal: [4,4], walls:[[1,0],[1,1]], spikes:[], solution: "right right down right right" },
            2: { title: "Лабиринт стража", start: [0,1], goal: [4,1], walls:[[1,1],[2,1],[3,1]], spikes:[[2,2]], solution: "right right right right" },
            3: { title: "Переходы", start:[2,0], goal:[2,4], walls:[[1,2],[3,2]], spikes:[], solution: "down down down" }
        },
        4: {
            1: { title: "Противник неожиданности", start:[0,0], goal:[4,4], walls:[], spikes:[[1,1],[3,3]], solution: "right 2 down 2 right" },
            2: { title: "Комбинации и ловушки", start:[0,0], goal:[4,4], walls:[[2,1],[2,2]], spikes:[[3,2]], solution: "repeat 2 [ right down ] right" }
        },
        5: {
            1: { title: "Финал", start:[0,0], goal:[4,4], walls:[[1,0],[1,1],[1,2]], spikes:[[2,2]], solution: "repeat 2 [ right down ] right" },
            2: { title: "Большой лабиринт", start:[0,0], goal:[4,4], walls:[[1,0],[1,1],[2,1],[3,1],[1,3],[2,3],[3,3]], spikes:[[2,2],[4,1]], solution: "right 4 down 4" }
        }
    };

    // Ключи правильных ответов для тестов (используются для автоматической проверки)
    const testKeys = {
        1: { q1: 'B', q2: 'a', q4: 'true' },
        2: { t2q1: ['right','down'], t2q2: 'b' },
        3: { m3q1: ['opt2'], m3q2: '2' },
        4: { m4q1: 'b' },
        5: { m5q1: 'a' }
    };

    // ========== DOM ЭЛЕМЕНТЫ ==========
    const elements = {
        // Секции
        sections: document.querySelectorAll('.section'),
        home: document.getElementById('home'),
        modules: document.getElementById('modules'),
        lesson: document.getElementById('lesson'),
        register: document.getElementById('register'),
        account: document.getElementById('account'),
        settings: document.getElementById('settings'),
        
        // Навигация
        menuButton: document.getElementById('menu-button'),
        menuDropdown: document.getElementById('menu-dropdown'),
        soundButton: document.getElementById('sound-button'),
        headerRegisterBtn: document.getElementById('header-register-btn'),
        
        // Кнопки
        startButton: document.getElementById('start-button'),
        backFromModules: document.getElementById('back-from-modules'),
        backFromLesson: document.getElementById('back-from-lesson'),
        
        // Регистрация
        regEmail: document.getElementById('reg-email'),
        regName: document.getElementById('reg-name'),
        regRole: document.getElementById('reg-role'),
        regSubmit: document.getElementById('reg-submit'),
        regAutoTeacher: document.getElementById('reg-auto-teacher'),
        regAutoStudent: document.getElementById('reg-auto-student'),
        regStatus: document.getElementById('reg-status'),
        // Registration modal (optional)
        registerModal: document.getElementById('register-modal'),
        regEmailModal: document.getElementById('reg-email-modal'),
        regNameModal: document.getElementById('reg-name-modal'),
        regRoleModal: document.getElementById('reg-role-modal'),
        regSubmitModal: document.getElementById('reg-submit-modal'),
        regCancelModal: document.getElementById('reg-cancel-modal'),
        regStatusModal: document.getElementById('reg-status-modal'),
        regLogout: document.getElementById('reg-logout'),
        
        // Аккаунт
        accountName: document.getElementById('account-name'),
        accountEmail: document.getElementById('account-email'),
        accountRole: document.getElementById('account-role'),
        accountCompleted: document.getElementById('account-completed'),
        accountAverage: document.getElementById('account-average'),
        accountList: document.getElementById('account-list'),
        accountRefresh: document.getElementById('account-refresh'),
        accountBack: document.getElementById('account-back'),
        
        // Урок
        lessonTitle: document.getElementById('lesson-title'),
        codeInput: document.getElementById('code-input'),
        runCode: document.getElementById('run-code'),
        resetScene: document.getElementById('reset-scene'),
        editLevel: document.getElementById('edit-level'),
        grid: document.getElementById('grid'),
        status: document.getElementById('status'),
        timerDisplay: document.getElementById('timer-display'),
        
        // Теория
        theoryOverlay: document.getElementById('theory-overlay'),
        theoryTitle: document.getElementById('theory-title'),
        theoryContent: document.getElementById('theory-content'),
        closeTheory: document.getElementById('close-theory'),
        
        // Редактор
        editorOverlay: document.getElementById('editor-overlay'),
        editorGrid: document.getElementById('editor-grid'),
        editorSave: document.getElementById('editor-save'),
        editorCancel: document.getElementById('editor-cancel'),
        // Demo modal elements
        demoModal: document.getElementById('demo-modal'),
        demoTeacher: document.getElementById('demo-teacher'),
        demoStudent: document.getElementById('demo-student'),
        demoExit: document.getElementById('demo-exit'),
        
        // Настройки
        volume: document.getElementById('volume'),
        volLabel: document.getElementById('vol-label'),
        playlistSelect: document.getElementById('playlist-select'),
        fontSize: document.getElementById('font-size'),
        fontSizeLabel: document.getElementById('font-size-label'),
        
        // Аудио
        bgMusic: document.getElementById('bg-music')
    };

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        loadUser();
        setupEventListeners();
        loadLessons();
        updateUI();
        setupAudio();
        
        // Показать уведомление о загрузке
        showNotification('Добро пожаловать в Кодекс Рыцаря!', 'info');
        
        // Проверить и загрузить аудио
        checkAudioFiles();

        // Show mandatory register modal on first visit, if user is not registered
        const firstVisitShown = localStorage.getItem('knight_first_visit_shown');
        if (!firstVisitShown && !state.user && !state.demoMode && elements.registerModal) {
            // Mark that we've shown the first-visit modal so it doesn't reappear on refresh
            localStorage.setItem('knight_first_visit_shown', 'true');
            state.mandatoryRegisterActive = true;
            // hide the cancel button while mandatory active
            if (elements.regCancelModal) elements.regCancelModal.style.display = 'none';
            elements.registerModal.style.display = 'flex';
        }
    }

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    function setupEventListeners() {
        // Навигация по меню
        elements.menuButton.addEventListener('click', toggleMenu);

        // Закрывать меню при клике вне его
        document.addEventListener('click', (e) => {
            const dropdown = elements.menuDropdown;
            const btn = elements.menuButton;
            
            if (!dropdown || !btn) return;
            
            // Если клик был не по кнопке меню и не по самому меню
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Закрывать меню/оверлеи по Esc
        document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                if (elements.menuDropdown && elements.menuDropdown.style.display === 'block') {
                    elements.menuDropdown.style.display = 'none';
                    elements.menuButton.setAttribute('aria-expanded', 'false');
                }
                if (elements.editorOverlay && elements.editorOverlay.style.display === 'flex') {
                    closeEditor();
                }
                if (elements.theoryOverlay && elements.theoryOverlay.style.display === 'flex') {
                    elements.theoryOverlay.style.display = 'none';
                }
                // Do not allow closing mandatory register modal with Escape
                if (elements.registerModal && elements.registerModal.style.display === 'flex' && state.mandatoryRegisterActive) {
                    // keep it open
                } else if (elements.registerModal && elements.registerModal.style.display === 'flex') {
                    elements.registerModal.style.display = 'none';
                }
            }
        });

        // Навигация по секциям
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.getAttribute('data-target');
                // If this is register and we have a modal, open the modal instead of switching sections
                if (item.id === 'menu-register' && elements.registerModal) {
                    e.stopPropagation();
                    elements.registerModal.style.display = 'flex';
                } else {
                    showSection(target);
                }
                elements.menuDropdown.style.display = 'none';
                elements.menuButton.setAttribute('aria-expanded', 'false');
            });
        });

        // Главные кнопки
        elements.startButton.addEventListener('click', () => showSection('modules'));
        elements.backFromModules.addEventListener('click', () => showSection('home'));
        elements.backFromLesson.addEventListener('click', () => showSection('modules'));

        // Регистрация
        elements.regSubmit.addEventListener('click', registerUser);
        if (elements.regSubmitModal) elements.regSubmitModal.addEventListener('click', registerUser);
        if (elements.regCancelModal) elements.regCancelModal.addEventListener('click', () => { if (elements.registerModal) elements.registerModal.style.display = 'none'; });
        if (elements.regLogout) elements.regLogout.addEventListener('click', logout);
        elements.regAutoTeacher.addEventListener('click', () => autoRegister('teacher'));
        elements.regAutoStudent.addEventListener('click', () => autoRegister('student'));

        // Аккаунт
        elements.accountRefresh.addEventListener('click', updateAccountInfo);
        elements.accountBack.addEventListener('click', () => showSection('home'));

        // Урок
        elements.runCode.addEventListener('click', executeCode);
        elements.resetScene.addEventListener('click', resetScene);
        elements.editLevel.addEventListener('click', openEditor);

        // Теория
        elements.closeTheory.addEventListener('click', () => {
            elements.theoryOverlay.style.display = 'none';
        });

        // Редактор
        elements.editorSave.addEventListener('click', saveCustomLevel);
        elements.editorCancel.addEventListener('click', closeEditor);

        // Настройки
        elements.volume.addEventListener('input', updateVolume);
        elements.playlistSelect.addEventListener('change', changeMusic);
        elements.fontSize.addEventListener('input', updateFontSize);
        elements.soundButton.addEventListener('click', toggleSound);

        // Закрытие модальных окон по клику на оверлей
        elements.theoryOverlay.addEventListener('click', (e) => {
            if (e.target === elements.theoryOverlay) {
                elements.theoryOverlay.style.display = 'none';
            }
        });
        
        elements.editorOverlay.addEventListener('click', (e) => {
            if (e.target === elements.editorOverlay) {
                closeEditor();
            }
        });

        // Обработчики для модулей и уроков
        document.querySelectorAll('.module-header').forEach(header => {
            header.addEventListener('click', function() {
                const moduleId = this.getAttribute('data-module');
                const lessonList = document.querySelector(`.lesson-list[data-module="${moduleId}"]`);
                const arrow = this.querySelector('span');
                
                if (lessonList) {
                    const isOpening = !lessonList.classList.contains('open');
                    
                    // Закрываем все другие открытые списки
                    document.querySelectorAll('.lesson-list.open').forEach(list => {
                        if (list !== lessonList) {
                            list.classList.remove('open');
                            const otherHeader = list.closest('.module-card').querySelector('.module-header span');
                            if (otherHeader) otherHeader.style.transform = 'rotate(0deg)';
                        }
                    });
                    
                    // Переключаем текущий список
                    lessonList.classList.toggle('open');
                    
                    // Анимируем стрелку (поворот вместо смены символа)
                    if (lessonList.classList.contains('open')) {
                        arrow.style.transform = 'rotate(180deg)';
                    } else {
                        arrow.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });

        document.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const moduleId = this.getAttribute('data-module');
                const lessonId = this.getAttribute('data-lesson');
                // Only allow opening a lesson if the user is registered or demo mode is active
                if (!state.user && !state.demoMode) {
                    // show demo or register prompt
                    if (elements.demoModal) {
                        elements.demoModal.style.display = 'flex';
                    } else {
                        showSection('register');
                    }
                    showNotification('Нужна регистрация или демо просмотр, чтобы открыть урок.', 'warning');
                    return;
                }

                loadLesson(parseInt(moduleId), parseInt(lessonId));
            });
        });

        // Open module test modals
        document.querySelectorAll('.open-test').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const targetId = this.getAttribute('data-target');
                const modal = document.getElementById(targetId);
                if (modal) {
                    modal.style.display = 'flex';
                }
            });
        });

        // Close test modals by close button
        document.querySelectorAll('.close-test').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const modal = btn.closest('.modal-overlay');
                if (modal) modal.style.display = 'none';
            });
        });

        // Generic click-on-overlay to close any modal overlay
        document.querySelectorAll('.modal-overlay').forEach(mod => {
            mod.addEventListener('click', function(e) {
                if (e.target === this) {
                    // do not allow closing the mandatory register modal by clicking overlay
                    if (this.id === 'register-modal' && state.mandatoryRegisterActive) return;
                    this.style.display = 'none';
                }
            });
        });

        // Handle test form submissions (save + basic auto-grade)
        document.querySelectorAll('.modal form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const modal = form.closest('.modal-overlay');
                if (!modal) return;
                const m = modal.id.match(/test-modal-(\d+)/);
                const moduleId = m ? parseInt(m[1]) : null;
                const result = gradeForm(form, moduleId);
                saveTestResult(moduleId, result.score, result.responses);
                showNotification(moduleId ? `Результат теста модуля ${moduleId}: ${result.score}%` : `Результат: ${result.score}%`, 'info');
                modal.style.display = 'none';
            });
        });

        // Theory sidebar open/close
        const openFullTheory = document.getElementById('open-full-theory');
        const closeTheorySidebar = document.getElementById('close-theory-sidebar');
        const theorySidebar = document.getElementById('theory-sidebar');
        if (openFullTheory) openFullTheory.addEventListener('click', () => { 
            elements.theoryOverlay.style.display = 'flex'; 
        });
        if (closeTheorySidebar && theorySidebar) closeTheorySidebar.addEventListener('click', () => { 
            theorySidebar.style.display = 'none'; 
        });

        // Кнопка выхода из аккаунта
        const logoutBtn = document.getElementById('menu-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        // Menu-register should open modal if available
        const registerMenuBtn = document.getElementById('menu-register');
        if (registerMenuBtn && elements.registerModal) {
            registerMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.registerModal.style.display = 'flex';
            });
        }
        if (elements.headerRegisterBtn && elements.registerModal) {
            elements.headerRegisterBtn.addEventListener('click', () => {
                elements.registerModal.style.display = 'flex';
            });
        }
        // Demo menu handling
        const demoMenuButton = document.getElementById('menu-demo');
        if (demoMenuButton) demoMenuButton.addEventListener('click', openDemoModal);
        if (elements.demoTeacher) elements.demoTeacher.addEventListener('click', () => setDemoMode('teacher'));
        if (elements.demoStudent) elements.demoStudent.addEventListener('click', () => setDemoMode('student'));
        if (elements.demoExit) elements.demoExit.addEventListener('click', exitDemoMode);
    }

    // ========== ФУНКЦИИ МЕНЮ ==========
    function toggleMenu(e) {
        e.stopPropagation();
        
        const isExpanded = elements.menuButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            elements.menuDropdown.style.display = 'none';
            elements.menuButton.setAttribute('aria-expanded', 'false');
        } else {
            elements.menuDropdown.style.display = 'block';
            elements.menuButton.setAttribute('aria-expanded', 'true');
        }
    }

    // ========== СИСТЕМА ПОЛЬЗОВАТЕЛЯ ==========
    function loadUser() {
        const saved = localStorage.getItem('knight_user');
        if (saved) {
            state.user = JSON.parse(saved);
            updateMenuVisibility();
            updateAccountInfo();
        }
    }

    function saveUser() {
        if (state.user) {
            localStorage.setItem('knight_user', JSON.stringify(state.user));
        }
    }

    function registerUser() {
        const { email, name, role } = getRegInputValues();

        if (!email || !name) {
            showNotification('Заполните все поля!', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('Введите корректный email!', 'error');
            return;
        }

        state.user = {
            email,
            name,
            role,
            completedLessons: [],
            completedTests: [],
            achievements: [],
            joinDate: new Date().toISOString()
        };

        saveUser();
        // If registration completed, disable mandatory modal flag and show cancel
        state.mandatoryRegisterActive = false;
        if (elements.regCancelModal) elements.regCancelModal.style.display = '';
        updateUI();
        showNotification(`Добро пожаловать, ${name}!`, 'success');
        if (elements.registerModal) elements.registerModal.style.display = 'none';
        showSection('account');
        if (role === 'teacher') {
            showNotification('Редактор уровней доступен — вы Магистр Ордена', 'success');
        }
    }

    function getRegInputValues() {
        // Prefer modal inputs if present and contain values; otherwise fallback to page inputs
        const email = (elements.regEmailModal && elements.regEmailModal.value.trim()) || (elements.regEmail && elements.regEmail.value.trim()) || '';
        const name = (elements.regNameModal && elements.regNameModal.value.trim()) || (elements.regName && elements.regName.value.trim()) || '';
        const role = (elements.regRoleModal && elements.regRoleModal.value) || (elements.regRole && elements.regRole.value) || 'student';
        return { email, name, role };
    }

    function autoRegister(role) {
        const names = {
            teacher: ['Сэр Гавейн', 'Лорд Артур', 'Герцог Ричард', 'Барон Леонид'],
            student: ['Оруженосец Иван', 'Паж Алексей', 'Стражник Петр', 'Новичок Дмитрий']
        };
        
        const randomName = names[role][Math.floor(Math.random() * names[role].length)];
        const email = `${randomName.toLowerCase().replace(/\s+/g, '.')}@castle.knight`;
        
        elements.regEmail.value = email;
        elements.regName.value = randomName;
        elements.regRole.value = role;
        
        registerUser();
    }

    function logout() {
        if (state.demoMode) exitDemoMode();
        state.user = null;
        localStorage.removeItem('knight_user');
        updateUI();
        showSection('home');
        showNotification('Вы покинули орден', 'info');
    }

    function openDemoModal() {
        if (elements.demoModal) elements.demoModal.style.display = 'flex';
    }

    function setDemoMode(role) {
        // role: 'teacher' or 'student'
        state.demoMode = role;
        state.mandatoryRegisterActive = false;
        // ensure cancel button is shown after demo
        if (elements.regCancelModal) elements.regCancelModal.style.display = '';
        state.user = null; // ensure no real user active
        if (elements.demoModal) elements.demoModal.style.display = 'none';
        updateMenuVisibility();
        updateUI();
        showNotification(`Демо-режим: просмотр как ${role === 'teacher' ? 'Магистр' : 'Оруженосец'}`, 'info');
        showSection('modules');
        if (role === 'teacher') showNotification('Редактор уровней доступен в демо-режиме', 'success');
    }

    function exitDemoMode() {
        if (!state.demoMode) return;
        state.demoMode = null;
        updateMenuVisibility();
        updateUI();
        showNotification('Демо-режим завершен', 'info');
        showSection('home');
    }

    // ========== СИСТЕМА УРОКОВ ==========
    function loadLessons() {
        state.lessons = lessonsData;
    }

    function loadLesson(moduleId, lessonId) {
        const lesson = state.lessons[moduleId]?.[lessonId];
        if (!lesson) {
            showNotification('Урок не найден!', 'error');
            return;
        }

        state.currentModule = moduleId;
        state.currentLesson = lessonId;
        state.currentLevel = {
            start: { x: lesson.start[0], y: lesson.start[1] },
            goal: { x: lesson.goal[0], y: lesson.goal[1] },
            walls: lesson.walls || [],
            spikes: lesson.spikes || []
        };

        elements.lessonTitle.textContent = `Турнир ${moduleId}.${lessonId}: ${lesson.title}`;
        elements.codeInput.value = lesson.solution || 'right right down right';
        showSection('lesson');
        renderGrid();
        startTimer();
        updateStatus('Готов к испытанию!');
        
        // Показать теорию для первого урока каждого модуля
        if (lessonId === 1) {
            setTimeout(() => showTheory(lesson), 1000);
        }
    }

    function showTheory(lesson) {
        elements.theoryTitle.textContent = lesson.title;
        elements.theoryContent.innerHTML = `
            <h3>📖 ${lesson.description}</h3>
            <div style="margin-top:15px;padding:15px;background:rgba(212,175,55,0.1);border-radius:var(--radius-sm)">
                <strong>Команды рыцаря:</strong><br>
                • <code>right</code> - шаг вправо<br>
                • <code>left</code> - шаг влево<br>
                • <code>up</code> - шаг вверх<br>
                • <code>down</code> - шаг вниз<br>
                • <code>right 3</code> - 3 шага вправо<br>
                • <code>repeat 2 [right down]</code> - повторить команды 2 раза (вложенные repeat поддерживаются)<br>
                • <code>if canmove right [right] else [down]</code> - выполнить блок then/else в зависимости от условия (условия: <code>canmove</code>, <code>wall</code>, <code>spike</code>, <code>goal</code> + направление)<br>
                • <code>jump (down)</code> - прыжок в указанном направлении через одну клетку; допустимо только если промежуточная клетка — <code>spike</code>. Форматы: <code>jump down</code> или <code>jump (down)</code>
            </div>
            ${lesson.solution ? `
            <div style="margin-top:15px;padding:15px;background:rgba(34,139,34,0.1);border-radius:var(--radius-sm)">
                <strong>Пример решения:</strong><br>
                <code>${lesson.solution}</code>
            </div>` : ''}
        `;
        elements.theoryOverlay.style.display = 'flex';
    }

    // ========== ТЕСТОВАЯ ЛОГИКА (ГРАДИНГ И СОХРАНЕНИЕ) ==========
    function gradeForm(form, moduleId) {
        const data = {};
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            const name = input.name || input.getAttribute('data-name');
            if (!name) return;
            if (input.type === 'radio') {
                if (input.checked) data[name] = input.value || input.nextSibling?.textContent?.trim();
            } else if (input.type === 'checkbox') {
                if (!data[name]) data[name] = [];
                if (input.checked) data[name].push(input.value || input.nextSibling?.textContent?.trim());
            } else {
                data[name] = input.value;
            }
        });
        
        form.querySelectorAll('select').forEach(sel => { 
            data[sel.name || 'select'] = sel.value; 
        });
        
        form.querySelectorAll('textarea').forEach(ta => { 
            data[ta.name || 'text'] = ta.value.trim(); 
        });

        const key = testKeys[moduleId] || {};
        const results = { total: 0, correct: 0, details: {} };
        
        for (const q in key) {
            results.total += 1;
            const expected = key[q];
            const actual = data[q];
            let ok = false;
            
            if (Array.isArray(expected)) {
                if (Array.isArray(actual)) {
                    const a = actual.slice().sort().join('|');
                    const b = expected.slice().sort().join('|');
                    ok = a === b;
                }
            } else {
                ok = String(actual) === String(expected);
            }
            
            if (ok) results.correct += 1;
            results.details[q] = { expected, actual, ok };
        }

        const score = results.total ? Math.round((results.correct / results.total) * 100) : null;
        return { 
            score: score === null ? 0 : score, 
            results, 
            responses: data 
        };
    }

    function saveTestResult(moduleId, score, responses) {
        const storageKey = 'knight_tests';
        const all = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const entry = {
            moduleId,
            score,
            responses,
            user: state.user ? state.user.email : null,
            timestamp: new Date().toISOString()
        };
        all.push(entry);
        localStorage.setItem(storageKey, JSON.stringify(all));
        
        if (state.user) {
            state.user.completedTests = state.user.completedTests || [];
            state.user.completedTests.push({ 
                moduleId, 
                score, 
                timestamp: entry.timestamp 
            });
            saveUser();
            updateAccountInfo();
        }
    }

    // ========== ИГРОВОЙ ДВИЖОК ==========
    function renderGrid() {
        elements.grid.innerHTML = '';
        elements.grid.style.gridTemplateColumns = `repeat(${state.gridSize.cols}, 1fr)`;
        
        for (let y = 0; y < state.gridSize.rows; y++) {
            for (let x = 0; x < state.gridSize.cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (x === state.currentLevel.start.x && y === state.currentLevel.start.y) {
                    cell.classList.add('start');
                    cell.innerHTML = '<div class="character">⚔️</div>';
                } else if (x === state.currentLevel.goal.x && y === state.currentLevel.goal.y) {
                    cell.classList.add('goal');
                    cell.textContent = '🏁';
                } else if (state.currentLevel.walls.some(w => w[0] === x && w[1] === y)) {
                    cell.classList.add('wall');
                    cell.textContent = '🧱';
                } else if (state.currentLevel.spikes.some(s => s[0] === x && s[1] === y)) {
                    cell.classList.add('spike');
                } else {
                    cell.textContent = '·';
                }
                
                elements.grid.appendChild(cell);
            }
        }
    }

    function executeCode() {
        if (state.isPlaying) return;
        
        const code = elements.codeInput.value.trim();
        if (!code) {
            showNotification('Напишите код рыцаря!', 'error');
            return;
        }

        state.isPlaying = true;
        resetTimer();
        startTimer();
        updateStatus('Исполняю код...');
        
        try {
            const commands = parseCommands(code);
            runCommands(commands, 0);
        } catch (error) {
            state.isPlaying = false;
            updateStatus(`Ошибка: ${error.message}`, 'error');
        }
    }

    // New parser: supports nested repeat, if/else, jump, and step counts (e.g., right 3).
    function tokenize(code) {
        if (!code) return [];
        const lower = code.toLowerCase();
        // Match [, ], or token sequences of non-space/brackets
        const tokens = lower.match(/\[|\]|[^\s\[\]]+/g) || [];
        return tokens;
    }

    function parseSequence(tokens, i = 0) {
        const commands = [];
        while (i < tokens.length) {
            const token = tokens[i];
            if (token === ']') {
                return { commands, i };
            }

            if (token === 'repeat') {
                const countToken = tokens[i + 1];
                const count = parseInt(countToken, 10);
                if (isNaN(count)) throw new Error('Неверный repeat count');
                if (tokens[i + 2] !== '[') throw new Error('Ожидается [ после repeat count');
                const parsed = parseSequence(tokens, i + 3);
                const inner = parsed.commands;
                for (let r = 0; r < count; r++) commands.push(...inner);
                i = parsed.i + 1;
                continue;
            }

            if (token === 'if') {
                // condition can be 'canmove right' or 'wall right' or 'goal right' or 'spike right'
                const condType = tokens[i + 1];
                const condDir = tokens[i + 2];
                if (!condType || !condDir) throw new Error('Неправильный формат if условие. Пример: if canmove right [ ... ]');
                // move index to bracket
                let idx = i + 3;
                if (tokens[idx] !== '[') throw new Error('Ожидается [ после условия if');
                const thenParsed = parseSequence(tokens, idx + 1);
                idx = thenParsed.i + 1;
                let elseParsed = { commands: [], i: idx };
                if (tokens[idx] === 'else') {
                    if (tokens[idx + 1] !== '[') throw new Error('Ожидается [ после else');
                    elseParsed = parseSequence(tokens, idx + 2);
                    idx = elseParsed.i + 1;
                }
                commands.push({ type: 'if', cond: { type: condType, dir: condDir }, then: thenParsed.commands, else: elseParsed.commands });
                i = idx;
                continue;
            }

            if (token === 'jump') {
                const raw = tokens[i + 1] || '';
                // allow both 'jump down' and 'jump (down)'
                const dir = raw.replace(/^\(+|\)+$/g, '');
                if (!dir || !['right','left','up','down'].includes(dir)) {
                    throw new Error('jump требует направление: jump (down) / jump down');
                }
                commands.push({ type: 'jump', dir });
                i += 2;
                continue;
            }

            // Movement commands with optional numerical step
            if (['right','left','up','down'].includes(token)) {
                const step = parseInt(tokens[i + 1], 10);
                const count = isNaN(step) ? 1 : step;
                for (let k = 0; k < count; k++) commands.push({ type: 'move', dir: token });
                i += isNaN(step) ? 1 : 2;
                continue;
            }

            // Unknown token — ignore or throw
            throw new Error('Неизвестная команда: ' + token);
        }
        return { commands, i };
    }

    function parseCommands(code) {
        const tokens = tokenize(code);
        const parsed = parseSequence(tokens, 0);
        return parsed.commands;
    }

    // Executor: runs a sequence of command objects (from parseCommands) with animation and nested flows
    function runSequence(commands, index = 0, onDone = () => {}) {
        if (!state.isPlaying) { onDone(); return; }
        if (index >= commands.length) { onDone(); return; }

        const cmd = commands[index];

        function doNext() { runSequence(commands, index + 1, onDone); }

        if (!cmd) { doNext(); return; }

        if (cmd.type === 'move') {
            const dir = cmd.dir;
            const currentCell = document.querySelector('.cell.start');
            if (!currentCell) { state.isPlaying = false; onDone(); return; }
            const x = parseInt(currentCell.dataset.x);
            const y = parseInt(currentCell.dataset.y);
            let newX = x, newY = y;
            if (dir === 'right') newX++;
            if (dir === 'left') newX--;
            if (dir === 'up') newY--;
            if (dir === 'down') newY++;

            if (newX < 0 || newX >= state.gridSize.cols || newY < 0 || newY >= state.gridSize.rows) {
                state.isPlaying = false;
                updateStatus('Рыцарь вышел за пределы арены!', 'error');
                onDone();
                return;
            }

            const targetCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
            if (targetCell.classList.contains('wall')) {
                state.isPlaying = false;
                updateStatus('Рыцарь ударился о стену!', 'error');
                onDone();
                return;
            }
            if (targetCell.classList.contains('spike')) {
                state.isPlaying = false;
                updateStatus('Рыцарь попал в ловушку!', 'error');
                onDone();
                return;
            }

            setTimeout(() => {
                currentCell.classList.remove('start');
                currentCell.innerHTML = '';
                targetCell.classList.add('start');
                targetCell.innerHTML = '<div class="character">⚔️</div>';
                doNext();
            }, 500);
            return;
        }

        if (cmd.type === 'jump') {
            // jump is a directional skip over one cell (land two cells away), with jump animation
            const currentCell = document.querySelector('.cell.start');
            if (!currentCell) { state.isPlaying = false; onDone(); return; }
            const x = parseInt(currentCell.dataset.x);
            const y = parseInt(currentCell.dataset.y);
            let newX = x, newY = y;
            if (cmd.dir === 'right') { newX += 2; midX = x + 1; midY = y; }
            if (cmd.dir === 'left') { newX -= 2; midX = x - 1; midY = y; }
            if (cmd.dir === 'up') { newY -= 2; midX = x; midY = y - 1; }
            if (cmd.dir === 'down') { newY += 2; midX = x; midY = y + 1; }

            if (newX < 0 || newX >= state.gridSize.cols || newY < 0 || newY >= state.gridSize.rows) {
                state.isPlaying = false; updateStatus('Нельзя прыгать вне арены!', 'error'); onDone(); return;
            }
            // Ensure intermediate cell (midX,midY) is within bounds and is a spike; otherwise jump not allowed
            if (typeof midX === 'undefined' || typeof midY === 'undefined' || midX < 0 || midX >= state.gridSize.cols || midY < 0 || midY >= state.gridSize.rows) {
                state.isPlaying = false; updateStatus('Нельзя прыгать: промежуточная клетка вне арены!', 'error'); onDone(); return;
            }
            const midCell = document.querySelector(`.cell[data-x="${midX}"][data-y="${midY}"]`);
            if (!midCell || !midCell.classList.contains('spike')) {
                state.isPlaying = false; updateStatus('Прыжок разрешён только через колючую клетку (spike)!', 'error'); onDone(); return;
            }
            const targetCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
            if (targetCell.classList.contains('wall')) {
                state.isPlaying = false; updateStatus('Нельзя прыгать в стену!', 'error'); onDone(); return;
            }
            if (targetCell.classList.contains('spike')) {
                state.isPlaying = false; updateStatus('Рыцарь попал в ловушку!', 'error'); onDone(); return;
            }
            // Add a CSS class for a jump animation and then move
            const charEl = currentCell.querySelector('.character');
            if (charEl) charEl.classList.add('jump');
            setTimeout(() => {
                if (charEl) charEl.classList.remove('jump');
                currentCell.classList.remove('start'); currentCell.innerHTML = '';
                targetCell.classList.add('start'); targetCell.innerHTML = '<div class="character">⚔️</div>';
                doNext();
            }, 300);
            return;
        }

        if (cmd.type === 'if') {
            // Evaluate condition cmd.cond: { type: 'canmove'|'wall'|'spike'|'goal', dir }
            const cond = cmd.cond;
            const currentCell = document.querySelector('.cell.start');
            if (!currentCell) { state.isPlaying = false; onDone(); return; }
            const x = parseInt(currentCell.dataset.x);
            const y = parseInt(currentCell.dataset.y);
            let ox=0, oy=0;
            if (cond.dir === 'right') ox = 1;
            if (cond.dir === 'left') ox = -1;
            if (cond.dir === 'up') oy = -1;
            if (cond.dir === 'down') oy = 1;
            const tx = x + ox; const ty = y + oy;
            let truth = false;
            if (tx < 0 || tx >= state.gridSize.cols || ty < 0 || ty >= state.gridSize.rows) {
                truth = false;
            } else {
                const tcell = document.querySelector(`.cell[data-x="${tx}"][data-y="${ty}"]`);
                if (cond.type === 'canmove') {
                    truth = !(tcell.classList.contains('wall') || tcell.classList.contains('spike'));
                } else if (cond.type === 'wall') {
                    truth = tcell.classList.contains('wall');
                } else if (cond.type === 'spike') {
                    truth = tcell.classList.contains('spike');
                } else if (cond.type === 'goal') {
                    truth = (tx === state.currentLevel.goal.x && ty === state.currentLevel.goal.y);
                }
            }
            const chosen = truth ? (cmd.then || []) : (cmd.else || []);
            if (chosen.length === 0) { doNext(); return; }
            // run chosen sequence, then continue
            runSequence(chosen, 0, () => { doNext(); });
            return;
        }

        // Unknown type: error
        state.isPlaying = false;
        updateStatus('Неизвестная команда', 'error');
        onDone();
    }

    // Backwards-compatible wrapper
    function runCommands(commands, index) {
        runSequence(commands, index || 0, () => {
            state.isPlaying = false;
            checkWinCondition();
        });
    }

    function checkWinCondition() {
        const currentCell = document.querySelector('.cell.start');
        if (!currentCell) return;

        const x = parseInt(currentCell.dataset.x);
        const y = parseInt(currentCell.dataset.y);
        
        if (x === state.currentLevel.goal.x && y === state.currentLevel.goal.y) {
            updateStatus('🏆 Сокровище найдено! Турнир пройден!', 'success');
            stopTimer();
            
            if (state.user) {
                completeLesson();
            }
            
            setTimeout(() => {
                const cells = document.querySelectorAll('.cell');
                cells.forEach(cell => {
                    cell.style.transition = 'all 0.3s ease';
                    cell.style.transform = 'scale(1.1)';
                    setTimeout(() => cell.style.transform = 'scale(1)', 300);
                });
            }, 100);
        } else {
            updateStatus('Цель не достигнута. Попробуйте другой путь.', 'warning');
        }
    }

    function completeLesson() {
        const lessonKey = `${state.currentModule}-${state.currentLesson}`;
        
        if (!state.user.completedLessons.some(l => 
            l.module === state.currentModule && l.lesson === state.currentLesson)) {
            
            state.user.completedLessons.push({
                module: state.currentModule,
                lesson: state.currentLesson,
                time: state.timerSeconds,
                date: new Date().toISOString()
            });
            
            saveUser();
            updateAccountInfo();
            showNotification(`Испытание ${state.currentModule}.${state.currentLesson} пройдено!`, 'success');
        }
    }

    function resetScene() {
        state.isPlaying = false;
        stopTimer();
        resetTimer();
        renderGrid();
        updateStatus('Готов к новому испытанию');
    }

    // ========== РЕДАКТОР УРОВНЕЙ ==========
    function openEditor() {
        if (!state.user || state.user.role !== 'teacher') {
            showNotification('Только Магистры Ордена могут строить замки!', 'error');
            return;
        }
        
        renderEditorGrid();
        elements.editorOverlay.style.display = 'flex';
        
        const firstTool = document.querySelector('.tool');
        if (firstTool) firstTool.focus();
    }

    function closeEditor() {
        elements.editorOverlay.style.display = 'none';
        state.selectedTool = 'empty';
    }

    function renderEditorGrid() {
        elements.editorGrid.innerHTML = '';
        elements.editorGrid.style.gridTemplateColumns = `repeat(${state.gridSize.cols}, 1fr)`;
        
        for (let y = 0; y < state.gridSize.rows; y++) {
            for (let x = 0; x < state.gridSize.cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                let content = '·';
                if (x === state.currentLevel.start.x && y === state.currentLevel.start.y) {
                    content = '🚩';
                } else if (x === state.currentLevel.goal.x && y === state.currentLevel.goal.y) {
                    content = '🏁';
                } else if (state.currentLevel.walls.some(w => w[0] === x && w[1] === y)) {
                    content = '🧱';
                } else if (state.currentLevel.spikes.some(s => s[0] === x && s[1] === y)) {
                    content = '⚠';
                }
                
                cell.textContent = content;
                cell.addEventListener('click', () => placeObject(x, y));
                elements.editorGrid.appendChild(cell);
            }
        }
        
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', function() {
                document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                state.selectedTool = this.getAttribute('data-tool');
            });
        });
    }

    function placeObject(x, y) {
        if (state.selectedTool === 'start') {
            state.currentLevel.start = { x, y };
        } else if (state.selectedTool === 'goal') {
            state.currentLevel.goal = { x, y };
        } else if (state.selectedTool === 'wall') {
            const index = state.currentLevel.walls.findIndex(w => w[0] === x && w[1] === y);
            if (index === -1) {
                state.currentLevel.walls.push([x, y]);
                state.currentLevel.spikes = state.currentLevel.spikes.filter(s => !(s[0] === x && s[1] === y));
            } else {
                state.currentLevel.walls.splice(index, 1);
            }
        } else if (state.selectedTool === 'spike') {
            const index = state.currentLevel.spikes.findIndex(s => s[0] === x && s[1] === y);
            if (index === -1) {
                state.currentLevel.spikes.push([x, y]);
                state.currentLevel.walls = state.currentLevel.walls.filter(w => !(w[0] === x && w[1] === y));
            } else {
                state.currentLevel.spikes.splice(index, 1);
            }
        } else if (state.selectedTool === 'empty') {
            state.currentLevel.walls = state.currentLevel.walls.filter(w => !(w[0] === x && w[1] === y));
            state.currentLevel.spikes = state.currentLevel.spikes.filter(s => !(s[0] === x && s[1] === y));
        }
        
        renderEditorGrid();
    }

    function saveCustomLevel() {
        if (!state.currentLevel.start || !state.currentLevel.goal) {
            showNotification('Укажите старт и цель!', 'error');
            return;
        }
        
        if (state.currentLevel.start.x === state.currentLevel.goal.x && 
            state.currentLevel.start.y === state.currentLevel.goal.y) {
            showNotification('Старт и цель не могут быть на одной клетке!', 'error');
            return;
        }
        
        const customLevels = JSON.parse(localStorage.getItem('custom_levels') || '[]');
        customLevels.push({
            ...state.currentLevel,
            id: Date.now(),
            creator: state.user.name,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('custom_levels', JSON.stringify(customLevels));
        showNotification('Замок сохранен!', 'success');
        closeEditor();
        renderGrid();
    }

    // ========== ТАЙМЕР ==========
    function startTimer() {
        if (state.timer) clearInterval(state.timer);
        state.timer = setInterval(() => {
            state.timerSeconds++;
            updateTimerDisplay();
        }, 1000);
    }

    function stopTimer() {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
    }

    function resetTimer() {
        state.timerSeconds = 0;
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(state.timerSeconds / 60).toString().padStart(2, '0');
        const seconds = (state.timerSeconds % 60).toString().padStart(2, '0');
        elements.timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    // ========== АУДИО СИСТЕМА ==========
    function setupAudio() {
        elements.bgMusic.volume = elements.volume.value / 100;
        elements.bgMusic.play().catch(e => {
            console.log('Автовоспроизведение заблокировано');
        });
    }

    function toggleSound() {
        state.musicEnabled = !state.musicEnabled;
        if (state.musicEnabled) {
            elements.bgMusic.play();
            elements.soundButton.textContent = '🎵';
            showNotification('Менестрели заиграли!', 'info');
        } else {
            elements.bgMusic.pause();
            elements.soundButton.textContent = '🔇';
            showNotification('Тишина в замке...', 'info');
        }
    }

    function updateVolume() {
        const volume = elements.volume.value;
        elements.bgMusic.volume = volume / 100;
        elements.volLabel.textContent = `${volume}%`;
    }

    function changeMusic() {
        const selectedTrack = elements.playlistSelect.value;
        elements.bgMusic.src = selectedTrack;
        elements.bgMusic.play().catch(e => {
            console.log('Не удалось сменить трек');
        });
        showNotification('Мелодия изменена', 'info');
    }

    function checkAudioFiles() {
        const tracks = [
            'music/Strange Moods.mp3',
            'music/Вадим Плотников - Дело в синей шляпе.mp3',
            'music/Вадим Плотников - Косвенный путь к успеху.mp3',
            'music/Вадим Плотников - Я и мои аппараты.mp3'
        ];
        
        tracks.forEach(track => {
            const audio = new Audio();
            audio.src = track;
            audio.onerror = () => {
                console.warn(`Аудио файл не найден: ${track}`);
            };
        });
    }

    // ========== НАСТРОЙКИ ==========
    function updateFontSize() {
        const size = elements.fontSize.value;
        elements.fontSizeLabel.textContent = `${size}px`;
        document.documentElement.style.fontSize = `${size}px`;
        localStorage.setItem('knight_fontSize', size);
    }

    // ========== ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС ==========
    function showSection(sectionId) {
        elements.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            // Prevent showing lesson section if not registered and not in demo mode
            if (sectionId === 'lesson' && !state.user && !state.demoMode) {
                if (elements.demoModal) elements.demoModal.style.display = 'flex';
                showNotification('Требуется регистрация или демо-режим для просмотра урока', 'warning');
                return;
            }
            targetSection.classList.add('active');
            
            if (sectionId === 'account') {
                updateAccountInfo();
            } else if (sectionId === 'settings') {
                const savedFontSize = localStorage.getItem('knight_fontSize');
                if (savedFontSize) {
                    elements.fontSize.value = savedFontSize;
                    updateFontSize();
                }
            }
        }
    }

    function updateUI() {
        updateMenuVisibility();
        
        if (elements.editLevel) {
            if ((state.user && state.user.role === 'teacher') || state.demoMode === 'teacher') {
                elements.editLevel.classList.remove('hidden');
                elements.editLevel.classList.remove('btn-hidden');
            } else {
                elements.editLevel.classList.add('hidden');
                elements.editLevel.classList.add('btn-hidden');
            }
        }
        
        const logoutBtn = document.getElementById('menu-logout');
        const registerBtn = document.getElementById('menu-register');
        
        if (state.user) {
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'none';
        } else {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'block';
        }

        // Lock lesson buttons if no real user and no demo mode
        document.querySelectorAll('.lesson-btn').forEach(btn => {
            if (!state.user && !state.demoMode) {
                btn.classList.add('locked');
                btn.title = 'Требуется регистрация или демо-режим';
            } else {
                btn.classList.remove('locked');
                btn.title = '';
            }
        });
        document.querySelectorAll('.open-test').forEach(btn => {
            if (!state.user && !state.demoMode) {
                btn.classList.add('locked');
                btn.title = 'Требуется регистрация или демо-режим';
            } else {
                btn.classList.remove('locked');
                btn.title = '';
            }
        });
    }

    function updateMenuVisibility() {
        const logoutBtn = document.getElementById('menu-logout');
        const registerBtn = document.getElementById('menu-register');
        const demoBtn = document.getElementById('menu-demo');

        if (state.user) {
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'none';
            if (demoBtn) demoBtn.style.display = 'none';
        } else if (state.demoMode) {
            // Demo mode active
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'none';
            if (demoBtn) demoBtn.style.display = 'block';
        } else {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'block';
            if (demoBtn) demoBtn.style.display = 'block';
        }

        // If mandatory registration is active, hide cancel button, otherwise show it
        if (elements.regCancelModal) {
            elements.regCancelModal.style.display = state.mandatoryRegisterActive ? 'none' : '';
        }
    }

    function updateAccountInfo() {
        if (!state.user && !state.demoMode) {
            showSection('register');
            return;
        }
        
        if (state.user) {
            elements.accountName.textContent = state.user.name;
            elements.accountEmail.textContent = state.user.email;
            elements.accountRole.textContent = state.user.role === 'teacher' ? 'Магистр Ордена' : 'Оруженосец';
        } else if (state.demoMode) {
            elements.accountName.textContent = `Демо (${state.demoMode === 'teacher' ? 'Магистр' : 'Оруженосец'})`;
            elements.accountEmail.textContent = 'demo@castle.knight';
            elements.accountRole.textContent = state.demoMode === 'teacher' ? 'Магистр Ордена (Демо)' : 'Оруженосец (Демо)';
        }
        
        const completed = state.user ? state.user.completedLessons.length : 0;
        elements.accountCompleted.textContent = completed;
        
        if (completed > 0) {
            const totalTime = state.user.completedLessons.reduce((sum, lesson) => sum + (lesson.time || 0), 0);
            const avgTime = Math.round(totalTime / completed);
            const minutes = Math.floor(avgTime / 60);
            const seconds = avgTime % 60;
            elements.accountAverage.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            elements.accountAverage.textContent = '—';
        }
        
        const tests = state.user.completedTests || [];
        const accountTestsCount = document.getElementById('account-tests-count');
        const accountTestsAverage = document.getElementById('account-tests-average');
        const accountTestsList = document.getElementById('account-tests-list');

        if (accountTestsCount) accountTestsCount.textContent = tests.length;
        
        if (tests.length > 0) {
            const avg = Math.round(tests.reduce((s, t) => s + (t.score || 0), 0) / tests.length);
            if (accountTestsAverage) accountTestsAverage.textContent = `${avg}%`;
        } else {
            if (accountTestsAverage) accountTestsAverage.textContent = '—';
        }

        if (accountTestsList) {
            accountTestsList.innerHTML = '';
            if (tests.length === 0) {
                accountTestsList.innerHTML = '<li style="color:#D4AF37">Тестов пока нет</li>';
            } else {
                tests.slice().reverse().forEach(t => {
                    const li = document.createElement('li');
                    const d = new Date(t.timestamp).toLocaleString();
                    li.innerHTML = `<span>Модуль ${t.moduleId}</span> <span style="float:right;color:#D4AF37">${t.score}% — ${d}</span>`;
                    accountTestsList.appendChild(li);
                });
            }
        }
        
        updateAchievementsList();
    }

    function updateAchievementsList() {
        elements.accountList.innerHTML = '';
        
        if (!state.user || state.user.completedLessons.length === 0) {
            elements.accountList.innerHTML = '<li style="text-align:center;color:#D4AF37">Подвигов пока нет. Пройдите испытания!</li>';
            return;
        }
        
        state.user.completedLessons.forEach((lesson) => {
            const li = document.createElement('li');
            const date = new Date(lesson.date).toLocaleDateString();
            const time = lesson.time ? `${Math.floor(lesson.time / 60)}:${(lesson.time % 60).toString().padStart(2, '0')}` : '—';
            
            li.innerHTML = `
                <span>Турнир ${lesson.module}.${lesson.lesson}</span>
                <span style="font-size:0.9em;color:#D4AF37">${date} (${time})</span>
            `;
            elements.accountList.appendChild(li);
        });
    }

    function updateStatus(message, type = 'info') {
        if (!elements.status) return;
        
        elements.status.textContent = `Статус: ${message}`;
        elements.status.className = 'status-inline';
        
        if (type === 'error') {
            elements.status.classList.add('error');
        } else if (type === 'warning') {
            elements.status.classList.add('warning');
        } else if (type === 'success') {
            elements.status.classList.add('success');
        }
        
        if (type === 'info') {
            setTimeout(() => {
                if (elements.status && elements.status.textContent.includes(message)) {
                    elements.status.textContent = 'Статус: ожидание приказа';
                    elements.status.className = 'status-inline';
                }
            }, 5000);
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: var(--radius-md);
            background: ${type === 'error' ? '#8B0000' : type === 'success' ? '#228B22' : type === 'warning' ? '#DAA520' : '#D4AF37'};
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            box-shadow: var(--shadow-lg);
            font-family: 'Cinzel', serif;
            border: 2px solid ${type === 'error' ? '#B22222' : type === 'success' ? '#32CD32' : type === 'warning' ? '#FFD700' : '#FFD700'};
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ========== ЗАПУСК ПРИЛОЖЕНИЯ ==========
    init();
});