const Placement3D = (() => {
    let containerModule = null;

    const setContainerModule = (module) => {
        containerModule = module;
    };

    const getContainerConfig = (key) => containerModule.getContainerConfig(key);

    const sortItems = (items) => {
        return {
            SCO: [...items].filter(i => i.width && i.length && i.height).sort((a, b) => b.weight - a.weight),
            OOG: []
        };
    };

    const placeSCO = (items) => {
        const containers = [];
        const cfg = getContainerConfig("20ftGPWood");

        let current = {
            type: "20ftGPWood",
            items: [],
            usedWeight: 0,
            usedVolume: 0
        };

        for (const item of items) {
            const vol = item.width * item.length * item.height;
            if (current.usedWeight + item.weight > cfg.usablePayload || current.usedVolume + vol > cfg.usableVolume) {
                containers.push(current);
                current = {
                    type: "20ftGPWood",
                    items: [],
                    usedWeight: 0,
                    usedVolume: 0
                };
            }
            current.items.push({ ...item });
            current.usedWeight += item.weight;
            current.usedVolume += vol;
        }

        if (current.items.length) containers.push(current);
        return containers;
    };

    const optimizeContainers = (containers) => containers;

    const createSurface = (base) => [{
        x: base.placement.x,
        y: base.placement.y,
        z: base.placement.z + base.height,
        width: base.width,
        length: base.length
    }];

    const subtractSurface = (surface, item) => {
        const remaining = [];
        const sX = surface.x, sY = surface.y, sW = surface.width, sL = surface.length;
        const iX = item.placement.x, iY = item.placement.y, iW = item.width, iL = item.length;
        const itemRight = iX + iW;
        const itemBottom = iY + iL;

        if (iX > sX) {
            remaining.push({ x: sX, y: sY, z: surface.z, width: iX - sX, length: sL });
        }
        if (itemRight < sX + sW) {
            remaining.push({ x: itemRight, y: sY, z: surface.z, width: (sX + sW) - itemRight, length: sL });
        }
        if (iY > sY) {
            remaining.push({ x: sX, y: sY, z: surface.z, width: sW, length: iY - sY });
        }
        if (itemBottom < sY + sL) {
            remaining.push({ x: sX, y: itemBottom, z: surface.z, width: sW, length: (sY + sL) - itemBottom });
        }

        return remaining.filter(s => s.width > 1 && s.length > 1);
    };

    const placeItemsSmart = (container) => {
        const cfg = getContainerConfig(container.type);
        console.debug(`\n📦 Starting placement in container: ${container.type} (ID: ${container.id})`);
        console.debug(`Container dimensions: ${cfg.width}x${cfg.length}x${cfg.height} cm`);

        const placedItems = [];
        const topSurfaces = new Map();
        let currentX = 0, currentY = 0, rowHeight = 0;

        for (const item of container.items) {
            console.debug(`\n➡️ Placing item: ${item.name}`);
            const orientations = item.tiltable ? [
                { w: item.width, l: item.length, h: item.height },
                { w: item.length, l: item.width, h: item.height }
            ] : [
                { w: item.width, l: item.length, h: item.height }
            ];

            let placed = false;

            // Try placing in current row
            for (const o of orientations) {
                if (currentX + o.w <= cfg.width && currentY + o.l <= cfg.length && o.h <= cfg.height) {
                    item.width = o.w; item.length = o.l; item.height = o.h;
                    item.placement = { x: currentX, y: currentY, z: 0, layer: 0, containerId: container.id };
                    placedItems.push(item);
                    if (item.stackable) topSurfaces.set(item, createSurface(item));
                    currentX += o.w;
                    rowHeight = Math.max(rowHeight, o.h);
                    console.debug(`✅ Row-placed at x=${item.placement.x}, y=${item.placement.y}, z=0`);
                    placed = true;
                    break;
                }
            }

            if (placed) continue;

            // Try stacking on top surfaces
            for (const [base, surfaces] of topSurfaces.entries()) {
                if (!base.stackable || base.weight < item.weight) continue;

                for (let si = 0; si < surfaces.length; si++) {
                    const surface = surfaces[si];
                    for (const o of orientations) {
                        if (
                            o.w <= surface.width &&
                            o.l <= surface.length &&
                            surface.z + o.h <= cfg.height
                        ) {
                            item.width = o.w; item.length = o.l; item.height = o.h;
                            item.placement = {
                                x: surface.x,
                                y: surface.y,
                                z: surface.z,
                                layer: 0,
                                containerId: container.id
                            };
                            placedItems.push(item);
                            surfaces.splice(si, 1, ...subtractSurface(surface, item));
                            if (item.stackable) topSurfaces.set(item, createSurface(item));
                            console.debug(`🆙 Stacked on ${base.name} at x=${surface.x}, y=${surface.y}, z=${surface.z}`);
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
                if (placed) break;
            }

            if (placed) continue;

            // Move to new row
            currentY += rowHeight;
            currentX = 0;
            rowHeight = 0;

            for (const o of orientations) {
                if (currentX + o.w <= cfg.width && currentY + o.l <= cfg.length && o.h <= cfg.height) {
                    item.width = o.w; item.length = o.l; item.height = o.h;
                    item.placement = { x: currentX, y: currentY, z: 0, layer: 0, containerId: container.id };
                    placedItems.push(item);
                    if (item.stackable) topSurfaces.set(item, createSurface(item));
                    currentX += o.w;
                    rowHeight = Math.max(rowHeight, o.h);
                    console.debug(`↪️ New-row placed at x=${item.placement.x}, y=${item.placement.y}, z=0`);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: container.id };
                console.warn(`❌ Failed to place item: ${item.name}`);
            }
        }

        return container;
    };

    const computePlacementTightest = (containers) => {
        return containers.map((c, i) => {
            c.id = i;
            return placeItemsSmart(c);
        });
    };

    const runPlacement = (scene, items) => {
        const { SCO } = sortItems(items);
        const sco = placeSCO(SCO);
        const optimized = optimizeContainers(sco);
        return computePlacementTightest(optimized);
    };

    return {
        setContainerModule,
        runPlacement,
        sortItems,
        placeSCO,
        optimizeContainers,
        computePlacementTightest
    };
})();
