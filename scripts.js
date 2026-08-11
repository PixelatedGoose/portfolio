function openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.add('active');

    if (modal.dataset.galleryId) {
        setProjectGallery(modal.dataset.galleryId, 0);
        startProjectGallery(modal.dataset.galleryId);
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);

    if (!modal) {
        return;
    }

    if (modal.dataset.galleryId) {
        stopProjectGallery(modal.dataset.galleryId);
    }

    modal.classList.remove('active');
}

window.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

window.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
        return;
    }

    const activeModal = document.querySelector('.modal.active');

    if (activeModal) {
        closeModal(activeModal.id);
    }
});

const PROJECT_GALLERIES = {
    project3: {
        images: [
            'images/AmisDriftGallery/01.jpg',
            'images/AmisDriftGallery/02.jpg',
            'images/AmisDriftGallery/03.jpg',
            'images/AmisDriftGallery/04.jpg',
            'images/AmisDriftGallery/05.jpg',
        ],
        index: 0,
        timer: null,
    },
};

function setProjectGallery(galleryId, index) {
    const gallery = PROJECT_GALLERIES[galleryId];

    if (!gallery) {
        return;
    }

    const imageElement = document.getElementById(`${galleryId}-gallery-image`);
    const counterElement = document.getElementById(`${galleryId}-gallery-counter`);
    const totalElement = document.getElementById(`${galleryId}-gallery-total`);

    if (!imageElement || !counterElement || !totalElement) {
        return;
    }

    const normalizedIndex = (index + gallery.images.length) % gallery.images.length;
    gallery.index = normalizedIndex;

    imageElement.src = gallery.images[normalizedIndex];
    imageElement.alt = `AmisDrift gallery image ${normalizedIndex + 1}`;
    counterElement.textContent = String(normalizedIndex + 1);
    totalElement.textContent = String(gallery.images.length);
}

function rotateProjectGallery(galleryId, direction) {
    const gallery = PROJECT_GALLERIES[galleryId];

    if (!gallery || gallery.images.length <= 1) {
        return;
    }

    setProjectGallery(galleryId, gallery.index + direction);
}

function startProjectGallery(galleryId) {
    const gallery = PROJECT_GALLERIES[galleryId];

    if (!gallery || gallery.images.length <= 1) {
        return;
    }

    stopProjectGallery(galleryId);
    gallery.timer = window.setInterval(function () {
        rotateProjectGallery(galleryId, 1);
    }, 3500);
}

function stopProjectGallery(galleryId) {
    const gallery = PROJECT_GALLERIES[galleryId];

    if (!gallery || gallery.timer === null) {
        return;
    }

    window.clearInterval(gallery.timer);
    gallery.timer = null;
}

const SPACE_TILE_SIZE = 256;

const SPACE_BASE_TILE_ASSET = {
    url: 'images/SpaceImages/spacebg/StarsTile.png',
    fallback: function () {
        return createStarTile(SPACE_TILE_SIZE, 14, 92);
    },
};

const SPACE_STAR_TILE_ASSET = {
    url: 'images/SpaceImages/spacebg/Stars2.png',
    fallback: function () {
        return createStarTile(SPACE_TILE_SIZE, 42, 62);
    },
};

const SPACE_SPECIAL_ASSETS = {
    nebula: {
        url: 'images/SpaceImages/spacespecial/Nebula.png',
        weight: 5,
        fallback: createNebulaAsset,
    },
    redNebula: {
        url: 'images/SpaceImages/spacespecial/RedNebula.png',
        weight: 4,
        fallback: createNebulaAsset,
    },
    rock: {
        url: 'images/SpaceImages/spacespecial/Rock.png',
        weight: 3,
        fallback: createStationAsset,
    },
};

