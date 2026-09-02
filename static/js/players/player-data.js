/*
 * FootballPlatform — World Players Database
 * Structure prête pour joueurs actuels + légendes
 */

const FOOTBALL_PLAYERS = [

    // =========================
    // LÉGENDES
    // =========================

    {
        id: "pele",
        name: "Pelé",
        country: "Brésil",
        position: "Attaquant",
        club: "Santos",
        era: "legend",
        birthYear: 1940,
        deathYear: 2022,
        legend: true,
        photo: ""
    },

    {
        id: "maradona",
        name: "Diego Maradona",
        country: "Argentine",
        position: "Milieu offensif",
        club: "Napoli",
        era: "legend",
        birthYear: 1960,
        deathYear: 2020,
        legend: true,
        photo: ""
    },

    {
        id: "cruyff",
        name: "Johan Cruyff",
        country: "Pays-Bas",
        position: "Attaquant",
        club: "Ajax",
        era: "legend",
        birthYear: 1947,
        deathYear: 2016,
        legend: true,
        photo: ""
    },

    {
        id: "zidane",
        name: "Zinédine Zidane",
        country: "France",
        position: "Milieu offensif",
        club: "Real Madrid",
        era: "legend",
        birthYear: 1972,
        legend: true,
        photo: ""
    },

    {
        id: "ronaldo-nazario",
        name: "Ronaldo Nazário",
        country: "Brésil",
        position: "Attaquant",
        club: "Real Madrid",
        era: "legend",
        birthYear: 1976,
        legend: true,
        photo: ""
    },

    {
        id: "ronaldinho",
        name: "Ronaldinho",
        country: "Brésil",
        position: "Milieu offensif",
        club: "FC Barcelone",
        era: "legend",
        birthYear: 1980,
        legend: true,
        photo: ""
    },

    {
        id: "beckenbauer",
        name: "Franz Beckenbauer",
        country: "Allemagne",
        position: "Défenseur",
        club: "Bayern Munich",
        era: "legend",
        birthYear: 1945,
        deathYear: 2024,
        legend: true,
        photo: ""
    },

    // =========================
    // JOUEURS MODERNES
    // =========================

    {
        id: "messi",
        name: "Lionel Messi",
        country: "Argentine",
        position: "Attaquant",
        club: "Inter Miami",
        era: "modern",
        birthYear: 1987,
        legend: true,
        photo: ""
    },

    {
        id: "cristiano-ronaldo",
        name: "Cristiano Ronaldo",
        country: "Portugal",
        position: "Attaquant",
        club: "Al-Nassr",
        era: "modern",
        birthYear: 1985,
        legend: true,
        photo: ""
    },

    {
        id: "mbappe",
        name: "Kylian Mbappé",
        country: "France",
        position: "Attaquant",
        club: "Real Madrid",
        era: "modern",
        birthYear: 1998,
        legend: false,
        photo: ""
    },

    {
        id: "vinicius",
        name: "Vinícius Júnior",
        country: "Brésil",
        position: "Ailier",
        club: "Real Madrid",
        era: "modern",
        birthYear: 2000,
        legend: false,
        photo: ""
    },

    {
        id: "bellingham",
        name: "Jude Bellingham",
        country: "Angleterre",
        position: "Milieu",
        club: "Real Madrid",
        era: "modern",
        birthYear: 2003,
        legend: false,
        photo: ""
    },

    {
        id: "haaland",
        name: "Erling Haaland",
        country: "Norvège",
        position: "Attaquant",
        club: "Manchester City",
        era: "modern",
        birthYear: 2000,
        legend: false,
        photo: ""
    },

    // =========================
    // AFRIQUE
    // =========================

    {
        id: "eto-o",
        name: "Samuel Eto'o",
        country: "Cameroun",
        position: "Attaquant",
        club: "FC Barcelone",
        era: "legend",
        birthYear: 1981,
        legend: true,
        photo: ""
    },

    {
        id: "drogba",
        name: "Didier Drogba",
        country: "Côte d'Ivoire",
        position: "Attaquant",
        club: "Chelsea",
        era: "legend",
        birthYear: 1978,
        legend: true,
        photo: ""
    },

    {
        id: "weah",
        name: "George Weah",
        country: "Liberia",
        position: "Attaquant",
        club: "AC Milan",
        era: "legend",
        birthYear: 1966,
        legend: true,
        photo: ""
    },

    {
        id: "mané",
        name: "Sadio Mané",
        country: "Sénégal",
        position: "Ailier",
        club: "Al-Nassr",
        era: "modern",
        birthYear: 1992,
        legend: false,
        photo: ""
    },

    // =========================
    // MÉTADONNÉES
    // =========================

];

window.FOOTBALL_PLAYERS = FOOTBALL_PLAYERS;

window.FOOTBALL_PLAYERS_STATS = {
    total: FOOTBALL_PLAYERS.length,
    legends: FOOTBALL_PLAYERS.filter(p => p.legend).length,
    modern: FOOTBALL_PLAYERS.filter(p => p.era === "modern").length
};
