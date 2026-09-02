(() => {
    "use strict";

    class ShotController {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.active = false;
            this.points = [];
            this.start = null;
            this.end = null;
            this.onShot = null;
        }

        init(canvas, onShot) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.onShot = onShot;

            this.resize();
            window.addEventListener("resize", () => this.resize());

            this.bind();
            this.draw();
        }

        resize() {
            if (!this.canvas) return;

            const rect = this.canvas.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;

            this.canvas.width = rect.width * ratio;
            this.canvas.height = rect.height * ratio;

            this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            this.draw();
        }

        position(event) {
            const rect = this.canvas.getBoundingClientRect();

            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        bind() {
            this.canvas.style.touchAction = "none";

            this.canvas.addEventListener(
                "pointerdown",
                event => this.pointerDown(event)
            );

            this.canvas.addEventListener(
                "pointermove",
                event => this.pointerMove(event)
            );

            this.canvas.addEventListener(
                "pointerup",
                event => this.pointerUp(event)
            );

            this.canvas.addEventListener(
                "pointercancel",
                () => this.cancel()
            );

            this.canvas.addEventListener(
                "pointerleave",
                event => {
                    if (this.active && event.buttons === 0) {
                        this.pointerUp(event);
                    }
                }
            );
        }

        pointerDown(event) {
            if (this.active) return;

            this.active = true;
            this.points = [];

            this.start = this.position(event);
            this.points.push(this.start);

            try {
                this.canvas.setPointerCapture(event.pointerId);
            } catch (_) {}

            this.draw();
        }

        pointerMove(event) {
            if (!this.active) return;

            const point = this.position(event);

            this.points.push(point);

            if (this.points.length > 80) {
                this.points.shift();
            }

            this.end = point;

            this.draw();
        }

        pointerUp(event) {
            if (!this.active) return;

            const point = this.position(event);

            this.points.push(point);
            this.end = point;
            this.active = false;

            const shot = this.calculateShot();

            this.draw();

            if (shot && this.onShot) {
                this.onShot(shot);
            }
        }

        cancel() {
            this.active = false;
            this.points = [];
            this.start = null;
            this.end = null;
            this.draw();
        }

        calculateShot() {
            if (!this.start || !this.end) return null;

            const dx = this.end.x - this.start.x;
            const dy = this.end.y - this.start.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
                this.cancel();
                return null;
            }

            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;

            /*
             * Le joueur trace vers la cible.
             *
             * x:
             * gauche  = -1
             * centre  = 0
             * droite  = +1
             *
             * y:
             * bas     = 0
             * haut    = 1
             */

            const horizontal = dx / (width * 0.45);

            const vertical = -dy / (height * 0.65);

            const direction = {
                x: Math.max(-1, Math.min(1, horizontal)),
                y: Math.max(0, Math.min(1, vertical))
            };

            const power = Math.max(
                0,
                Math.min(100, distance / Math.max(width, height) * 180)
            );

            let accuracy = 72;

            /*
             * Plus le tracé est long et propre,
             * plus la frappe est précise.
             */
            if (this.points.length >= 8) {
                accuracy += 8;
            }

            if (distance > 150) {
                accuracy += 4;
            }

            accuracy = Math.min(92, accuracy);

            return {
                start: { ...this.start },
                end: { ...this.end },
                points: this.points.map(point => ({ ...point })),
                direction,
                power: Math.round(power),
                accuracy
            };
        }

        draw() {
            if (!this.ctx || !this.canvas) return;

            const ctx = this.ctx;
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;

            ctx.clearRect(0, 0, width, height);

            if (!this.points.length) {
                return;
            }

            ctx.save();

            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            /*
             * Ligne du geste
             */
            ctx.beginPath();

            this.points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            ctx.stroke();

            /*
             * Point de départ
             */
            if (this.start) {
                ctx.beginPath();
                ctx.arc(
                    this.start.x,
                    this.start.y,
                    9,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            /*
             * Cible finale
             */
            if (this.end) {
                ctx.beginPath();
                ctx.arc(
                    this.end.x,
                    this.end.y,
                    13,
                    0,
                    Math.PI * 2
                );

                ctx.stroke();
            }

            ctx.restore();
        }
    }

    window.ShotController = ShotController;

})();