async function initSpaceScene() {
    const scene = document.querySelector('.space-scene');

    if (!scene) {
        return;
    }

    const baseLayer = scene.querySelector('.space-layer--base');
    const starLayer = scene.querySelector('.space-layer--stars');
    const movingLayerDefinitions = [
        {
            element: scene.querySelector('.space-layer--far'),
            speed: 0.20,
            count: 6,
            minSpacing: 220,
            assetWeights: {
                nebula: 6,
                redNebula: 4,
            },
            wrapMargin: 320,
            opacity: 0.84,
        },
        {
            element: scene.querySelector('.space-layer--far-2'),
            speed: 0.30,
            count: 4,
            minSpacing: 220,
            assetWeights: {
                nebula: 4,
                redNebula: 3,
            },
            wrapMargin: 280,
            opacity: 0.7,
        },
        {
            element: scene.querySelector('.space-layer--medium'),
            speed: 0.43,
            count: 8,
            minSpacing: 280,
            assetWeights: {
                
                rock: 3,

            },
            wrapMargin: 360,
            opacity: 0.92,
        },
        {
            element: scene.querySelector('.space-layer--medium-2'),
            speed: 0.50,
            count: 6,
            minSpacing: 280,
            assetWeights: {
                rock: 5,

            },
            wrapMargin: 340,
            opacity: 0.9,
        },
        {
            element: scene.querySelector('.space-layer--close'),
            speed: 0.78,
            count: 4,
            minSpacing: 320,
            assetWeights: {
                rock: 6,

            },
            wrapMargin: 420,
            opacity: 1,
        },
    ];

    if (!baseLayer || !starLayer || movingLayerDefinitions.some(function (definition) { return !definition.element; })) {
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const driftAngle = Math.random() * Math.PI * 2;
    const driftVector = {
        x: Math.cos(driftAngle),
        y: Math.sin(driftAngle),
    };
    const perpendicularVector = {
        x: -driftVector.y,
        y: driftVector.x,
    };

    const assetLibrary = await createSpaceAssetLibrary();
    const baseTile = await loadBackgroundTile(SPACE_BASE_TILE_ASSET);
    const starTile = await loadBackgroundTile(SPACE_STAR_TILE_ASSET);

    baseLayer.style.backgroundImage = `url(${baseTile.url})`;
    baseLayer.style.backgroundSize = `${SPACE_TILE_SIZE}px ${SPACE_TILE_SIZE}px`;
    starLayer.style.backgroundImage = `url(${starTile.url})`;
    starLayer.style.backgroundSize = `${SPACE_TILE_SIZE}px ${SPACE_TILE_SIZE}px`;

    const movingLayers = movingLayerDefinitions.map(function (definition) {
        const sprites = [];

        for (let index = 0; index < definition.count; index++) {
            const assetName = pickWeightedKey(definition.assetWeights);
            const asset = assetLibrary.specials[assetName];
            const placement = findSeparatedPlacement(definition, asset, sprites);
            const sprite = document.createElement('img');
            const width = asset.width;
            const height = asset.height;
            const sway = (Math.random() - 0.5) * definition.speed * 0.45;

            sprite.className = 'space-sprite';
            sprite.src = asset.url;
            sprite.alt = '';
            sprite.draggable = false;
            sprite.style.width = `${width}px`;
            sprite.style.height = `${height}px`;
            sprite.style.opacity = String(definition.opacity);
            sprite.style.filter = 'drop-shadow(0 0 4px rgba(102, 217, 255, 0.18))';
            sprite.style.transform = `translate3d(${placement.x}px, ${placement.y}px, 0)`;
            sprite.style.imageRendering = 'pixelated';

            definition.element.appendChild(sprite);

            sprites.push({
                element: sprite,
                x: placement.x,
                y: placement.y,
                width: width,
                height: height,
                velocityX: driftVector.x * definition.speed + perpendicularVector.x * sway,
                velocityY: driftVector.y * definition.speed + perpendicularVector.y * sway,
                wrapMargin: definition.wrapMargin,
                radius: placement.radius,
            });
        }

        return {
            element: definition.element,
            speed: definition.speed,
            sprites: sprites,
        };
    });

    let baseOffsetX = 0;
    let baseOffsetY = 0;
    let starOffsetX = 0;
    let starOffsetY = 0;
    let previousTime = null;
    let sceneTimer = null;

    const SCENE_FRAME_INTERVAL_MS = 1000 / 30;

    function stopSceneAnimation() {
        if (sceneTimer !== null) {
            window.clearTimeout(sceneTimer);
            sceneTimer = null;
        }
    }

    function scheduleNextSceneFrame() {
        sceneTimer = window.setTimeout(updateScene, SCENE_FRAME_INTERVAL_MS);
    }

    function updateScene() {
        if (document.hidden) {
            stopSceneAnimation();
            previousTime = null;
            return;
        }

        sceneTimer = null;

        const time = performance.now();

        if (previousTime === null) {
            previousTime = time;
        }

        const delta = reducedMotion ? 0 : Math.min((time - previousTime) / 16.6667, 2);
        previousTime = time;

        if (!reducedMotion) {
            starOffsetX += driftVector.x * 0.18 * delta;
            starOffsetY += driftVector.y * 0.18 * delta;
            baseOffsetX += driftVector.x * 0.04 * delta;
            baseOffsetY += driftVector.y * 0.04 * delta;

            starLayer.style.backgroundPosition = `${Math.round(starOffsetX)}px ${Math.round(starOffsetY)}px`;
            baseLayer.style.backgroundPosition = `${Math.round(baseOffsetX)}px ${Math.round(baseOffsetY)}px`;
        }

        for (let layerIndex = 0; layerIndex < movingLayers.length; layerIndex++) {
            const layer = movingLayers[layerIndex];

            for (let spriteIndex = 0; spriteIndex < layer.sprites.length; spriteIndex++) {
                const sprite = layer.sprites[spriteIndex];

                if (!reducedMotion) {
                    sprite.x += sprite.velocityX * delta;
                    sprite.y += sprite.velocityY * delta;
                }

                if (sprite.x < -sprite.wrapMargin - sprite.width) {
                    sprite.x = window.innerWidth + sprite.wrapMargin;
                } else if (sprite.x > window.innerWidth + sprite.wrapMargin) {
                    sprite.x = -sprite.wrapMargin - sprite.width;
                }

                if (sprite.y < -sprite.wrapMargin - sprite.height) {
                    sprite.y = window.innerHeight + sprite.wrapMargin;
                } else if (sprite.y > window.innerHeight + sprite.wrapMargin) {
                    sprite.y = -sprite.wrapMargin - sprite.height;
                }

                sprite.element.style.transform = `translate3d(${Math.round(sprite.x)}px, ${Math.round(sprite.y)}px, 0)`;
            }
        }

        if (!reducedMotion) {
            scheduleNextSceneFrame();
        }
    }

    if (!reducedMotion) {
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopSceneAnimation();
                previousTime = null;
                return;
            }

            if (sceneTimer === null) {
                scheduleNextSceneFrame();
            }
        });

        scheduleNextSceneFrame();
    }
}

