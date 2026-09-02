/*
 * FootballPlatform
 * Goalkeeper Engine
 * Gardien puissant + tirs réalistes
 */

class GoalkeeperEngine {

    constructor() {
        this.defaultSaveRate = 0.60;
    }

    calculateShot({
        goalkeeper = 60,
        shooter = 60,
        shotPower = 70,
        distance = 18,
        angle = 45,
        accuracy = 70
    } = {}) {

        // Plus le gardien est fort, plus il arrête.
        let saveChance = goalkeeper / 100;

        // Force du tireur
        saveChance -= (shooter - 50) * 0.0025;

        // Précision du tir
        saveChance += (accuracy - 50) * 0.003;

        // Puissance du tir
        saveChance -= (shotPower - 50) * 0.002;

        // Distance : plus c'est loin, plus le gardien a légèrement
        // de temps pour réagir.
        if (distance > 20) {
            saveChance += 0.04;
        } else if (distance < 12) {
            saveChance -= 0.08;
        }

        // Angle fermé = tir généralement plus difficile.
        if (angle < 25) {
            saveChance -= 0.05;
        }

        // Limites réalistes.
        saveChance = Math.max(
            0.15,
            Math.min(0.88, saveChance)
        );

        const random = Math.random();

        const saved = random < saveChance;

        return {
            goal: !saved,
            saved,
            saveChance: Math.round(saveChance * 100),
            animation: saved ? "save" : "goal"
        };
    }

    simulate(shots = 5, options = {}) {

        const results = [];

        for (let i = 0; i < shots; i++) {
            results.push(
                this.calculateShot(options)
            );
        }

        const goals = results.filter(
            result => result.goal
        ).length;

        const saves = results.filter(
            result => result.saved
        ).length;

        return {
            shots,
            goals,
            saves,
            results
        };
    }
}

window.GoalkeeperEngine =
    new GoalkeeperEngine();
