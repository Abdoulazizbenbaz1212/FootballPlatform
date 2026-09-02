/*
 * FootballPlatform
 * WORLD PLAYER ENGINE
 * Recherche locale de milliers de joueurs
 */

class WorldPlayerEngine {

    constructor() {
        this.players = [];
        this.filtered = [];
        this.loaded = false;
        this.page = 0;
        this.pageSize = 30;
    }

    async load() {

        if (this.loaded) return this.players;

        try {

            const response = await fetch(
                "/static/data/world_players_clean.json"
            );

            if (!response.ok) {
                throw new Error("Impossible de charger les joueurs");
            }

            this.players = await response.json();
            this.filtered = [...this.players];
            this.loaded = true;

            console.log(
                `⚽ ${this.players.length} joueurs chargés`
            );

            return this.players;

        } catch (error) {

            console.error(
                "❌ Erreur joueurs :",
                error
            );

            return [];
        }
    }

    search(query = "") {

        const text = query
            .trim()
            .toLowerCase();

        if (!text) {

            this.filtered = [...this.players];

        } else {

            this.filtered = this.players.filter(player => {

                return [
                    player.name,
                    player.country,
                    player.position,
                    player.club
                ]
                .filter(Boolean)
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(text)
                );

            });
        }

        this.page = 0;

        return this.getPage();
    }

    filterCountry(country) {

        if (!country || country === "all") {

            this.filtered = [...this.players];

        } else {

            this.filtered =
                this.players.filter(
                    player =>
                        player.country === country
                );
        }

        this.page = 0;

        return this.getPage();
    }

    filterPosition(position) {

        if (!position || position === "all") {

            this.filtered = [...this.players];

        } else {

            this.filtered =
                this.players.filter(
                    player =>
                        player.position === position
                );
        }

        this.page = 0;

        return this.getPage();
    }

    getPage() {

        const start =
            this.page * this.pageSize;

        const end =
            start + this.pageSize;

        return this.filtered.slice(
            start,
            end
        );
    }

    nextPage() {

        if (
            (this.page + 1) *
            this.pageSize <
            this.filtered.length
        ) {

            this.page++;

        }

        return this.getPage();
    }

    previousPage() {

        if (this.page > 0) {
            this.page--;
        }

        return this.getPage();
    }

    getCountries() {

        return [
            ...new Set(
                this.players
                    .map(player => player.country)
                    .filter(Boolean)
            )
        ].sort();
    }

    getPositions() {

        return [
            ...new Set(
                this.players
                    .map(player => player.position)
                    .filter(Boolean)
            )
        ].sort();
    }

    getStats() {

        return {

            total: this.players.length,

            countries:
                this.getCountries().length,

            goalkeepers:
                this.players.filter(
                    p => p.position === "Gardien"
                ).length,

            defenders:
                this.players.filter(
                    p => p.position === "Défenseur"
                ).length,

            midfielders:
                this.players.filter(
                    p => p.position === "Milieu"
                ).length,

            forwards:
                this.players.filter(
                    p => p.position === "Attaquant"
                ).length
        };
    }
}

window.WorldPlayerEngine =
    new WorldPlayerEngine();