function findSeparatedPlacement(definition, asset, existingSprites) {
    const spriteRadius = calculateSpriteRadius(asset.width, asset.height);
    const minimumSpacing = Number(definition.minSpacing) || 0;
    const maxAttempts = 32;
    let placement = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = {
            x: randomInteger(-definition.wrapMargin, window.innerWidth + definition.wrapMargin),
            y: randomInteger(-definition.wrapMargin, window.innerHeight + definition.wrapMargin),
        };

        if (isPlacementSeparated(candidate, spriteRadius, existingSprites, minimumSpacing)) {
            placement = candidate;
            break;
        }
    }

    if (!placement) {
        placement = {
            x: randomInteger(-definition.wrapMargin, window.innerWidth + definition.wrapMargin),
            y: randomInteger(-definition.wrapMargin, window.innerHeight + definition.wrapMargin),
        };
    }

    placement.radius = spriteRadius;
    return placement;
}

function isPlacementSeparated(candidate, candidateRadius, existingSprites, minimumSpacing) {
    for (let index = 0; index < existingSprites.length; index++) {
        const sprite = existingSprites[index];
        const distance = Math.hypot(candidate.x - sprite.x, candidate.y - sprite.y);
        const requiredDistance = candidateRadius + sprite.radius + minimumSpacing;

        if (distance < requiredDistance) {
            return false;
        }
    }

    return true;
}

