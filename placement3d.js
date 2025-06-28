const Placement3D = (() => {
    'use strict';

    /**
     * @file placement3d.js
     * @description Core logic for 3D cargo placement within a container.
     * This module handles item placement, layer management, and stacking rules.
     * It is designed to be used with a Three.js visualizer (e.g., load3d.js)
     * and a container definition module (e.g., container3d.js).
     */

    let ContainerModule; // To store reference to Container3D module

    /**
     * Injects the Container3D module dependency.
     * This must be called before `runPlacement`.
     * @param {object} module - The Container3D module instance.
     */
    function setContainerModule(module) {
        ContainerModule = module;
        if (ContainerModule) {
            console.log("Placement3D: ContainerModule initialized successfully.");
        } else {
            console.error("Placement3D: Failed to initialize ContainerModule. Module is null or undefined.");
        }
    }

    /**
     * Represents a horizontal layer within the container for placement.
     * Each layer has a specific z-coordinate (its base) and a 2D grid representing occupied space.
     */
    class Layer {
        /**
         * Creates an instance of a Layer.
         * @param {number} z - The base z-coordinate of this layer in cm, relative to container floor.
         * @param {number} containerWidth - The internal width of the container in cm.
         * @param {number} containerLength - The internal length of the container in cm.
         * @param {number} [resolution=1] - The grid cell resolution in cm (e.g., 1 for 1cm x 1cm cells).
         */
        constructor(z, containerWidth, containerLength, resolution = 1) {
            this.z = z;
            this.resolution = resolution;
            this.gridWidth = Math.floor(containerWidth / resolution); // Number of cells along X-axis (width)
            this.gridLength = Math.floor(containerLength / resolution); // Number of cells along Y-axis (length)

            /**
             * The 2D occupancy grid for this layer.
             * Dimensions: [gridLength][gridWidth] (i.e., Y then X).
             * Cell values:
             *   0 = Free space.
             *   1 = Occupied by an item placed in this layer.
             *   2 = Occupied by an item projecting upwards from a lower layer.
             * @type {Array<Array<number>>}
             */
            this.occupancyGrid = Array(this.gridLength).fill(null).map(() => Array(this.gridWidth).fill(0));

            console.log(`Layer created at Z=${z}cm, Grid Dimensions: ${this.gridLength} (L) x ${this.gridWidth} (W) cells using ${resolution}cm resolution.`);
        }

        /**
         * Marks a rectangular area on the layer's grid as occupied.
         * Coordinates and dimensions are in cm.
         * @param {number} x - The starting x-coordinate (width-wise) of the area in cm.
         * @param {number} y - The starting y-coordinate (length-wise) of the area in cm.
         * @param {number} itemWidth - The width of the item to mark in cm.
         * @param {number} itemLength - The length of the item to mark in cm.
         * @param {number} [type=1] - The type of occupancy to mark (1 for current layer item, 2 for projection from below).
         */
        markOccupied(x, y, itemWidth, itemLength, type = 1) {
            const startXGrid = Math.floor(x / this.resolution);
            const startYGrid = Math.floor(y / this.resolution);
            const endXGrid = Math.ceil((x + itemWidth) / this.resolution);
            const endYGrid = Math.ceil((y + itemLength) / this.resolution);

            for (let r = startYGrid; r < endYGrid && r < this.gridLength; r++) {
                for (let c = startXGrid; c < endXGrid && c < this.gridWidth; c++) {
                    if (this.occupancyGrid[r] && this.occupancyGrid[r][c] !== undefined) {
                        this.occupancyGrid[r][c] = type;
                    }
                }
            }
        }

        /**
         * Checks if a rectangular area on the layer's grid is free for placement.
         * Coordinates and dimensions are in cm.
         * @param {number} x - The starting x-coordinate (width-wise) of the area in cm.
         * @param {number} y - The starting y-coordinate (length-wise) of the area in cm.
         * @param {number} itemWidth - The width of the item to check for in cm.
         * @param {number} itemLength - The length of the item to check for in cm.
         * @returns {boolean} True if the area is completely free (all cells are 0), false otherwise.
         */
        isAreaFree(x, y, itemWidth, itemLength) {
            const startXGrid = Math.floor(x / this.resolution);
            const startYGrid = Math.floor(y / this.resolution);
            const endXGrid = Math.ceil((x + itemWidth) / this.resolution);
            const endYGrid = Math.ceil((y + itemLength) / this.resolution);

            // Check bounds first
            if (endXGrid > this.gridWidth || endYGrid > this.gridLength) {
                return false; // Item extends beyond container dimensions for this layer
            }

            for (let r = startYGrid; r < endYGrid; r++) {
                for (let c = startXGrid; c < endXGrid; c++) {
                    if (!this.occupancyGrid[r] || this.occupancyGrid[r][c] !== 0) {
                        return false; // Cell is occupied or out of bounds
                    }
                }
            }
            return true;
        }
    }

    /**
     * Performs detailed placement of items into a single specified container.
     * This function contains the core layer-based, grid-managed placement logic.
     * It modifies the items in the `itemsToPlaceInThisContainer` array by adding
     * placement data (if successful) or marking them as unplaced.
     *
     * @param {THREE.Scene} scene - The Three.js scene object for visualization.
     * @param {Array<Object>} itemsToPlaceInThisContainer - An array of item objects assigned to this specific container.
     *                                                    These objects will be mutated with placement details.
     * @param {Object} containerConfig - The configuration object for the container being packed
     *                                   (e.g., from `ContainerModule.getContainerConfig()`).
     * @param {string|number} containerId - Identifier for the current container instance.
     * @returns {void} Modifies `itemsToPlaceInThisContainer` items in place. Visualizes placed items.
     */
    function runPlacement(scene, itemsToPlaceInThisContainer, containerConfig, containerId) {
        console.log(`Placement3D: runPlacementInternal - Starting detailed placement for container ID: ${containerId}, Type: ${containerConfig.name}`);
        console.log("Placement3D: Items to place in this container:", itemsToPlaceInThisContainer);

        if (!ContainerModule) { // Should be set globally, but good practice to check.
            console.error("Placement3D: ContainerModule is not set. Call setContainerModule first.");
            itemsToPlaceInThisContainer.forEach(item => {
                item.placed = false;
                item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: containerId };
            });
            return;
        }
        // containerConfig is now passed as a parameter, no need to fetch it here.
        if (!containerConfig) {
            console.error(`Placement3D: Invalid containerConfig provided to runPlacementInternal for container ID: ${containerId}.`);
            itemsToPlaceInThisContainer.forEach(item => {
                item.placed = false;
                item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: containerId };
            });
            return;
        }

        console.log(`Placement3D: Using container config for ${containerConfig.name} (ID: ${containerId}):`, containerConfig);
        const containerWidth = containerConfig.width;
        const containerLength = containerConfig.length;
        const containerHeight = containerConfig.height;

        // This list will temporarily hold items that are successfully placed in THIS container,
        // primarily for passing to findItemsBelow and determineNextLayerZ, and for drawing.
        // The actual items in itemsToPlaceInThisContainer are mutated for final state.
        const successfullyPlacedItemsInThisContainer = [];

        const layers = []; // Layers specific to this container instance's placement process
        const gridResolution = 1; // 1cm resolution

        // Initialize first layer for this container
        if (layers.length === 0) {
            layers.push(new Layer(0, containerWidth, containerLength, gridResolution));
            console.log(`Placement3D: Initialized first layer (Layer 0) at Z=0 for container ID: ${containerId}.`);
        }

        // Sort items for this container: larger footprint items first, then by height.
        const sortedItemsForThisContainer = [...itemsToPlaceInThisContainer].sort((a, b) => {
            const areaA = a.width * a.length;
            const areaB = b.width * b.length;
            if (areaB !== areaA) {
                return areaB - areaA;
            }
            return b.height - a.height;
        });

        // Process each item from the sorted list for this container
        for (const item of sortedItemsForThisContainer) {
            let itemHasBeenPlaced = false; // Flag for the current item

            // Attempt to place in existing layers
            for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
                const currentLayer = layers[layerIdx];

                if (currentLayer.z + item.height > containerHeight) {
                    console.log(`Placement3D: Item ${item.name} (H:${item.height}) too tall for layer ${layerIdx} (Z:${currentLayer.z}) in container ID: ${containerId}.`);
                    continue;
                }

                for (let yPos = 0; yPos <= containerLength - item.length; yPos += gridResolution) {
                    for (let xPos = 0; xPos <= containerWidth - item.width; xPos += gridResolution) {
                        if (currentLayer.isAreaFree(xPos, yPos, item.width, item.length)) {
                            let canStack = true;
                            if (currentLayer.z > 0) {
                                const itemsBelow = findItemsBelow(xPos, yPos, item.width, item.length, layerIdx, successfullyPlacedItemsInThisContainer, layers);
                                if (itemsBelow.length === 0) {
                                    console.log(`Placement3D: Item ${item.name} at (${xPos},${yPos}) in Layer ${layerIdx} (Z:${currentLayer.z}) has nothing directly below. Stacking check skipped.`);
                                } else {
                                    for (const lowerItem of itemsBelow) {
                                        if (!lowerItem.stackable) {
                                            canStack = false; break;
                                        }
                                        if (item.weight > lowerItem.weight) {
                                            canStack = false; break;
                                        }
                                    }
                                }
                            }
                            if (!canStack) continue;

                            // Update the original item object IN PLACE
                            item.id = `item-${containerId}-${successfullyPlacedItemsInThisContainer.length}`; // Unique ID within this container context
                            item.containerName = containerConfig.name; // Store container name
                            item.containerId = containerId; // Store containerId
                            item.layerIndex = layerIdx;
                            item.x = xPos;
                            item.y = yPos;
                            item.z = currentLayer.z;
                            item.placed = true;
                            // Add to a temporary list of successfully placed items for this run
                            successfullyPlacedItemsInThisContainer.push(item);
                            // Add to the item itself the placement data for the harness
                            item.placement = { x: xPos, y: yPos, z: currentLayer.z, layer: layerIdx, containerId: containerId };


                            currentLayer.markOccupied(xPos, yPos, item.width, item.length, 1);
                            itemHasBeenPlaced = true;
                            console.log(`Placement3D: Placed item ${item.name} (ID: ${item.id}) in container ${containerId} at Layer ${layerIdx} (X:${xPos}, Y:${yPos}, Z:${currentLayer.z})`);
                            break;
                        }
                    }
                    if (itemHasBeenPlaced) break;
                }
                if (itemHasBeenPlaced) break;
            }

            // If not placed, try creating a new layer
            if (!itemHasBeenPlaced) {
                const lastAttemptedLayerZ = layers.length > 0 ? layers[layers.length - 1].z : -1;
                const nextZ = determineNextLayerZ(successfullyPlacedItemsInThisContainer, item, containerHeight, lastAttemptedLayerZ);

                if (nextZ !== null && (nextZ + item.height <= containerHeight)) {
                    console.log(`Placement3D: Creating new Layer ${layers.length} at Z=${nextZ} for item ${item.name} in container ${containerId}.`);
                    const newLayer = new Layer(nextZ, containerWidth, containerLength, gridResolution);
                    projectOccupancyOntoLayer(newLayer, successfullyPlacedItemsInThisContainer, containerHeight);
                    layers.push(newLayer);

                    const currentLayer = newLayer; // The newly added layer
                    const layerIdx = layers.length - 1;

                    if (currentLayer.z + item.height > containerHeight) {
                        console.log(`Placement3D: Item ${item.name} too tall for newly created layer ${layerIdx} in container ${containerId}. This shouldn't happen.`);
                    } else {
                        for (let yPos = 0; yPos <= containerLength - item.length; yPos += gridResolution) {
                            for (let xPos = 0; xPos <= containerWidth - item.width; xPos += gridResolution) {
                                if (currentLayer.isAreaFree(xPos, yPos, item.width, item.length)) {
                                    let canStack = true;
                                    if (currentLayer.z > 0) {
                                        const itemsBelow = findItemsBelow(xPos, yPos, item.width, item.length, layerIdx, successfullyPlacedItemsInThisContainer, layers);
                                        if (itemsBelow.length > 0) {
                                            for (const lowerItem of itemsBelow) {
                                                if (!lowerItem.stackable) { canStack = false; break; }
                                                if (item.weight > lowerItem.weight) { canStack = false; break; }
                                            }
                                        }
                                    }
                                    if (!canStack) continue;

                                    item.id = `item-${containerId}-${successfullyPlacedItemsInThisContainer.length}`;
                                    item.containerName = containerConfig.name;
                                    item.containerId = containerId;
                                    item.layerIndex = layerIdx;
                                    item.x = xPos;
                                    item.y = yPos;
                                    item.z = currentLayer.z;
                                    item.placed = true;
                                    item.placement = { x: xPos, y: yPos, z: currentLayer.z, layer: layerIdx, containerId: containerId };

                                    successfullyPlacedItemsInThisContainer.push(item);
                                    currentLayer.markOccupied(xPos, yPos, item.width, item.length, 1);
                                    itemHasBeenPlaced = true;
                                    console.log(`Placement3D: Placed item ${item.name} (ID: ${item.id}) in container ${containerId} at NEW Layer ${layerIdx} (X:${xPos}, Y:${yPos}, Z:${currentLayer.z})`);
                                    break;
                                }
                            }
                            if (itemHasBeenPlaced) break;
                        }
                    }
                }
            }

            if (!itemHasBeenPlaced) {
                console.log(`Placement3D: Item ${item.name} could not be placed in container ${containerId}.`);
                // Mark the original item object as unplaced for the harness
                item.placed = false;
                item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: containerId };
                // No need to add to a separate unplacedItems list if we mutate in place.
            }
        } // End loop for items in this container

        // itemsToPlaceInThisContainer objects are now updated with placement data or marked unplaced.
        // Visualization:
        // The 'sceneToDrawOn' parameter is introduced to control scene operations.
        // If 'isFirstContainerInBatchClearScene' is true, it means this is the first container
        // in a multi-container batch, so the scene should be cleared. Otherwise, draw cumulatively.
        // This is a temporary fix for multi-container display.
        const sceneToDrawOn = scene; // Use the scene passed to runPlacementInternal

        if (sceneToDrawOn && typeof window.Load3D !== 'undefined' &&
            typeof window.Load3D.clearItems === 'function' &&
            typeof window.Load3D.drawItems === 'function') {

            // Scene clearing is now handled by computePlacementTightest before the loop.
            // We just draw items for the current container.
            // if (isFirstContainerInBatchClearScene && sceneToDrawOn) {
            //     Load3D.clearItems(sceneToDrawOn);
            // }

            if (successfullyPlacedItemsInThisContainer.length > 0) {
                // Load3D.drawItems needs to handle multiple containers potentially by offsetting them
                // or using a more advanced scene graph management. For now, it will draw all at origin.
                Load3D.drawItems(sceneToDrawOn, successfullyPlacedItemsInThisContainer, containerConfig);
            }
        } else {
            if (sceneToDrawOn) { // Only warn if a scene was intended but Load3D is missing/broken
                console.warn("Placement3D: Load3D module or functions not found/incomplete. Skipping visualization for container " + containerId);
            } else {
                console.log("Placement3D: No scene provided. Skipping visualization for container " + containerId);
            }
        }

        console.log(`Placement3D: Detailed placement finished for container ID: ${containerId}. Successfully placed items in this container: ${successfullyPlacedItemsInThisContainer.length}`);
    }

    /**
     * Finds items directly below a given rectangular area in the layer below.
     * @param {number} x - X-coordinate of the area.
     * @param {number} y - Y-coordinate of the area.
     * @param {number} width - Width of the area.
     * @param {number} length - Length of the area.
     * @param {number} currentLayerIndex - Index of the current layer where the new item is being considered.
     * @param {Array<Object>} allPlacedItems - Array of all items already placed.
     * @param {Array<Layer>} layers - Array of all layers.
     * @returns {Array<Object>} List of items from the layer below that are under the given area.
     */
    function findItemsBelow(x, y, width, length, currentLayerIndex, allPlacedItems, layers) {
        if (currentLayerIndex === 0) return []; // No layer below the first layer

        const itemsBelow = [];
        const targetZ = layers[currentLayerIndex].z;

        for (const pItem of allPlacedItems) {
            // Check if the item pItem is in a layer that could be below the current placement spot
            // and its top surface is where the new item would sit.
            if (pItem.z + pItem.height === targetZ) {
                // Check for overlap (simple bounding box collision)
                const overlapX = Math.max(0, Math.min(x + width, pItem.x + pItem.width) - Math.max(x, pItem.x));
                const overlapY = Math.max(0, Math.min(y + length, pItem.y + pItem.length) - Math.max(y, pItem.y));

                if (overlapX > 0 && overlapY > 0) {
                    itemsBelow.push(pItem);
                }
            }
        }
        return itemsBelow;
    }

    /**
     * Determines the Z-coordinate for the next potential placement layer.
     * This function identifies all unique Z-levels formed by the top surfaces of already placed items
     * and the container floor (Z=0). It then selects the lowest Z-level that is:
     * a) higher than the Z-coordinate of the last layer attempted for the current item, and
     * b) can accommodate the height of the `currentItemForPlacement` within the `containerHeight`.
     *
     * @param {Array<Object>} placedItems - An array of all items that have been successfully placed so far.
     *                                      Each item must have `z` (base Z-coordinate) and `height` properties.
     * @param {Object} currentItemForPlacement - The item currently being considered for placement.
     *                                           Must have a `height` property.
     * @param {number} containerHeight - The total internal height of the container in cm.
     * @param {number} lastAttemptedLayerZ - The Z-coordinate of the last layer in which placement
     *                                       for `currentItemForPlacement` was attempted. This ensures progression
     *                                       to higher layers.
     * @returns {number|null} The determined Z-coordinate for the new layer in cm, or `null` if no suitable
     *                        Z-coordinate is found (e.g., item is too tall for remaining space, or no higher valid Z-levels).
     */
    function determineNextLayerZ(placedItems, currentItemForPlacement, containerHeight, lastAttemptedLayerZ) {
        const potentialZCoordinates = new Set([0]); // Always include container floor (Z=0) as a base.

        // Collect top surfaces of all placed items as potential Z-levels for new layers.
        placedItems.forEach(pItem => {
            const topSurfaceZ = pItem.z + pItem.height;
            if (topSurfaceZ < containerHeight) { // Only consider Z-levels within the container height.
                potentialZCoordinates.add(topSurfaceZ);
            }
        });

        const sortedZValues = Array.from(potentialZCoordinates).sort((a, b) => a - b); // Sort Z-levels ascending.

        // Find the first Z-level that meets the criteria.
        for (const zValue of sortedZValues) {
            if (zValue > lastAttemptedLayerZ && (zValue + currentItemForPlacement.height <= containerHeight)) {
                console.log(`Placement3D: Determined next potential layer Z = ${zValue}cm for item ${currentItemForPlacement.name} (H:${currentItemForPlacement.height}cm), which was last attempted at Z=${lastAttemptedLayerZ}cm.`);
                return zValue; // This is a suitable Z for a new layer.
            }
        }

        console.log(`Placement3D: No suitable next Z-coordinate found for item ${currentItemForPlacement.name} (H:${currentItemForPlacement.height}cm) above Z=${lastAttemptedLayerZ}cm within container height ${containerHeight}cm.`);
        return null; // No suitable Z-coordinate found.
    }

    /**
     * Updates the occupancy grid of a new layer by projecting items from lower layers.
     * If an item placed in a previous layer is tall enough to extend into the `newLayer`'s
     * vertical space, its footprint is marked as occupied (type 2) on the `newLayer`'s grid.
     *
     * @param {Layer} newLayer - The newly created layer object whose grid needs to be updated.
     * @param {Array<Object>} allPlacedItems - An array of all items placed in the container so far.
     *                                         Items must have `x, y, z, width, length, height` properties.
     * @param {number} containerHeight - The total internal height of the container (primarily for context in logs).
     */
    function projectOccupancyOntoLayer(newLayer, allPlacedItems, containerHeight) {
        console.log(`Placement3D: Projecting existing item occupancies onto new layer at Z=${newLayer.z}cm.`);
        allPlacedItems.forEach(pItem => {
            // Check if the previously placed item 'pItem' projects into the 'newLayer'.
            // This occurs if pItem's base is below newLayer's base, AND pItem's top is above newLayer's base.
            const pItemTopZ = pItem.z + pItem.height;
            if (pItem.z < newLayer.z && pItemTopZ > newLayer.z) {
                console.log(`Placement3D: Item ${pItem.name} (ID: ${pItem.id}, Z:${pItem.z}cm, H:${pItem.height}cm, TopZ:${pItemTopZ}cm) projects into layer Z=${newLayer.z}cm. Marking its footprint.`);
                newLayer.markOccupied(pItem.x, pItem.y, pItem.width, pItem.length, 2); // Mark as type 2 (projection)
            }
        });
    }

    // --- Orchestration Functions (to be compatible with test harness) ---

    /**
     * Sorts items into categories (e.g., Standard Cargo Operations - SCO, Out of Gauge - OOG).
     * Currently, it categorizes all valid items as SCO and sorts them by weight (descending).
     * OOG handling is not implemented.
     * @param {Array<Object>} items - Array of item objects to sort.
     * @returns {{SCO: Array<Object>, OOG: Array<Object>}} Object containing sorted SCO items and empty OOG items.
     */
    function sortItems(items) {
        console.log("Placement3D: Sorting items...");
        const scoItems = [...items].filter(i => i.width && i.length && i.height) // Basic validation
            .sort((a, b) => b.weight - a.weight); // Sort by weight descending
        console.log(`Placement3D: Found ${scoItems.length} SCO items.`);
        return {
            SCO: scoItems,
            OOG: [] // OOG not handled in this version
        };
    }

    /**
     * Allocates SCO items to one or more containers based on simple weight and volume checks.
     * Uses a default container type ('20ftGPWood') for all allocations.
     * This is a basic allocation and does not perform complex bin packing across multiple containers.
     * @param {Array<Object>} scoItems - Array of SCO items (typically sorted).
     * @returns {Array<Object>} An array of container-like objects, each with:
     *                          `type` (string, e.g., "20ftGPWood"),
     *                          `items` (array of item objects assigned to this container),
     *                          `usedWeight` (total weight of items in this container),
     *                          `usedVolume` (total volume of items in this container),
     *                          `id` (assigned later by computePlacementTightest).
     */
    function placeSCO(scoItems) {
        console.log("Placement3D: Allocating SCO items to containers...");
        const containers = [];
        if (!scoItems || scoItems.length === 0) return containers;

        if (!ContainerModule || !ContainerModule.getContainerConfig) {
            console.error("Placement3D: ContainerModule not properly set for placeSCO. Cannot get container config.");
            // Fallback: return items in a single structure if no container config access
            return [{ type: "unknown", items: scoItems, usedWeight: 0, usedVolume: 0, id: 0 }];
        }

        // Using a default container for this logic, as per user's example structure
        const defaultContainerType = "20ftGPWood";
        const cfg = ContainerModule.getContainerConfig(defaultContainerType);

        if (!cfg) {
            console.error(`Placement3D: Default container type "${defaultContainerType}" config not found for placeSCO.`);
            // Fallback if default container is missing
            return [{ type: defaultContainerType, items: scoItems, usedWeight: 0, usedVolume: 0, id: 0 }];
        }

        let currentContainer = {
            type: defaultContainerType,
            items: [],
            usedWeight: 0,
            usedVolume: 0
            // id will be added later
        };

        for (const item of scoItems) {
            // Ensure item dimensions are valid numbers before calculating volume
            const w = parseFloat(item.width) || 0;
            const l = parseFloat(item.length) || 0;
            const h = parseFloat(item.height) || 0;
            const itemVolume = w * l * h; // Volume in cm³
            const itemWeight = parseFloat(item.weight) || 0;

            // Check if item fits in current container or new one is needed
            if (currentContainer.items.length > 0 && // Ensure it's not the first item for an empty container
                (currentContainer.usedWeight + itemWeight > cfg.usablePayload ||
                    currentContainer.usedVolume + itemVolume > cfg.usableVolume)) {
                containers.push(currentContainer);
                console.log(`Placement3D: Filled container (Weight: ${currentContainer.usedWeight.toFixed(2)}/${cfg.usablePayload}, Volume: ${(currentContainer.usedVolume / 1000000).toFixed(2)}m³ / ${(cfg.usableVolume / 1000000).toFixed(2)}m³). Starting new one.`);
                currentContainer = {
                    type: defaultContainerType,
                    items: [],
                    usedWeight: 0,
                    usedVolume: 0
                };
            }
            currentContainer.items.push({ ...item }); // Add a copy of the item
            currentContainer.usedWeight += itemWeight;
            currentContainer.usedVolume += itemVolume;
        }

        if (currentContainer.items.length > 0) {
            containers.push(currentContainer);
        }
        console.log(`Placement3D: Allocated items into ${containers.length} container(s).`);
        return containers;
    }

    /**
     * Placeholder for optimizing container allocations.
     * Currently, it's a pass-through function.
     * @param {Array<Object>} containers - Array of container objects from placeSCO.
     * @returns {Array<Object>} The same array of containers.
     */
    function optimizeContainers(containers) {
        console.log("Placement3D: optimizeContainers (currently pass-through).");
        return containers; // No optimization implemented yet
    }

    /**
     * Orchestrates the detailed placement of items within each allocated container.
     * It calls the detailed `runPlacementInternal` for each container.
     * @param {Array<Object>} allocatedContainers - An array of container objects from `placeSCO`.
     * @param {THREE.Scene} [scene] - Optional The Three.js scene for visualization. If not provided, visualization calls will be skipped.
     * @returns {Array<Object>} The array of container objects, with items updated with placement data.
     */
    function computePlacementTightest(allocatedContainers, scene) { // scene is now optional
        console.log("Placement3D: Starting computePlacementTightest for allocated containers...");
        const currentScene = scene || (typeof window !== 'undefined' && window.scene) || null; // Attempt to get global scene if not passed

        if (!ContainerModule) {
            console.error("Placement3D: ContainerModule is not set for computePlacementTightest.");
            allocatedContainers.forEach((c, i) => { // Ensure containers have IDs and items default placement
                c.id = i;
                c.items.forEach(item => {
                    item.placed = false;
                    item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: c.id };
                });
            });
            return allocatedContainers;
        }

        // Clear scene once before processing all containers for this batch, if scene is available
        if (currentScene && typeof Load3D !== 'undefined' && Load3D.clearItems) {
            console.log("Placement3D: Clearing scene once before drawing all containers.");
            Load3D.clearItems(currentScene);
        }

        return allocatedContainers.map((container, index) => {
            console.log(`Placement3D: Processing container #${index} of type ${container.type} with ${container.items.length} items.`);
            container.id = index;

            const containerConfig = ContainerModule.getContainerConfig(container.type);
            if (!containerConfig) {
                console.error(`Placement3D: Config not found for container type ${container.type}. Skipping detailed placement for this container.`);
                container.items.forEach(item => {
                    item.placed = false;
                    item.placement = { x: 0, y: 0, z: 0, layer: -1, containerId: container.id };
                });
                return container;
            }

            // runPlacementInternal will modify items in container.items directly
            // and handle its own drawing for the items it places.
            runPlacementInternal(currentScene, container.items, containerConfig, container.id, (index === 0 && allocatedContainers.length > 1));
            // The last boolean indicates if it's the first of multiple containers, to manage scene clearing.
            // This is still a bit crude; a better Load3D would handle object groups by containerId.

            return container;
        });
    }

    // Store the original detailed placement function, which is now correctly adapted.
    const runPlacementInternal = runPlacement;

    // The main runPlacement function called by original index.html (if still used).
    // For now, let's assume the test harness is the primary user of the new functions.
    // If original index.html is still used, it would call this:
    function mainRunPlacement(scene, itemsToPlace) {
        // This function now needs to decide if it's a single container run (like before)
        // or if it should use the new orchestration.
        // For compatibility with the new harness, this might just become a wrapper or be deprecated.
        console.log("Placement3D: Main runPlacement called. Consider using orchestration functions (sortItems, placeSCO, computePlacementTightest) for harness compatibility.");

        // Simplified: assume it's for the currently selected container in a UI
        const containerSelector = document.getElementById('containerSelector');
        const selectedContainerKey = containerSelector ? containerSelector.value : "20ftGPWood"; // Default
        const containerConfig = ContainerModule.getContainerConfig(selectedContainerKey);

        if (!containerConfig) {
            console.error(`Placement3D: Config for ${selectedContainerKey} not found in mainRunPlacement.`);
            return [];
        }
        // The detailed placement function expects all items intended for *this* container.
        return runPlacementInternal(scene, itemsToPlace, containerConfig, 0); // containerId 0 for single run
    }


    // --- Public API of Placement3D module ---
    return {
        setContainerModule,
        runPlacement: mainRunPlacement, // Original entry point
        sortItems,
        placeSCO,
        optimizeContainers,
        computePlacementTightest
        // Note: The Layer class is not exposed publicly as it's an internal implementation detail.
    };

})();

