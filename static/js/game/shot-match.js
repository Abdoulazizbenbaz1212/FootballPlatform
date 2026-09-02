(() => {
    "use strict";

    class ShotMatch {
        constructor() {
            this.controller = null;
            this.canvas = null;
            this.shots = 5;
            this.currentShot = 0;
            this.goals = 0;
            this.saves = 0;
            this.locked = false;
            this.player = null;
        }

        init() {
            this.createInterface();
        }

        createInterface() {
            let game = document.querySelector("#penaltyGame");

            if (!game) {
                game = document.createElement("section");
                game.id = "penaltyGame";
                game.className = "penalty-game";

                game.innerHTML = `
                    <div class="penalty-game-header">
                        <div>
                            <span class="penalty-kicker">⚡ LIVE CHALLENGE</span>
                            <h2>Penalty Arena</h2>
                            <p>Trace ton tir avec ton doigt.</p>
                        </div>

                        <div class="penalty-score">
                            <strong id="penaltyGoals">0</strong>
                            <span>/ 5 BUTS</span>
                        </div>
                    </div>

                    <div class="penalty-stadium">

                        <div class="stadium-lights"></div>

                        <div class="goal">
                            <div class="net"></div>
                            <div class="goalkeeper" id="goalkeeper">
                                🧤
                            </div>
                        </div>

                        <div class="ball" id="penaltyBall">
                            ⚽
                        </div>

                        <div class="shot-instruction" id="shotInstruction">
                            👆 Trace ton tir
                        </div>

                        <canvas id="shotCanvas"></canvas>

                    </div>

                    <div class="penalty-controls">

                        <div class="shot-progress">
                            <span id="shotNumber">Tir 1 / 5</span>
                            <div class="shot-progress-bar">
                                <i id="shotProgress"></i>
                            </div>
                        </div>

                        <button id="resetPenalty" type="button">
                            🔄 Recommencer
                        </button>

                    </div>

                    <div class="penalty-result" id="penaltyResult"></div>
                `;

                const target =
                    document.querySelector("main") ||
                    document.body;

                target.appendChild(game);
            }

            this.canvas = document.querySelector("#shotCanvas");

            if (!this.canvas) return;

            this.controller = new ShotController();

            this.controller.init(
                this.canvas,
                shot => this.executeShot(shot)
            );

            this.updateUI();
        }

        executeShot(shot) {
            if (this.locked) return;

            this.locked = true;

            const instruction =
                document.querySelector("#shotInstruction");

            if (instruction) {
                instruction.textContent = "⚡ FRAPPE !";
            }

            const engine = window.GoalkeeperEngine;

            let result;

            if (engine) {
                result = engine.calculateShot({
                    goalkeeper: 64,
                    shooter: 72,
                    shotPower: Math.max(50, shot.power),
                    distance: 11,
                    angle: Math.abs(shot.direction.x) * 45,
                    accuracy: shot.accuracy
                });
            } else {
                result = {
                    goal: Math.random() > 0.6,
                    saved: false,
                    saveChance: 60,
                    animation: "save"
                };
            }

            this.animateBall(shot, result);
        }

        animateBall(shot, result) {
            const ball = document.querySelector("#penaltyBall");
            const goalkeeper =
                document.querySelector("#goalkeeper");

            if (!ball) {
                this.finishShot(result);
                return;
            }

            const game =
                document.querySelector(".penalty-stadium");

            const rect = game.getBoundingClientRect();

            const targetX =
                rect.width * (
                    0.5 +
                    shot.direction.x * 0.36
                );

            const targetY =
                rect.height * (
                    0.18 -
                    shot.direction.y * 0.08
                );

            ball.style.left =
                `${shot.start.x}px`;

            ball.style.top =
                `${shot.start.y}px`;

            ball.style.transition =
                "left .65s cubic-bezier(.2,.8,.2,1), top .65s cubic-bezier(.2,.8,.2,1), transform .65s ease";

            requestAnimationFrame(() => {
                ball.style.left = `${targetX}px`;
                ball.style.top = `${targetY}px`;
                ball.style.transform =
                    "translate(-50%, -50%) scale(.65) rotate(720deg)";
            });

            if (goalkeeper) {
                const direction =
                    shot.direction.x < -0.15
                        ? "left"
                        : shot.direction.x > 0.15
                            ? "right"
                            : "center";

                goalkeeper.dataset.dive = direction;

                setTimeout(() => {
                    goalkeeper.classList.add(
                        result.saved
                            ? "goalkeeper-save"
                            : "goalkeeper-miss"
                    );
                }, 300);
            }

            setTimeout(() => {
                this.finishShot(result);
            }, 850);
        }

        finishShot(result) {
            if (result.goal) {
                this.goals++;
            } else {
                this.saves++;
            }

            this.currentShot++;

            this.showResult(result);
            this.updateUI();

            setTimeout(() => {
                this.locked = false;

                const goalkeeper =
                    document.querySelector("#goalkeeper");

                goalkeeper?.classList.remove(
                    "goalkeeper-save",
                    "goalkeeper-miss"
                );

                const ball =
                    document.querySelector("#penaltyBall");

                if (ball) {
                    ball.style.transition = "none";
                    ball.style.left = "50%";
                    ball.style.top = "82%";
                    ball.style.transform =
                        "translate(-50%, -50%)";
                }

                if (this.currentShot >= this.shots) {
                    this.endMatch();
                } else {
                    const instruction =
                        document.querySelector("#shotInstruction");

                    if (instruction) {
                        instruction.textContent =
                            `👆 Tir ${this.currentShot + 1} : trace ta frappe`;
                    }
                }
            }, 1300);
        }

        showResult(result) {
            const box =
                document.querySelector("#penaltyResult");

            if (!box) return;

            box.className =
                `penalty-result ${result.goal ? "goal" : "saved"}`;

            box.innerHTML = result.goal
                ? `
                    <strong>⚽ BUT !</strong>
                    <span>Le gardien est battu.</span>
                `
                : `
                    <strong>🧤 ARRÊT !</strong>
                    <span>Le gardien a sorti le grand jeu.</span>
                `;
        }

        updateUI() {
            const goals =
                document.querySelector("#penaltyGoals");

            const number =
                document.querySelector("#shotNumber");

            const progress =
                document.querySelector("#shotProgress");

            if (goals) {
                goals.textContent = this.goals;
            }

            if (number) {
                number.textContent =
                    `Tir ${Math.min(this.currentShot + 1, 5)} / 5`;
            }

            if (progress) {
                progress.style.width =
                    `${(this.currentShot / this.shots) * 100}%`;
            }
        }

        endMatch() {
            const box =
                document.querySelector("#penaltyResult");

            if (!box) return;

            const message =
                this.goals >= 3
                    ? "🔥 Excellente série !"
                    : this.goals === 2
                        ? "🎯 Belle performance !"
                        : "🧤 Le gardien était en forme !";

            box.className = "penalty-result final";

            box.innerHTML = `
                <strong>${message}</strong>
                <span>
                    ${this.goals} but${this.goals > 1 ? "s" : ""}
                    sur ${this.shots}
                </span>
            `;
        }

        reset() {
            this.currentShot = 0;
            this.goals = 0;
            this.saves = 0;
            this.locked = false;

            const box =
                document.querySelector("#penaltyResult");

            if (box) {
                box.className = "penalty-result";
                box.innerHTML = "";
            }

            this.updateUI();
        }

        startPlayerChallenge(player) {
            this.player = player || null;

            const game =
                document.querySelector("#penaltyGame");

            if (game) {
                game.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            this.reset();
        }
    }

    window.ShotMatch = new ShotMatch();

})();

document.addEventListener("click", event => {
    if (event.target.closest("#resetPenalty")) {
        window.ShotMatch?.reset();
    }
});