function calculateSpriteRadius(width, height) {
    return Math.ceil(Math.hypot(width, height) / 2);
}

function pickWeightedKey(weightMap) {
    const entries = Object.entries(weightMap || {});

    if (entries.length === 0) {
        return null;
    }

    const totalWeight = entries.reduce(function (sum, entry) {
        const weight = Number(entry[1]);
        return sum + (Number.isFinite(weight) && weight > 0 ? weight : 0);
    }, 0);

    if (totalWeight <= 0) {
        return entries[0][0];
    }

    let roll = Math.random() * totalWeight;

    for (let index = 0; index < entries.length; index++) {
        const key = entries[index][0];
        const weight = Number(entries[index][1]);

        if (!Number.isFinite(weight) || weight <= 0) {
            continue;
        }

        roll -= weight;

        if (roll <= 0) {
            return key;
        }
    }

    return entries[entries.length - 1][0];
}

function randomInteger(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

async function createSpaceAssetLibrary() {
    const specials = await Promise.all(Object.entries(SPACE_SPECIAL_ASSETS).map(async function (entry) {
        const assetName = entry[0];
        const assetDefinition = entry[1];
        const imageAsset = await loadImageAsset(assetDefinition.url);

        if (imageAsset) {
            return [assetName, {
                url: imageAsset.url,
                width: imageAsset.width,
                height: imageAsset.height,
                weight: assetDefinition.weight,
            }];
        }

        const fallback = assetDefinition.fallback();
        return [assetName, {
            url: fallback.dataUrl,
            width: fallback.width,
            height: fallback.height,
            weight: assetDefinition.weight,
        }];
    }));

    return {
        specials: Object.fromEntries(specials),
    };
}

async function loadBackgroundTile(assetDefinition) {
    const imageAsset = await loadImageAsset(assetDefinition.url);

    if (imageAsset) {
        return {
            url: imageAsset.url,
            width: imageAsset.width,
            height: imageAsset.height,
        };
    }

    const fallback = assetDefinition.fallback();
    return {
        url: fallback.dataUrl,
        width: fallback.width,
        height: fallback.height,
    };
}

function loadImageAsset(url) {
    return new Promise(function (resolve) {
        const image = new Image();

        image.onload = function () {
            resolve({
                url: url,
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
        };

        image.onerror = function () {
            resolve(null);
        };

        image.src = url;
    });
}

function createStarTile(tileSize, seedOffset, starCount) {
    return createCanvasAsset(tileSize, tileSize, function (context) {
        const random = createSeededRandom(seedOffset);

        context.fillStyle = '#02040b';
        context.fillRect(0, 0, tileSize, tileSize);

        for (let index = 0; index < 24; index++) {
            const x = Math.floor(random() * tileSize);
            const y = Math.floor(random() * tileSize);
            const width = random() > 0.75 ? 2 : 1;
            const height = width;
            const hue = random() > 0.8 ? 'rgba(114, 208, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)';

            context.fillStyle = hue;
            context.fillRect(x, y, width, height);
        }

        for (let index = 0; index < starCount; index++) {
            const x = Math.floor(random() * tileSize);
            const y = Math.floor(random() * tileSize);
            const size = random() > 0.7 ? 2 : 1;
            const palette = [
                'rgba(255, 255, 255, 0.95)',
                'rgba(102, 217, 255, 0.9)',
                'rgba(255, 191, 105, 0.82)',
            ];

            context.fillStyle = palette[Math.floor(random() * palette.length)];
            context.fillRect(x, y, size, size);

            if (size === 2) {
                context.fillRect(Math.max(0, x - 1), y, 1, 1);
                context.fillRect(x, Math.max(0, y - 1), 1, 1);
            }
        }
    });
}

function createNebulaAsset() {
    return createCanvasAsset(48, 48, function (context) {
        context.clearRect(0, 0, 48, 48);
        const colors = ['rgba(64, 115, 255, 0.34)', 'rgba(166, 92, 255, 0.3)', 'rgba(102, 217, 255, 0.28)', 'rgba(255, 191, 105, 0.22)'];

        for (let y = 0; y < 48; y += 3) {
            for (let x = 0; x < 48; x += 3) {
                const distance = Math.sqrt(Math.pow(x - 24, 2) + Math.pow(y - 22, 2));
                const noise = Math.random() * 0.85;
                const shouldPaint = distance < 18 + noise * 7;

                if (shouldPaint) {
                    const opacity = Math.max(0.08, 0.32 - distance / 80 + noise * 0.06);
                    context.fillStyle = colors[(x + y) % colors.length].replace(/0\.[0-9]+\)$/, `${opacity})`);
                    context.fillRect(x, y, 3, 3);
                }
            }
        }

        context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        context.fillRect(17, 16, 2, 2);
        context.fillRect(29, 22, 2, 2);
        context.fillRect(22, 30, 1, 1);
        context.fillRect(14, 27, 1, 1);
    });
}

function createAsteroidAsset() {
    return createCanvasAsset(32, 32, function (context) {
        context.clearRect(0, 0, 32, 32);
        const shades = ['#6e6358', '#85756a', '#4e453d', '#a1917f'];

        for (let y = 0; y < 32; y += 2) {
            for (let x = 0; x < 32; x += 2) {
                const dx = x - 15.5;
                const dy = y - 14.5;
                const distance = Math.sqrt(dx * dx * 0.9 + dy * dy * 1.2);
                const shapeNoise = Math.sin((x + 3) * 0.7) + Math.cos((y + 5) * 0.6);

                if (distance < 11.5 + shapeNoise) {
                    context.fillStyle = shades[(x + y) % shades.length];
                    context.fillRect(x, y, 2, 2);
                }
            }
        }

        context.fillStyle = 'rgba(31, 26, 21, 0.85)';
        context.fillRect(10, 10, 4, 3);
        context.fillRect(19, 14, 3, 3);
        context.fillRect(13, 20, 5, 2);
        context.fillStyle = 'rgba(17, 13, 10, 0.8)';
        context.fillRect(12, 11, 2, 2);
        context.fillRect(20, 15, 1, 1);
    });
}

function createBlackHoleAsset() {
    return createCanvasAsset(40, 40, function (context) {
        context.clearRect(0, 0, 40, 40);
        const center = { x: 20, y: 20 };

        for (let y = 0; y < 40; y += 2) {
            for (let x = 0; x < 40; x += 2) {
                const dx = x - center.x;
                const dy = y - center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 6) {
                    context.fillStyle = 'rgba(4, 4, 8, 0.98)';
                    context.fillRect(x, y, 2, 2);
                } else if (distance < 11 && distance > 7) {
                    context.fillStyle = distance > 9 ? 'rgba(255, 191, 105, 0.75)' : 'rgba(102, 217, 255, 0.5)';
                    context.fillRect(x, y, 2, 2);
                } else if (distance >= 11 && distance < 14 && Math.abs(dy) < 4) {
                    context.fillStyle = 'rgba(196, 152, 255, 0.38)';
                    context.fillRect(x, y, 2, 2);
                }
            }
        }

        context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        context.fillRect(27, 13, 1, 1);
        context.fillRect(13, 27, 1, 1);
        context.fillRect(25, 26, 1, 1);
    });
}

function createStationAsset() {
    return createCanvasAsset(64, 40, function (context) {
        context.clearRect(0, 0, 64, 40);

        context.fillStyle = '#1e2632';
        context.fillRect(18, 12, 28, 16);
        context.fillStyle = '#364355';
        context.fillRect(20, 14, 24, 12);
        context.fillStyle = '#0f1724';
        context.fillRect(23, 16, 18, 8);
        context.fillStyle = 'rgba(102, 217, 255, 0.8)';
        context.fillRect(26, 18, 2, 2);
        context.fillRect(30, 18, 2, 2);
        context.fillRect(34, 18, 2, 2);
        context.fillRect(38, 18, 2, 2);

        context.fillStyle = '#253241';
        context.fillRect(2, 16, 14, 8);
        context.fillRect(48, 16, 14, 8);
        context.fillStyle = '#31445a';
        context.fillRect(0, 18, 16, 4);
        context.fillRect(48, 18, 16, 4);
        context.fillStyle = '#62778f';
        context.fillRect(7, 17, 2, 6);
        context.fillRect(55, 17, 2, 6);
        context.fillStyle = 'rgba(255, 191, 105, 0.8)';
        context.fillRect(29, 11, 1, 1);
        context.fillRect(35, 24, 1, 1);
        context.fillStyle = '#8ea2b6';
        context.fillRect(14, 14, 4, 12);
        context.fillRect(46, 14, 4, 12);
        context.fillStyle = '#121a27';
        context.fillRect(16, 15, 2, 2);
        context.fillRect(50, 15, 2, 2);
    });
}

function createScannerAsset() {
    return createCanvasAsset(32, 32, function (context) {
        context.clearRect(0, 0, 32, 32);
        context.fillStyle = '#182232';
        context.fillRect(12, 8, 8, 16);
        context.fillStyle = '#30465f';
        context.fillRect(10, 10, 12, 12);
        context.fillStyle = '#0f1624';
        context.fillRect(13, 13, 6, 6);
        context.fillStyle = '#66d9ff';
        context.fillRect(14, 11, 4, 1);
        context.fillRect(14, 19, 4, 1);
        context.fillRect(11, 14, 1, 4);
        context.fillRect(20, 14, 1, 4);
        context.fillStyle = '#ffbf69';
        context.fillRect(15, 15, 2, 2);
        context.fillStyle = '#8398ad';
        context.fillRect(5, 14, 5, 2);
        context.fillRect(22, 14, 5, 2);
        context.fillRect(14, 24, 4, 3);
    });
}

function createDebrisAsset() {
    return createCanvasAsset(24, 24, function (context) {
        context.clearRect(0, 0, 24, 24);
        context.fillStyle = '#6f6760';
        context.fillRect(7, 8, 8, 8);
        context.fillStyle = '#453d38';
        context.fillRect(9, 10, 4, 4);
        context.fillStyle = '#8e837a';
        context.fillRect(10, 7, 2, 2);
        context.fillRect(14, 13, 2, 2);
        context.fillStyle = '#253241';
        context.fillRect(16, 11, 4, 2);
        context.fillStyle = 'rgba(255, 191, 105, 0.8)';
        context.fillRect(5, 16, 1, 1);
    });
}

function createCanvasAsset(width, height, painter) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    if (!context) {
        return {
            width: width,
            height: height,
            dataUrl: '',
        };
    }

    context.imageSmoothingEnabled = false;
    painter(context, width, height);

    return {
        width: width,
        height: height,
        dataUrl: canvas.toDataURL('image/png'),
    };
}

function createSeededRandom(seedOffset) {
    let seed = seedOffset % 2147483647;

    return function () {
        seed = (seed * 48271) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

void initSpaceScene();
