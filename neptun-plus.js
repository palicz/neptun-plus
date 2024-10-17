    // ==UserScript==
    // @name         Neptun Plus
    // @namespace    http://example.org
    // @version      1.0
    // @description  Ez a script átalakítja a Neptun felületét, hogy könnyebben használható és átláthatóbb legyen. 
    // @author       zenzty
    // @match        https://www-h-ng.neptun.unideb.hu/hallgato_ng/*
    // @grant        none
    // ==/UserScript==

(function() {
        'use strict';


        function debug(message) {
            console.log(`[Neptun Plus] ${message}`);
        }

        const style = document.createElement('style');
        style.textContent = `
            #menu-btn, .header__main-menu--mobile { display: none !important; }
            .primary-bg-wrapper { display: none !important; }
            #new-menu-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                padding: 10px;
                background-color: #ffffff;
                border-bottom: 1px solid #e0e0e0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .neptun-menu-item {
                position: relative;
                padding: 8px 16px;
                margin: 4px;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                background-color: #f2f3fb;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.1s ease;
            }
            .neptun-menu-item:hover {
                background-color: #e6e9f7;
            }
            .neptun-submenu {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1001;
                padding: 8px 0;
                min-width: 200px;
            }
            .neptun-menu-item:hover .neptun-submenu { display: block; }
            .neptun-submenu .neptun-menu-item {
                border: none;
                border-radius: 0;
                padding: 8px 16px;
                margin: 0;
                display: block;
                width: 100%;
                background-color: #ffffff;
                transition: background-color 0.1s ease;
            }
            .neptun-submenu .neptun-menu-item:hover {
                background-color: #e6e9f7;
            }
            @media (max-width: 768px) {
                #new-menu-container {
                    flex-direction: column;
                    align-items: stretch;
                }
                .neptun-menu-item {
                    width: 100%;
                    margin: 2px 0;
                    border-radius: 0;
                }
                .neptun-submenu {
                    position: static;
                    width: 100%;
                    box-shadow: none;
                    border: none;
                    border-radius: 0;
                    padding: 0;
                }
                .neptun-menu-item:hover .neptun-submenu {
                    display: none;
                }
                .neptun-menu-item.active {
                    background-color: #e6e9f7;
                }
                .neptun-menu-item.active .neptun-submenu {
                    display: block;
                }
                .neptun-submenu .neptun-menu-item {
                    padding-left: 32px;
                }
            }
        `;
        document.head.appendChild(style);

        function addLightningSymbol() {
            const logo = document.querySelector('#neptun-logo');
            if (logo && !document.querySelector('#neptun-powerplus-lightning')) {
                const container = document.createElement('span');
                container.id = 'neptun-powerplus-lightning';
                container.style.cssText = `
                    position: relative;
                    display: inline-block;
                    margin-left: 5px;
                `;

                const lightning = document.createElement('span');
                lightning.textContent = '⚡';
                lightning.style.cssText = `
                    font-size: 20px;
                    display: inline-block;
                    transition: transform 0.2s ease;
                    cursor: pointer;
                `;

                const tooltip = document.createElement('span');
                tooltip.textContent = 'Neptun Plus aktív';
                tooltip.style.cssText = `
                    visibility: hidden;
                    background-color: #555;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px 10px;
                    position: absolute;
                    z-index: 1;
                    bottom: 125%;
                    left: 50%;
                    margin-left: -60px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    font-size: 14px;
                    white-space: nowrap;
                `;

                container.appendChild(lightning);
                container.appendChild(tooltip);
                logo.appendChild(container);

                container.addEventListener('mouseenter', () => {
                    lightning.style.transform = 'scale(1.2)';
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                });
                container.addEventListener('mouseleave', () => {
                    lightning.style.transform = 'scale(1)';
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = '0';
                });

                debug('Villám ikon megjelenítve');
            } else {
                debug('Neptun logó nem található vagy a villám ikon már létezik');
            }
        }

        function createMenuItem(text, url = '#', hasSubmenu = false) {
            const item = document.createElement('div');
            item.className = 'neptun-menu-item';

            const link = document.createElement('a');
            link.textContent = text;
            Object.assign(link.style, {
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                cursor: hasSubmenu ? 'default' : 'pointer'
            });

            if (!hasSubmenu) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateWithoutReload(url);
                });
            }

            item.appendChild(link);

            if (hasSubmenu) {
                const arrow = document.createElement('span');
                arrow.textContent = '▼';
                arrow.style.cssText = 'font-size: 10px; margin-left: 5px;';
                link.appendChild(arrow);

                item.addEventListener('click', function(e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        this.classList.toggle('active');
                        arrow.textContent = this.classList.contains('active') ? '▲' : '▼';
                    }
                });

                item.addEventListener('mouseenter', function() {
                    if (window.innerWidth > 768) this.classList.add('active');
                });

                item.addEventListener('mouseleave', function() {
                    if (window.innerWidth > 768) this.classList.remove('active');
                });
            }

            return item;
        }

        function createSubmenu(items) {
            const submenu = document.createElement('div');
            submenu.className = 'neptun-submenu';
            items.forEach(item => {
                const subItem = createMenuItem(item.text, item.url);
                submenu.appendChild(subItem);
            });
            return submenu;
        }

        function createMenu() {
            const menuStructure = [
                { text: 'Kezdőoldal', url: '/hallgato_ng/dashboard' },
                { text: 'Naptár', url: '/hallgato_ng/calendar' },
                { text: 'Tanulmányok', submenu: [
                    { text: 'Előrehaladás', url: '/hallgato_ng/studies/advancement' },
                    { text: 'Modulválasztás', url: '/hallgato_ng/studies/module-selection' },
                    { text: 'Szakmai gyakorlat', url: '/hallgato_ng/studies/internship' },
                    { text: 'Kötelező szakmai gyakorlatok', url: '/hallgato_ng/studies/obligatory-practice' },
                    { text: 'Konzultációk', url: '/hallgato_ng/studies/consultations' },
                    { text: 'Online alkalmak', url: '/hallgato_ng/studies/online-occasions' },
                    { text: 'Elektronikus tananyagok', url: '/hallgato_ng/studies/e-learning-materials' },
                    { text: 'Szakdolgozat', url: '/hallgato_ng/studies/thesis' },
                    { text: 'Szakosodás', url: '/hallgato_ng/studies/specialization' }
                ]},
                { text: 'Tárgyak', submenu: [
                    { text: 'Tárgyfelvétel', url: '/hallgato_ng/subjects/registration' },
                    { text: 'Felvett tárgyak', url: '/hallgato_ng/subjects/registered-subjects' },
                    { text: 'Felvett kurzusok', url: '/hallgato_ng/subjects/registered-courses' },
                    { text: 'Feladatok', url: '/hallgato_ng/subjects/tasks' },
                    { text: 'Megajánlott jegyek', url: '/hallgato_ng/subjects/offered-grades' },
                    { text: 'Tárgyhoz kapcsolódó kérvények', url: '/hallgato_ng/subjects/subject-related-request-form' },
                    { text: 'Tárgyelismerési szabályok', url: '/hallgato_ng/subjects/subject-equivalence' }
                ]},
                { text: 'Vizsgák', submenu: [
                    { text: 'Áttekintés', url: '/hallgato_ng/exams/overview' },
                    { text: 'Vizsgajelentkezés', url: '/hallgato_ng/exams/registration' },
                    { text: 'Felvett vizsgák', url: '/hallgato_ng/exams/taken' },
                    { text: 'Hátralévő vizsgák', url: '/hallgato_ng/exams/remaining' },
                    { text: 'Eredmények', url: '/hallgato_ng/exams/results' },
                    { text: 'Záróvizsgák', url: '/hallgato_ng/exams/final-exams' }
                ]},
                { text: 'Pénzügyek', submenu: [
                    { text: 'Áttekintés', url: '/hallgato_ng/finances/overview' },
                    { text: 'Befizetendő', url: '/hallgato_ng/finances/overview/to-be-paid' },
                    { text: 'Számlák', url: '/hallgato_ng/finances/invoices' },
                    { text: 'Tranzakciók', url: '/hallgato_ng/finances/overview/transactions' },
                    { text: 'Ösztöndíjak és kifizetések', url: '/hallgato_ng/finances/overview/scholarships' },
                    { text: 'Jóváírások', url: '/hallgato_ng/finances/overview/benefits' },
                    { text: 'Nyilatkozatok', url: '/hallgato_ng/finances/overview/financial-informations/financial-statements' },
                    { text: 'Adatok és beállítások', url: '/hallgato_ng/finances/overview/financial-informations' }
                ]},
                { text: 'Közsségi terek', url: '/hallgato_ng/communal-spaces' },
                { text: 'Ügyintézés', submenu: [
                    { text: 'Féléves regisztráció', url: '/hallgato_ng/administrations/semi-annual-registration' },
                    { text: 'Kérvények', url: '/hallgato_ng/administrations/request-forms'    },
                    { text: 'Kérvény bírálás', url: '/hallgato_ng/administrations/request-judgement' },
                    { text: 'Kollégiumi jelentkezés', url: '/hallgato_ng/administrations/dormitory-application' },
                    { text: 'Kérdőívek', url: '/hallgato_ng/administrations/questionnaire' },
                    { text: 'Átsorolási kérelem', url: '/hallgato_ng/administrations/re-classification' },
                    { text: 'Diákigazolvány igénylés', url: '/hallgato_ng/administrations/student-card' },
                    { text: 'Diákhitel igénylés', url: '/hallgato_ng/administrations/student-loan' },
                    { text: 'Általános nyomtatványok', url: '/hallgato_ng/administrations/general-forms' },
                    { text: 'Erasmus', url: '/hallgato_ng/administrations/erasmus' },
                    { text: 'Időpontfoglalás', url: '/hallgato_ng/administrations/date-reservation' }
                ]},
                { text: 'Információk', submenu: [
                    { text: 'Lekérdezések', url: '/hallgato_ng/informations/queries' },
                    { text: 'Időszakok', url: '/hallgato_ng/informations/periods' },
                    { text: 'Tárgy és kurzus lista', url: '/hallgato_ng/informations/subjects-courses' },
                    { text: 'Jegyzet keresése', url: '/hallgato_ng/informations/textbook-search' },
                    { text: 'Teremórarend', url: '/hallgato_ng/informations/room-schedule' },
                    { text: 'FIR adatok', url: '/hallgato_ng/informations/fir-data' },
                    { text: 'Publikációk', url: '/hallgato_ng/informations/publications' },
                    { text: 'Kiajánlott dolgozatok', url: '/hallgato_ng/informations/published-theses' }
                ]}
            ];

            const newMenuContainer = document.createElement('div');
            newMenuContainer.id = 'new-menu-container';

            menuStructure.forEach(item => {
                const menuItem = createMenuItem(item.text, item.url, !!item.submenu);
                if (item.submenu) {
                    menuItem.appendChild(createSubmenu(item.submenu));
                }
                newMenuContainer.appendChild(menuItem);
            });

            window.addEventListener('resize', debounce(function() {
                if (window.innerWidth > 768) {
                    document.querySelectorAll('.neptun-menu-item').forEach(item => {
                        item.classList.remove('active');
                        const arrow = item.querySelector('span');
                        if (arrow) arrow.textContent = '▼';
                    });
                }
            }, 250));

            return newMenuContainer;
        }

        function adjustLayout() {
            const style = document.createElement('style');
            style.textContent = `
                #new-menu-container {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background-color: #ffffff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 10px;
                }
                .neptun-wrapper-padding {
                    padding-top: 10px !important;
                }
                .push-notifications-wrapper {
                    top: 60px !important;
                }
                .body-content {
                    margin-top: 10px !important;
                }
                .widgets {
                    padding-top: 10px !important;
                }
                .content-wrapper, .main-content {
                    margin-top: 10px !important;
                }
            `;
            document.head.appendChild(style);
        }

        function makeElementsAlwaysOpen() {
            const style = document.createElement('style');
            style.textContent = `
                .mat-expansion-panel-header { pointer-events: none !important; }
                .mat-expansion-indicator { display: none !important; }
                .mat-expansion-panel:not(.mat-expanded) .mat-expansion-panel-content {
                    visibility: visible !important;
                    height: auto !important;
                }
            `;
            document.head.appendChild(style);

            const expandAllPanels = debounce(() => {
                document.querySelectorAll('mat-expansion-panel').forEach(panel => {
                    panel.classList.add('mat-expanded');
                    const content = panel.querySelector('.mat-expansion-panel-content');
                    if (content) {
                        Object.assign(content.style, { visibility: 'visible', height: 'auto' });
                    }
                });
            }, 100);

            expandAllPanels();
            new MutationObserver(expandAllPanels).observe(document.body, { childList: true, subtree: true });
        }

        function initLightMode() {
            debug('Villám ikon inicializálása');
            addLightningSymbol();
        }

        function initFullMode() {
            debug('Teljes mód inicializálása');
            const contentWrapper = document.querySelector('.neptun-wrapper-padding');
            if (contentWrapper && !document.querySelector('#new-menu-container')) {
                const newMenu = createMenu();
                contentWrapper.insertAdjacentElement('beforebegin', newMenu);
                debug('Új menü beillesztve a tartalmi rész elé');
                setTimeout(adjustLayout, 100);
            } else {
                debug('Tartalmi rész nem található vagy a menü már létezik');
            }
            makeElementsAlwaysOpen();
        }

        function isLoginPage() {
            return window.location.pathname.includes('/hallgato_ng/login');
        }

        function checkAndInitialize() {
            if (isLoginPage()) {
                debug('Bejelentkezési oldal észlelve, a szkript nem fut');
                return;
            }

            debug('Inicializálás ellenőrzése');
            initLightMode();

            setTimeout(() => {
                if (document.readyState === 'complete') {
                    initFullMode();
                    isInitialized = true;
                } else {
                    debug('Az oldal még nem töltődött be teljesen, várakozás...');
                    window.addEventListener('load', () => {
                        initFullMode();
                        isInitialized = true;
                    });
                }
            }, 1000);
        }

        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                debug('URL változás észlelve, inicializálás ellenőrzése');
                isInitialized = false;
                checkAndInitialize();
            }
        }).observe(document, {subtree: true, childList: true});

        debug('Szkript betöltve, kezdeti ellenőrzés végrehajtása');
        checkAndInitialize();

        setInterval(checkAndInitialize, 2000);

        function navigateWithoutReload(url) {
            console.log(`Navigálási kísérlet ide: ${url}`);

            if (window.navigateToUrl) {
                console.log(`A window.navigateToUrl használata a navigáláshoz: ${url}`);
                window.navigateToUrl(url);
            } else if (typeof angular !== 'undefined' && angular.element(document.body).injector()) {
                const $state = angular.element(document.body).injector().get('$state');
                console.log(`Angular $state használata a navigáláshoz: ${url}`);
                $state.go(url.replace('/hallgato_ng/', ''));
            } else {
                console.log(`Tartalék megoldás: egyedi esemény használata a navigáláshoz ${url}`);
                const navEvent = new CustomEvent('customNavigation', { detail: { url: url } });
                window.dispatchEvent(navEvent);
            }
        }

        window.addEventListener('customNavigation', function(e) {
            const url = e.detail.url;
            console.log(`Egyedi navigálási esemény észlelve: ${url}`);
            if (window.navigateToUrl) {
                window.navigateToUrl(url);
            } else if (window.history && window.history.pushState) {
                window.history.pushState(null, '', url);
                window.dispatchEvent(new Event('popstate'));
            }
        });

        function delayedInit() {
            setTimeout(() => {
                init();
                console.log('Szkript inicializálva késleltetés után');
            }, 1000);
        }

        waitForElements(() => {
            delayedInit();
            console.log('Késleltetett inicializálás aktiválva');
        });

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    })();
