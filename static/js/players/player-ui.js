/*
 * FootballPlatform
 * World Players 3D UI
 */

class PlayerUI {

    constructor() {
        this.container = null;
        this.players = [];
        this.filteredPlayers = [];
        this.currentIndex = 0;
    }

    init(containerSelector = "#playersGrid") {
        this.container = document.querySelector(containerSelector);

        if (!this.container) {
            console.warn("Players container not found.");
            return;
        }

        this.bindEvents();
        this.render();
    }

    setPlayers(players) {
        this.players = Array.isArray(players) ? players : [];
        this.filteredPlayers = [...this.players];
        this.currentIndex = 0;
        this.render();
    }

    search(query = "") {
        const text = query.trim().toLowerCase();

        if (!text) {
            this.filteredPlayers = [...this.players];
        } else {
            this.filteredPlayers = this.players.filter(player => {
                return [
                    player.name,
                    player.country,
                    player.position,
                    player.club,
                    player.era
                ]
                .filter(Boolean)
                .some(value =>
                    String(value).toLowerCase().includes(text)
                );
            });
        }

        this.currentIndex = 0;
        this.render();
    }

    filterByCountry(country) {
        if (!country || country === "all") {
            this.filteredPlayers = [...this.players];
        } else {
            this.filteredPlayers = this.players.filter(
                player => player.country === country
            );
        }

        this.render();
    }

    filterByEra(era) {
        if (!era || era === "all") {
            this.filteredPlayers = [...this.players];
        } else {
            this.filteredPlayers = this.players.filter(
                player => player.era === era
            );
        }

        this.render();
    }

    createCard(player, index) {

        const card = document.createElement("article");

        card.className = "player-card-3d";

        card.style.setProperty(
            "--delay",
            `${Math.min(index * 40, 500)}ms`
        );

        const photo =
            player.photo ||
            "/static/images/player-placeholder.svg";

        card.innerHTML = `
            <div class="player-card-inner">

                <div class="player-card-image">

                    <img
                        src="${this.escape(player.photo || photo)}"
                        alt="${this.escape(player.name || "Joueur")}"
                        loading="lazy"
                    >

                    <div class="player-card-glow"></div>

                    ${
                        player.legend
                        ? `<span class="player-badge">⭐ LÉGENDE</span>`
                        : ""
                    }

                </div>

                <div class="player-card-info">

                    <h3>
                        ${this.escape(player.name || "Joueur inconnu")}
                    </h3>

                    <p>
                        ${this.escape(player.position || "Position inconnue")}
                    </p>

                    <div class="player-meta">

                        <span>
                            🌍 ${this.escape(player.country || "—")}
                        </span>

                        <span>
                            ⚽ ${this.escape(player.club || "—")}
                        </span>

                    </div>

                    ${
                        player.birthYear
                        ? `<small>Né en ${this.escape(player.birthYear)}</small>`
                        : ""
                    }

                </div>

            </div>
        `;

        card.addEventListener("click", () => {
            this.openPlayer(player);
        });

        card.addEventListener("mousemove", event => {
            this.tiltCard(card, event);
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform =
                "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
        });

        return card;
    }

    render() {

        if (!this.container) return;

        this.container.innerHTML = "";

        if (!this.filteredPlayers.length) {

            this.container.innerHTML = `
                <div class="players-empty">
                    <div class="players-empty-icon">⚽</div>
                    <h3>Aucun joueur trouvé</h3>
                    <p>
                        Essaie un autre nom, pays ou club.
                    </p>
                </div>
            `;

            return;
        }

        const fragment = document.createDocumentFragment();

        this.filteredPlayers.forEach((player, index) => {
            fragment.appendChild(
                this.createCard(player, index)
            );
        });

        this.container.appendChild(fragment);
    }

    tiltCard(card, event) {

        const rect = card.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const centerX =
            rect.width / 2;

        const centerY =
            rect.height / 2;

        const rotateY =
            ((x - centerX) / centerX) * 8;

        const rotateX =
            ((centerY - y) / centerY) * 8;

        card.style.transform =
            `perspective(900px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-8px)`;
    }

    openPlayer(player) {

        const event = new CustomEvent(
            "footballplatform:player-open",
            {
                detail: player
            }
        );

        document.dispatchEvent(event);
    }

    bindEvents() {

        document.addEventListener(
            "footballplatform:search-player",
            event => {
                this.search(event.detail || "");
            }
        );

    }

    escape(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

window.FootballPlatformPlayerUI =
    new PlayerUI();
