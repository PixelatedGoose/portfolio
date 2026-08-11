(function () {
    const FAR_LAYER_SELECTOR = '.space-layer--far-2';
    const MIN_SPAWN_DELAY_MS = 2400;
    const MAX_SPAWN_DELAY_MS = 3000;
    const MAX_ACTIVE_STARS = 7;
    const STAR_SPEED_MIN = 100;
    const STAR_SPEED_MAX = 200;
    const STAR_LENGTH_MIN = 70;
    const STAR_LENGTH_MAX = 100;
    const STAR_CANVAS_SIZE = 80;
    const STAR_MARGIN = 96;

    function startShootingStars() {
        const layer = document.querySelector(FAR_LAYER_SELECTOR);

        if (!layer) {
            return;
        }

        const activeStars = [];
        let spawnTimer = null;

        function scheduleNextSpawn() {
            if (spawnTimer !== null) {
                window.clearTimeout(spawnTimer);
            }

            const delay = randomInteger(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
            spawnTimer = window.setTimeout(spawnShootingStar, delay);
        }

        function removeActiveStar(star) {
            const index = activeStars.indexOf(star);

            if (index !== -1) {
                activeStars.splice(index, 1);
            }

            if (star.fallbackTimer !== null) {
                window.clearTimeout(star.fallbackTimer);
            }

            star.element.remove();
        }

        function spawnShootingStar() {
            if (activeStars.length >= MAX_ACTIVE_STARS) {
                scheduleNextSpawn();
                return;
            }

            const path = createShootingStarPath();
            const speed = randomInteger(STAR_SPEED_MIN, STAR_SPEED_MAX);
            const length = randomInteger(STAR_LENGTH_MIN, STAR_LENGTH_MAX);
            const sprite = document.createElement('img');
            const asset = createShootingStarAsset(path.direction, length);

            sprite.className = 'space-sprite';
            sprite.src = asset.dataUrl;
            sprite.alt = '';
            sprite.draggable = false;
            sprite.style.width = `${asset.width}px`;
            sprite.style.height = `${asset.height}px`;
            sprite.style.opacity = '1';
            sprite.style.filter = 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))';
            sprite.style.transition = 'transform 1400ms linear, opacity 1400ms linear';
            sprite.style.transform = `translate3d(${Math.round(path.startX)}px, ${Math.round(path.startY)}px, 0)`;

            layer.appendChild(sprite);

            const travelDistance = Math.max(window.innerWidth, window.innerHeight) + STAR_MARGIN * 2 + length;
            const endX = path.startX + path.direction.x * travelDistance;
            const endY = path.startY + path.direction.y * travelDistance;
            const travelDuration = Math.max(800, Math.round((travelDistance / speed) * 1000));
            const star = {
                element: sprite,
                fallbackTimer: null,
            };

            sprite.addEventListener('transitionend', function () {
                removeActiveStar(star);
            }, { once: true });

            star.fallbackTimer = window.setTimeout(function () {
                removeActiveStar(star);
            }, travelDuration + 250);

            activeStars.push(star);

            sprite.style.transition = `transform ${travelDuration}ms linear, opacity ${travelDuration}ms linear`;

            window.requestAnimationFrame(function () {
                sprite.style.transform = `translate3d(${Math.round(endX)}px, ${Math.round(endY)}px, 0)`;
                sprite.style.opacity = '0';
            });

            scheduleNextSpawn();
        }

        scheduleNextSpawn();
    }

    function createShootingStarPath() {
        const edge = pickRandomEdge();
        const angleOffset = (Math.random() - 0.5) * (70 * Math.PI / 180);
        let startX = 0;
        let startY = 0;
        let baseAngle = 0;

        if (edge === 'top') {
            startX = Math.random() * window.innerWidth;
            startY = -STAR_MARGIN;
            baseAngle = Math.PI / 2;
        } else if (edge === 'bottom') {
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + STAR_MARGIN;
            baseAngle = -Math.PI / 2;
        } else if (edge === 'left') {
            startX = -STAR_MARGIN;
            startY = Math.random() * window.innerHeight;
            baseAngle = 0;
        } else {
            startX = window.innerWidth + STAR_MARGIN;
            startY = Math.random() * window.innerHeight;
            baseAngle = Math.PI;
        }

        const direction = {
            x: Math.cos(baseAngle + angleOffset),
            y: Math.sin(baseAngle + angleOffset),
        };

        return {
            startX: startX,
            startY: startY,
            direction: direction,
        };
    }

    function pickRandomEdge() {
        const edges = ['top', 'right', 'bottom', 'left'];
        return edges[randomInteger(0, edges.length - 1)];
    }

    function createShootingStarAsset(direction, length) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const paddedLength = length + 20;
        const width = paddedLength;
        const height = paddedLength;
        const centerX = Math.floor(width * 0.5);
        const centerY = Math.floor(height * 0.5);
        const tailSteps = Math.max(10, Math.floor(length / 3));
        const tailStepX = direction.x * 2;
        const tailStepY = direction.y * 2;

        canvas.width = width;
        canvas.height = height;

        if (!context) {
            return {
                dataUrl: '',
                width: width,
                height: height,
            };
        }

        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, width, height);

        drawPixelRect(context, centerX - 1, centerY - 1, 3, 3, '#ffffff');
        drawPixelRect(context, centerX, centerY, 1, 1, '#66d9ff');
        drawPixelRect(context, centerX - 2, centerY - 2, 5, 1, 'rgba(255, 255, 255, 0.9)');
        drawPixelRect(context, centerX - 2, centerY + 1, 5, 1, 'rgba(255, 255, 255, 0.55)');
        drawPixelRect(context, centerX - 1, centerY - 3, 3, 1, 'rgba(255, 191, 105, 0.8)');

        for (let step = 1; step <= tailSteps; step++) {
            const progress = step / tailSteps;
            const alpha = 0.9 - progress * 0.85;
            const tailX = Math.round(centerX - tailStepX * step);
            const tailY = Math.round(centerY - tailStepY * step);
            const thickness = step < 4 ? 2 : 1;
            const tailColor = step < 3 ? `rgba(255, 255, 255, ${alpha})` : `rgba(102, 217, 255, ${alpha})`;

            drawPixelRect(context, tailX, tailY, thickness, thickness, tailColor);

            if (step % 2 === 0) {
                drawPixelRect(context, tailX - 1, tailY, 1, 1, `rgba(255, 191, 105, ${alpha * 0.55})`);
            }
        }

        return {
            dataUrl: canvas.toDataURL('image/png'),
            width: width,
            height: height,
        };
    }

    function drawPixelRect(context, x, y, width, height, color) {
        context.fillStyle = color;
        context.fillRect(x, y, width, height);
    }

    function randomInteger(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startShootingStars, { once: true });
    } else {
        startShootingStars();
    }
})();
