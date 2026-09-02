(() => {
    "use strict";

    const state = {
        players: [],
        filtered: [],
        page: 1,
        pageSize: 30,
        country: "",
        position: "",
        era: "all",
        search: ""
    };

    const $ = (selector) => document.querySelector(selector);

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getInitials(name) {
        const parts = String(name || "Joueur")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!parts.length) return "JP";

        return parts
            .slice(0, 2)
            .map(part => part[0])
            .join("")
            .toUpperCase();
    }

    function countryFlag(country) {
        const flags = {
            "France": "🇫🇷",
            "Brésil": "🇧🇷",
            "Brazil": "🇧🇷",
            "Angleterre": "🏴",
            "England": "🏴",
            "Espagne": "🇪🇸",
            "Spain": "🇪🇸",
            "Allemagne": "🇩🇪",
            "Germany": "🇩🇪",
            "Italie": "🇮🇹",
            "Italy": "🇮🇹",
            "Portugal": "🇵🇹",
            "Argentine": "🇦🇷",
            "Argentina": "🇦🇷",
            "Pays-Bas": "🇳🇱",
            "Netherlands": "🇳🇱",
            "Belgique": "🇧🇪",
            "Belgium": "🇧🇪",
            "Cameroun": "🇨🇲",
            "Cameroon": "🇨🇲",
            "Côte d'Ivoire": "🇨🇮",
            "Ivory Coast": "🇨🇮",
            "Sénégal": "🇸🇳",
            "Senegal": "🇸🇳",
            "Nigeria": "🇳🇬",
            "Ghana": "🇬🇭",
            "Maroc": "🇲🇦",
            "Morocco": "🇲🇦",
            "Algérie": "🇩🇿",
            "Algeria": "🇩🇿",
            "Égypte": "🇪🇬",
            "Egypt": "🇪🇬",
            "États-Unis": "🇺🇸",
            "United States": "🇺🇸",
            "Mexique": "🇲🇽",
            "Mexico": "🇲🇽",
            "Japon": "🇯🇵",
            "Japan": "🇯🇵",
            "Corée du Sud": "🇰🇷",
            "South Korea": "🇰🇷"
        };

        return flags[country] || "🌍";
    }

    function isLegend(player) {
        if (player.legend === true) return true;

        const legends = [
            "pele",
            "maradona",
            "diego maradona",
            "johan cruyff",
            "franz beckenbauer",
            "zinedine zidane",
            "ronaldinho",
            "ronaldo nazario",
            "ronaldo",
            "roberto baggio",
            "george weah",
            "samuel etoo",
            "didier drogba",
            "thierry henry",
            "andres iniesta",
            "xavi",
            "paolo maldini",
            "gianluigi buffon",
            "iker casillas",
            "fabio cannavaro",
            "lothar matthaus",
            "michel platini",
            "eusebio",
            "ferenc puskas",
            "garincha",
            "bobby charlton"
        ];

        return legends.includes(normalize(player.name));
    }

    function isCurrent(player) {
        if (isLegend(player)) return false;

        if (player.era === "modern" || player.era === "current") {
            return true;
        }

        const year = Number(player.birthYear);

        if (year && year >= 1990) {
            return true;
        }

        return false;
    }

    function getPlayersFromEngine() {
        if (
            window.WorldPlayerEngine &&
            Array.isArray(window.WorldPlayerEngine.players)
        ) {
            return window.WorldPlayerEngine.players;
        }

        if (
            window.worldPlayers &&
            Array.isArray(window.worldPlayers)
        ) {
            return window.worldPlayers;
        }

        return [];
    }

    function buildFilters() {
        const countrySelect = $("#playerCountry");
        const positionSelect = $("#playerPosition");

        if (countrySelect) {
            const countries = [...new Set(
                state.players
                    .map(player => player.country)
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b));

            countrySelect.innerHTML =
                `<option value="">🌍 Tous les pays</option>` +
                countries.map(country =>
                    `<option value="${escapeHTML(country)}">${countryFlag(country)} ${escapeHTML(country)}</option>`
                ).join("");
        }

        if (positionSelect) {
            const positions = [...new Set(
                state.players
                    .map(player => player.position)
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b));

            positionSelect.innerHTML =
                `<option value="">⚽ Tous les postes</option>` +
                positions.map(position =>
                    `<option value="${escapeHTML(position)}">${escapeHTML(position)}</option>`
                ).join("");
        }

        ensureEraFilter();
    }

    function ensureEraFilter() {
        const container = document.querySelector(".world-players-controls");
        if (!container || $("#playerEra")) return;

        const select = document.createElement("select");
        select.id = "playerEra";
        select.className = "player-filter";

        select.innerHTML = `
            <option value="all">✨ Tous les joueurs</option>
            <option value="legend">🏆 Légendes</option>
            <option value="current">🔥 Joueurs actuels</option>
        `;

        container.appendChild(select);

        select.addEventListener("change", () => {
            state.era = select.value;
            state.page = 1;
            applyFilters();
        });
    }

    function matches(player) {
        const search = normalize(state.search);

        if (search) {
            const haystack = normalize([
                player.name,
                player.country,
                player.position,
                player.club
            ].join(" "));

            if (!haystack.includes(search)) {
                return false;
            }
        }

        if (
            state.country &&
            normalize(player.country) !== normalize(state.country)
        ) {
            return false;
        }

        if (
            state.position &&
            normalize(player.position) !== normalize(state.position)
        ) {
            return false;
        }

        if (state.era === "legend" && !isLegend(player)) {
            return false;
        }

        if (state.era === "current" && !isCurrent(player)) {
            return false;
        }

        return true;
    }

    function applyFilters() {
        state.filtered = state.players.filter(matches);
        state.page = Math.max(1, Math.min(
            state.page,
            Math.ceil(state.filtered.length / state.pageSize) || 1
        ));

        render();
    }

    function createCard(player) {
        const legend = isLegend(player);

        const card = document.createElement("article");
        card.className = "world-player-card";

        card.innerHTML = `
            <div class="world-player-card-glow"></div>

            <div class="world-player-avatar">
                ${
                    player.photo
                        ? `<img src="${escapeHTML(player.photo)}" alt="${escapeHTML(player.name)}" loading="lazy">`
                        : `<span>${escapeHTML(getInitials(player.name))}</span>`
                }
            </div>

            <div class="world-player-info">
                <div class="world-player-country">
                    ${countryFlag(player.country)}
                    ${escapeHTML(player.country || "International")}
                </div>

                <h3>${escapeHTML(player.name || "Joueur inconnu")}</h3>

                <div class="world-player-meta">
                    <span>${escapeHTML(player.position || "Joueur")}</span>
                    ${
                        player.birthYear
                            ? `<span>${escapeHTML(player.birthYear)}</span>`
                            : ""
                    }
                </div>

                ${
                    player.club
                        ? `<div class="world-player-club">${escapeHTML(player.club)}</div>`
                        : ""
                }

                ${
                    legend
                        ? `<div class="world-player-badge">🏆 LÉGENDE</div>`
                        : ""
                }
            </div>
        `;

        card.addEventListener("click", () => openPlayer(player));

        card.addEventListener("pointermove", event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 12;
            const rotateX = ((y / rect.height) - 0.5) * -12;

            card.style.transform =
                `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });

        return card;
    }

    function render() {
        const grid = $("#playersGrid");
        if (!grid) return;

        grid.innerHTML = "";

        const start = (state.page - 1) * state.pageSize;
        const visible = state.filtered.slice(
            start,
            start + state.pageSize
        );

        if (!visible.length) {
            grid.innerHTML = `
                <div class="players-empty">
                    <div class="players-empty-icon">🔎</div>
                    <h3>Aucun joueur trouvé</h3>
                    <p>Essaie une autre recherche ou modifie les filtres.</p>
                </div>
            `;
        } else {
            const fragment = document.createDocumentFragment();

            visible.forEach(player => {
                fragment.appendChild(createCard(player));
            });

            grid.appendChild(fragment);
        }

        updateCounter();
        renderPagination();
    }

    function updateCounter() {
        const total = $("#playersTotal");

        if (!total) return;

        total.textContent =
            `${state.filtered.length.toLocaleString("fr-FR")} joueur${state.filtered.length > 1 ? "s" : ""}`;
    }

    function renderPagination() {
        const grid = $("#playersGrid");
        if (!grid) return;

        let pagination = $("#playersPagination");

        if (!pagination) {
            pagination = document.createElement("div");
            pagination.id = "playersPagination";
            pagination.className = "players-pagination";

            grid.parentNode.insertBefore(
                pagination,
                grid.nextSibling
            );
        }

        const pages = Math.ceil(
            state.filtered.length / state.pageSize
        );

        if (pages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        pagination.innerHTML = `
            <button ${state.page <= 1 ? "disabled" : ""} data-page="prev">
                ← Précédent
            </button>

            <span>
                Page ${state.page} / ${pages}
            </span>

            <button ${state.page >= pages ? "disabled" : ""} data-page="next">
                Suivant →
            </button>
        `;

        pagination.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", () => {
                if (button.dataset.page === "prev") {
                    state.page--;
                } else {
                    state.page++;
                }

                render();

                const section = document.querySelector(".world-players");
                if (section) {
                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        });
    }

    function openPlayer(player) {
        let modal = $("#playerDetailModal");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "playerDetailModal";
            modal.className = "player-detail-modal";
            document.body.appendChild(modal);
        }

        const legend = isLegend(player);

        modal.innerHTML = `
            <div class="player-detail-backdrop"></div>

            <div class="player-detail-panel">
                <button class="player-detail-close" aria-label="Fermer">×</button>

                <div class="player-detail-visual">
                    <div class="player-detail-orbit"></div>

                    <div class="player-detail-avatar">
                        ${
                            player.photo
                                ? `<img src="${escapeHTML(player.photo)}" alt="${escapeHTML(player.name)}">`
                                : `<span>${escapeHTML(getInitials(player.name))}</span>`
                        }
                    </div>
                </div>

                <div class="player-detail-content">

                    <div class="player-detail-country">
                        ${countryFlag(player.country)}
                        ${escapeHTML(player.country || "International")}
                    </div>

                    ${
                        legend
                            ? `<div class="player-detail-legend">🏆 LÉGENDE DU FOOTBALL</div>`
                            : ""
                    }

                    <h2>${escapeHTML(player.name || "Joueur inconnu")}</h2>

                    <div class="player-detail-grid">

                        <div>
                            <small>POSTE</small>
                            <strong>${escapeHTML(player.position || "—")}</strong>
                        </div>

                        <div>
                            <small>CLUB</small>
                            <strong>${escapeHTML(player.club || "—")}</strong>
                        </div>

                        <div>
                            <small>NAISSANCE</small>
                            <strong>${escapeHTML(player.birthYear || "—")}</strong>
                        </div>

                        <div>
                            <small>ÉPOQUE</small>
                            <strong>${escapeHTML(player.era || "—")}</strong>
                        </div>

                    </div>

                    <button class="player-detail-game" type="button">
                        ⚽ Défier ce joueur
                    </button>
                </div>
            </div>
        `;

        modal.classList.add("active");

        const close = () => {
            modal.classList.remove("active");
            document.body.classList.remove("player-modal-open");
        };

        modal.querySelector(".player-detail-close")
            ?.addEventListener("click", close);

        modal.querySelector(".player-detail-backdrop")
            ?.addEventListener("click", close);

        modal.querySelector(".player-detail-game")
            ?.addEventListener("click", () => {
                close();

                if (window.ShotMatch) {
                    window.ShotMatch.startPlayerChallenge?.(player);
                }
            });

        document.body.classList.add("player-modal-open");
    }

    function setupEvents() {
        const search = $("#playerSearch");
        const country = $("#playerCountry");
        const position = $("#playerPosition");

        if (search) {
            search.addEventListener("input", () => {
                state.search = search.value;
                state.page = 1;
                applyFilters();
            });
        }

        if (country) {
            country.addEventListener("change", () => {
                state.country = country.value;
                state.page = 1;
                applyFilters();
            });
        }

        if (position) {
            position.addEventListener("change", () => {
                state.position = position.value;
                state.page = 1;
                applyFilters();
            });
        }
    }

    function waitForPlayers(attempt = 0) {
        const players = getPlayersFromEngine();

        if (players.length) {
            state.players = players;
            state.filtered = players.slice();

            buildFilters();
            setupEvents();
            applyFilters();

            console.log(
                `🌍 WorldPlayerUI : ${players.length} joueurs chargés`
            );

            return;
        }

        if (attempt >= 50) {
            console.warn("WorldPlayerUI : données joueurs introuvables.");
            return;
        }

        setTimeout(() => {
            waitForPlayers(attempt + 1);
        }, 200);
    }

    window.WorldPlayerUI = {
        init: waitForPlayers,
        refresh: applyFilters
    };

    document.addEventListener("DOMContentLoaded", () => {
        waitForPlayers();
    });

})();