// --- Example Usage (Illustrative - actual integration is in index.html) ---
/*
document.addEventListener('DOMContentLoaded', () => {
    // Assume Container3D and Load3D are loaded and available globally.
    // Assume 'scene' is your THREE.Scene instance.

    if (typeof Placement3D !== 'undefined' && typeof Container3D !== 'undefined') {
        Placement3D.setContainerModule(Container3D);
    } else {
        console.error("Critical: Placement3D or Container3D module not found.");
        return;
    }

    // Example: How CalculateLoad in index.html might use it
    // function CalculateLoad() {
    //     const items = getItemsFromTable(); // Function from index.html to get item data
    //     const selectedContainerKey = document.getElementById('containerSelector').value;
    //     const containerConfig = Container3D.getContainerConfig(selectedContainerKey);
    //
    //     if (!containerConfig) {
    //         console.error("No container config for key:", selectedContainerKey);
    //         return;
    //     }
    //
    //     const placedItemsData = Placement3D.runPlacement(scene, items);
    //     console.log("Final placed items data from Placement3D:", placedItemsData);
    //
    //     if (window.Load3D && placedItemsData) {
    //        Load3D.clearItems(scene); 
    //        if (placedItemsData.length > 0) {
    //            Load3D.drawItems(scene, placedItemsData, containerConfig);
    //        }
    //     }
    // }
});
*/
