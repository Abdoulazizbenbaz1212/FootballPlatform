const players = [
    {
        name: "Kylian Mbappé",
        position: "Attaquant",
        country: "France",
        number: 9,
        type: "Actuel",
        rating: 97,
        emoji: "🇫🇷"
    },
    {
        name: "Erling Haaland",
        position: "Attaquant",
        country: "Norvège",
        number: 9,
        type: "Actuel",
        rating: 96,
        emoji: "🇳🇴"
    },
    {
        name: "Lamine Yamal",
        position: "Ailier",
        country: "Espagne",
        number: 10,
        type: "Actuel",
        rating: 94,
        emoji: "🇪🇸"
    },
    {
        name: "Lionel Messi",
        position: "Attaquant",
        country: "Argentine",
        number: 10,
        type: "Légende",
        rating: 99,
        emoji: "🇦🇷"
    },
    {
        name: "Cristiano Ronaldo",
        position: "Attaquant",
        country: "Portugal",
        number: 7,
        type: "Légende",
        rating: 99,
        emoji: "🇵🇹"
    },
    {
        name: "Pelé",
        position: "Attaquant",
        country: "Brésil",
        number: 10,
        type: "Légende",
        rating: 100,
        emoji: "🇧🇷"
    }
];

const playerGrid =
    document.getElementById("playerGrid");

const playerSearch =
    document.getElementById("playerSearch");

const playerFilter =
    document.getElementById("playerFilter");

function renderPlayers(list) {

    if (!playerGrid) return;

    if (!list.length) {
        playerGrid.innerHTML = `
            <div class="empty-players">
                🔎 Aucun joueur trouvé.
            </div>
        `;
        return;
    }

    playerGrid.innerHTML =
        list.map(player => `
            <article class="player-card-3d">

                <div class="player-card-glow"></div>

                <div class="player-top">

                    <span class="player-type">
                        ${player.type}
                    </span>

                    <strong>
                        ${player.rating}
                    </strong>

                </div>

                <div class="player-avatar">
                    <span>${player.emoji}</span>
                </div>

                <div class="player-number">
                    ${player.number}
                </div>

                <div class="player-info">

                    <h3>
                        ${player.name}
                    </h3>

                    <p>
                        ${player.position}
                    </p>

                    <small>
                        ${player.country}
                    </small>

                </div>

            </article>
        `).join("");

    document
        .querySelectorAll(".player-card-3d")
        .forEach(card => {

            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX - rect.left;

                    const y =
                        event.clientY - rect.top;

                    const rotateY =
                        ((x / rect.width) - .5) * 14;

                    const rotateX =
                        ((y / rect.height) - .5) * -14;

                    card.style.transform =
                        `perspective(900px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-8px)`;
                }
            );

            card.addEventListener(
                "mouseleave",
                () => {
                    card.style.transform =
                        "";
                }
            );
        });
}

function filterPlayers() {

    const search =
        playerSearch?.value
            .toLowerCase()
            .trim() || "";

    const filter =
        playerFilter?.value || "Tous";

    const result =
        players.filter(player => {

            const matchesSearch =
                player.name
                    .toLowerCase()
                    .includes(search) ||
                player.country
                    .toLowerCase()
                    .includes(search);

            const matchesFilter =
                filter === "Tous" ||
                player.type === filter;

            return matchesSearch &&
                   matchesFilter;
        });

    renderPlayers(result);
}

playerSearch?.addEventListener(
    "input",
    filterPlayers
);

playerFilter?.addEventListener(
    "change",
    filterPlayers
);

renderPlayers(players);
