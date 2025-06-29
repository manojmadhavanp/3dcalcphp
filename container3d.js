// container3d.js

const Container3D = (() => {
    
    const usableFactor = 1;
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('textures/wooden-floor.jpg');
    woodTexture.rotation = Math.PI / 2;
    const steelTexture = textureLoader.load('textures/steel.jpeg');
    steelTexture.rotation = Math.PI / 2;
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    steelTexture.wrapS = steelTexture.wrapT = THREE.RepeatWrapping;

    const createContainer = ({
        name, length, width, height,
        doorWidth, doorHeight,
        maxPayload,
        tareWeight,
        loadingTypes,
        floorType,
        category
    }) => {
        const maxVolume = length * width * height;
        return {
            name,
            length,
            width,
            height,
            doorWidth,
            doorHeight,
            maxPayload,
            tareWeight,
            maxVolume,
            usablePayload: maxPayload * usableFactor,
            usableVolume: maxVolume * usableFactor,
            loadingTypes,
            floorType,
            category
        };
    };

    const containers = {
        // General Purpose Containers
        "20ftGPWood": createContainer({
            name: "20ft GP Wooden",
            length: 594.4,
            width: 233.7,
            height: 238.8,
            doorWidth: 231.1,
            doorHeight: 224.5,
            maxPayload: 28200,
            maxVolume: 33076406, // cm³
            tareWeight: 2300,
            loadingTypes: ["front"],
            floorType: "Wooden",
            category: "GP"
        }),
        "20ftGPSteel": createContainer({
            name: "20ft GP Steel",
            length: 594.4,
            width: 233.7,
            height: 238.8,
            doorWidth: 231.1,
            doorHeight: 224.5,
            maxPayload: 29200,
            maxVolume: 33076406,
            tareWeight: 2450,
            loadingTypes: ["front"],
            floorType: "Steel",
            category: "GP"
        }),
        "40ftGPWood": createContainer({
            name: "40ft GP Wooden",
            length: 1203.2,
            width: 233.7,
            height: 238.8,
            doorWidth: 231.1,
            doorHeight: 224.5,
            maxPayload: 26500,
            maxVolume: 67149247,
            tareWeight: 3700,
            loadingTypes: ["front"],
            floorType: "Wooden",
            category: "GP"
        }),
        "40ftGPSteel": createContainer({
            name: "40ft GP Steel",
            length: 1203.2,
            width: 233.7,
            height: 238.8,
            doorWidth: 231.1,
            doorHeight: 224.5,
            maxPayload: 27500,
            maxVolume: 67149247,
            tareWeight: 3850,
            loadingTypes: ["front"],
            floorType: "Steel",
            category: "GP"
        }),

        // High Cube GP
        "40ftHCWood": createContainer({
            name: "40ft HC Wooden",
            length: 1203.2,
            width: 233.7,
            height: 270.0,
            doorWidth: 231.1,
            doorHeight: 259.7,
            maxPayload: 26500,
            maxVolume: 75845784,
            tareWeight: 3850,
            loadingTypes: ["front"],
            floorType: "Wooden",
            category: "OOG"
        }),
        "40ftHCSteel": createContainer({
            name: "40ft HC Steel",
            length: 1203.2,
            width: 243.2,
            height: 270.0,
            doorWidth: 234.0,
            doorHeight: 259.7,
            maxPayload: 27500,
            maxVolume: 79068384,
            tareWeight: 4000,
            loadingTypes: ["front"],
            floorType: "Steel",
            category: "OOG"
        }),

        // Open Top
        "20ftOpenTopWood": createContainer({
            name: "20ft Open Top Wooden",
            length: 590.0,
            width: 235.2,
            height: 239.3,
            doorWidth: 234.0,
            doorHeight: 229.2,
            maxPayload: 28000,
            maxVolume: 33165696,
            tareWeight: 2450,
            loadingTypes: ["top"],
            floorType: "Wooden",
            category: "OOG"
        }),
        "20ftOpenTopSteel": createContainer({
            name: "20ft Open Top Steel",
            length: 590.0,
            width: 235.2,
            height: 239.3,
            doorWidth: 234.0,
            doorHeight: 229.2,
            maxPayload: 28800,
            maxVolume: 33165696,
            tareWeight: 2600,
            loadingTypes: ["top"],
            floorType: "Steel",
            category: "OOG"
        }),
        "40ftOpenTopWood": createContainer({
            name: "40ft Open Top Wooden",
            length: 1203.0,
            width: 235.0,
            height: 238.0,
            doorWidth: 231.0,
            doorHeight: 227.6,
            maxPayload: 26400,
            maxVolume: 67104600,
            tareWeight: 4050,
            loadingTypes: ["top"],
            floorType: "Wooden",
            category: "OOG"
        }),
        "40ftOpenTopSteel": createContainer({
            name: "40ft Open Top Steel",
            length: 1203.0,
            width: 235.0,
            height: 238.0,
            doorWidth: 231.0,
            doorHeight: 227.6,
            maxPayload: 27200,
            maxVolume: 67104600,
            tareWeight: 4200,
            loadingTypes: ["top"],
            floorType: "Steel",
            category: "OOG"
        }),

        // Flat Rack
        "20ftFlatRack": createContainer({
            name: "20ft Flat Rack",
            length: 590.0,
            width: 222.4,
            height: 224.8,
            doorWidth: 0,
            doorHeight: 0,
            maxPayload: 31000,
            maxVolume: 29438752,
            tareWeight: 2500,
            loadingTypes: ["open"],
            floorType: "Steel",
            category: "OOG"
        }),
        "40ftFlatRack": createContainer({
            name: "40ft Flat Rack",
            length: 1165.2,
            width: 222.4,
            height: 224.8,
            doorWidth: 0,
            doorHeight: 0,
            maxPayload: 40000,
            maxVolume: 58248384,
            tareWeight: 5950,
            loadingTypes: ["open"],
            floorType: "Steel",
            category: "OOG"
        })
    };

    const usedColors = new Set();

    const getRandomUniqueColor = () => {
        let color;
        let attempts = 0;
        do {
            color = Math.floor(Math.random() * 0xffffff);
            attempts++;
        } while (usedColors.has(color) && attempts < 100);
        usedColors.add(color);
        return color;
    };

    const getContainerTypes = () => {
        return Object.entries(containers).map(([key, c]) => ({
            key,
            name: c.name,
            floorType: c.floorType,
            label: `${c.name} (${c.floorType})`
        }));
    };

    const getAllContainers = () => {
        return containers;
    }
    const getContainerConfig = (key) => {
        return containers[key] || null;
    };

    const rotateDoor = (degrees) => {
        return (degrees * Math.PI) / 180;
      };

    const drawContainer = (scene, type) => {
        const CSS2DObject = window.CSS2DObject || (window.THREE && window.THREE.CSS2DObject);
        if (!containers[type]) {
            console.warn(`Container type '${type}' not defined.`);
            return;
        }

        const d = containers[type];
        const L = d.length / 100;
        const W = d.width / 100;
        const H = d.height / 100;

        removeContainer(scene); // Clear previous

        const g = new THREE.Group();
        g.name = "containerBox";

        const sideColor = getRandomUniqueColor();
        const floorTex = d.floorType.toLowerCase().includes("steel") ? steelTexture : woodTexture;
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(L / 2, W / 2); // adjust tiling if needed

        const corrugationAmplitude = 0.02;
        const corrugationWaves = 10;

        // Helper: corrugated plane with shadow
        const createCorrugatedPlane = (w, h, color, pos, rot) => {
            const segs = 60;
            const geo = new THREE.PlaneGeometry(w, h, segs, 1);
            const posAttr = geo.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i) + w / 2;
                const offset = Math.sin((x / w) * Math.PI * corrugationWaves) * corrugationAmplitude;
                posAttr.setZ(i, offset);
            }
            geo.computeVertexNormals();
            const mat = new THREE.MeshStandardMaterial({
                color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotation.set(rot.x, rot.y, rot.z);
            return mesh;
        };

        // Corrugated BOTTOM
        g.add(createCorrugatedPlane(L, W, sideColor,
            { x: L / 2, y: 0, z: W / 2 },
            { x: -Math.PI / 2, y: 0, z: 0 }
        ));

        // Flat FLOOR PLATFORM (separate texture for floorType)
        const floorGeo = new THREE.PlaneGeometry(L, W).rotateX(-Math.PI / 2).translate(L / 2, 0.02, W / 2);
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, side: THREE.DoubleSide });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.castShadow = floorMesh.receiveShadow = false;
        g.add(floorMesh);

        // BACK (unless open)
        if (!d.loadingTypes.includes("open")) {
            g.add(createCorrugatedPlane(W, H, sideColor,
                { x: 0, y: H / 2, z: W / 2 },
                { x: 0, y: Math.PI / 2, z: 0 }
            ));
        }

        // FRONT (unless open or has doors)
        if (!d.loadingTypes.includes("front") && !d.loadingTypes.includes("open")) {
            g.add(createCorrugatedPlane(W, H, sideColor,
                { x: L, y: H / 2, z: W / 2 },
                { x: 0, y: -Math.PI / 2, z: 0 }
            ));
        }

        // LEFT & RIGHT walls (unless open)
        if (!d.loadingTypes.includes("open")) {
            g.add(createCorrugatedPlane(L, H, sideColor,
                { x: L / 2, y: H / 2, z: 0 },
                { x: 0, y: 0, z: 0 }
            ));

            g.add(createCorrugatedPlane(L, H, sideColor,
                { x: L / 2, y: H / 2, z: W },
                { x: 0, y: Math.PI, z: 0 }
            ));
        }

        // Corrugated TOP
        if (!d.loadingTypes.includes("top") && !d.loadingTypes.includes("open")) {
            g.add(createCorrugatedPlane(L, W, sideColor,
                { x: L / 2, y: H, z: W / 2 },
                { x: Math.PI / 2, y: 0, z: 0 }
            ));
        }

        // FRONT DOORS
        if (d.loadingTypes.includes("front") && d.doorWidth > 0 && d.doorHeight > 0) {
            const doorH = d.doorHeight / 100;
            const doorW = d.doorWidth / 100;
            const halfW = doorW / 2;
            const verticalOffset = (H - doorH) / 2;

            const doorMat = new THREE.MeshStandardMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            // LEFT DOOR
            const geoLeft = new THREE.PlaneGeometry(halfW, doorH);
            geoLeft.translate(halfW / 2, doorH / 2, 0);
            const leftDoor = new THREE.Mesh(geoLeft, doorMat);
            leftDoor.castShadow = true;
            leftDoor.receiveShadow = true;
            leftDoor.position.set(L + 0.001, verticalOffset, 0);
            leftDoor.rotation.y = THREE.MathUtils.degToRad(45);
            g.add(leftDoor);

            // RIGHT DOOR
            const geoRight = new THREE.PlaneGeometry(halfW, doorH);
            geoRight.translate(-halfW / 2, doorH / 2, 0);
            const rightDoor = new THREE.Mesh(geoRight, doorMat);
            rightDoor.castShadow = true;
            rightDoor.receiveShadow = true;
            rightDoor.position.set(L + 0.001, verticalOffset, W);
            rightDoor.rotation.y = THREE.MathUtils.degToRad(130);
            g.add(rightDoor);
        }

        // 💡 Internal Light
        const internalLight = new THREE.PointLight(0xffffff, 0.9, 5);
        internalLight.position.set(L / 2, H * 0.75, W / 2);
        internalLight.castShadow = true;
        g.add(internalLight);

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'container-label';
        labelDiv.textContent = `${type} - ${d.floorType}`;
        Object.assign(labelDiv.style, {
            background: '#ccc', padding: '4px 8px',
            borderRadius: '4px', fontSize: '12px',
            border: '1px solid #aaa', color: '#000'
        });
        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(L / 2, H + 0.1, W / 2);
        g.add(labelObj);

        scene.add(g);

        return {
            mesh: g,
            dimensions: d
        };
    };
    
      
    const drawContainer5 = (scene, type) => {
        if (!containers[type]) {
            console.warn(`Container type '${type}' not defined.`);
            return;
        }

        const d = containers[type];
        const L = d.length / 100, W = d.width / 100, H = d.height / 100;

        removeContainer(scene);
        const g = new THREE.Group();
        g.name = "containerBox";

        const sideColor = getRandomUniqueColor();
        const floorTex = d.floorType.toLowerCase().includes("steel") ? steelTexture : woodTexture;
        floorTex.repeat.set(L * 2, W * 2);

        const corrAmp = 0.02, corrWaves = 10;
        const createCorrPlane = (w, h, color, pos, rot) => {
            const geo = new THREE.PlaneGeometry(w, h, 60, 1);
            const p = geo.attributes.position;
            for (let i = 0; i < p.count; i++) {
                const x = p.getX(i) + w / 2;
                p.setZ(i, Math.sin((x / w) * Math.PI * corrWaves) * corrAmp);
            }
            geo.computeVertexNormals();
            const mat = new THREE.MeshStandardMaterial({
                color, side: THREE.DoubleSide, transparent: true, opacity: 0.5
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = mesh.receiveShadow = true;
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotation.set(rot.x, rot.y, rot.z);
            return mesh;
        };

        // Corrugated Bottom
        g.add(createCorrPlane(L, W, sideColor, { x: L / 2, y: 0, z: W / 2 }, { x: -Math.PI / 2, y: 0, z: 0 }));

        // Textured Floor Platform
        const floorGeo = new THREE.PlaneGeometry(L, W).rotateX(-Math.PI / 2).translate(L / 2, 0.02, W / 2);
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, side: THREE.DoubleSide });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.castShadow = floorMesh.receiveShadow = true;
        g.add(floorMesh);

        if (!d.loadingTypes.includes("open")) {
            g.add(createCorrPlane(W, H, sideColor, { x: 0, y: H / 2, z: W / 2 }, { x: 0, y: Math.PI / 2, z: 0 }));
        }

        if (!d.loadingTypes.includes("front") && !d.loadingTypes.includes("open")) {
            g.add(createCorrPlane(W, H, sideColor, { x: L, y: H / 2, z: W / 2 }, { x: 0, y: -Math.PI / 2, z: 0 }));
        }

        if (!d.loadingTypes.includes("open")) {
            g.add(createCorrPlane(L, H, sideColor, { x: L / 2, y: H / 2, z: 0 }, { x: 0, y: 0, z: 0 }));
            g.add(createCorrPlane(L, H, sideColor, { x: L / 2, y: H / 2, z: W }, { x: 0, y: Math.PI, z: 0 }));
        }

        if (!d.loadingTypes.includes("top") && !d.loadingTypes.includes("open")) {
            g.add(createCorrPlane(L, W, sideColor, { x: L / 2, y: H, z: W / 2 }, { x: Math.PI / 2, y: 0, z: 0 }));
        }

        if (d.loadingTypes.includes("front") && d.doorWidth > 0 && d.doorHeight > 0) {
            const doorH = d.doorHeight / 100, doorW = d.doorWidth / 100, halfW = doorW / 2;
            const verticalOffset = (H - doorH) / 2;

            const createDoor = (isLeft) => {
                const geo = new THREE.PlaneGeometry(halfW, doorH, 40, 1);
                const p = geo.attributes.position;
                for (let i = 0; i < p.count; i++) {
                    const x = p.getX(i) + (isLeft ? halfW / 2 : -halfW / 2);
                    p.setZ(i, Math.sin((x / doorW) * Math.PI * corrWaves) * corrAmp);
                }
                geo.computeVertexNormals();
                geo.translate(isLeft ? halfW / 2 : -halfW / 2, doorH / 2, 0);
                const mat = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = mesh.receiveShadow = true;
                mesh.position.set(L + 0.001, verticalOffset, isLeft ? 0 : W);
                mesh.rotation.y = THREE.MathUtils.degToRad(isLeft ? 45 : 130);
                return mesh;
            };

            g.add(createDoor(true));
            g.add(createDoor(false));
        }

        const labelDiv = document.createElement('div');
        labelDiv.className = 'container-label';
        labelDiv.textContent = `${type} - ${d.floorType}`;
        Object.assign(labelDiv.style, {
            background: '#ccc', padding: '4px 8px', borderRadius: '4px',
            fontSize: '12px', border: '1px solid #aaa', color: '#000'
        });
        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(L / 2, H + 0.1, W / 2);
        g.add(labelObj);

        // Add Point Light inside the container near the ceiling
        const containerLight = new THREE.PointLight(0xffffff, 1.0, 5); // (color, intensity, distance)
        containerLight.name = 'containerLight';
        containerLight.castShadow = false; // You can enable shadows if needed
        containerLight.position.set(L / 2, H * 0.8, W / 2); // near top-center inside container
        scene.add(containerLight);

        scene.add(g);
        return { mesh: g, dimensions: d };
      };

    const drawContainer4 = (scene, type) => {
        if (!containers[type]) {
            console.warn(`Container type '${type}' not defined.`);
            return;
        }

        const d = containers[type];
        const L = d.length / 100;
        const W = d.width / 100;
        const H = d.height / 100;

        removeContainer(scene);

        const g = new THREE.Group();
        g.name = "containerBox";

        const sideColor = getRandomUniqueColor();
        const floorColor = d.floorType.toLowerCase().includes("steel") ? 0x888888 : 0xdeb887;

        const corrugationAmplitude = 0.02;
        const corrugationWaves = 10;

        const createCorrugatedPlane = (w, h, color, pos, rot) => {
            const segs = 60;
            const geo = new THREE.PlaneGeometry(w, h, segs, 1);
            const posAttr = geo.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i) + w / 2;
                const offset = Math.sin((x / w) * Math.PI * corrugationWaves) * corrugationAmplitude;
                posAttr.setZ(i, offset);
            }
            geo.computeVertexNormals();
            const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotation.set(rot.x, rot.y, rot.z);
            return mesh;
        };

        // BOTTOM
        g.add(createCorrugatedPlane(L, W, sideColor,
            { x: L / 2, y: 0, z: W / 2 }, { x: -Math.PI / 2, y: 0, z: 0 }));

        // FLOOR PLATFORM
        g.add(new THREE.Mesh(
            new THREE.PlaneGeometry(L, W).rotateX(-Math.PI / 2).translate(L / 2, 0.02, W / 2),
            new THREE.MeshStandardMaterial({ color: floorColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
        ));

        if (!d.loadingTypes.includes("open")) {
            // BACK
            g.add(createCorrugatedPlane(W, H, sideColor,
                { x: 0, y: H / 2, z: W / 2 }, { x: 0, y: Math.PI / 2, z: 0 }));
        }

        if (!d.loadingTypes.includes("front") && !d.loadingTypes.includes("open")) {
            // FRONT
            g.add(createCorrugatedPlane(W, H, sideColor,
                { x: L, y: H / 2, z: W / 2 }, { x: 0, y: -Math.PI / 2, z: 0 }));
        }

        if (!d.loadingTypes.includes("open")) {
            // LEFT
            g.add(createCorrugatedPlane(L, H, sideColor,
                { x: L / 2, y: H / 2, z: 0 }, { x: 0, y: 0, z: 0 }));
            // RIGHT
            g.add(createCorrugatedPlane(L, H, sideColor,
                { x: L / 2, y: H / 2, z: W }, { x: 0, y: Math.PI, z: 0 }));
        }

        // TOP
        if (!d.loadingTypes.includes("top") && !d.loadingTypes.includes("open")) {
            g.add(createCorrugatedPlane(L, W, sideColor,
                { x: L / 2, y: H, z: W / 2 }, { x: Math.PI / 2, y: 0, z: 0 }));
        }

        // DOORS
        if (d.loadingTypes.includes("front") && d.doorWidth > 0 && d.doorHeight > 0) {
            const doorH = d.doorHeight / 100;
            const doorW = d.doorWidth / 100;
            const halfW = doorW / 2;
            const verticalOffset = (H - doorH) / 2;

            const createCorrugatedDoor = (isLeft) => {
                const geo = new THREE.PlaneGeometry(halfW, doorH, 40, 1);
                const posAttr = geo.attributes.position;
                for (let i = 0; i < posAttr.count; i++) {
                    const x = posAttr.getX(i) + (isLeft ? halfW / 2 : -halfW / 2);
                    const offset = Math.sin((x / doorW) * Math.PI * corrugationWaves) * corrugationAmplitude;
                    posAttr.setZ(i, offset);
                }
                geo.computeVertexNormals();
                geo.translate(isLeft ? halfW / 2 : -halfW / 2, doorH / 2, 0);

                const mat = new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });

                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.position.set(
                    L + 0.001,
                    verticalOffset,
                    isLeft ? 0 : W
                );
                mesh.rotation.y = THREE.MathUtils.degToRad(isLeft ? 45 : 130);
                return mesh;
            };

            g.add(createCorrugatedDoor(true));  // Left
            g.add(createCorrugatedDoor(false)); // Right
        }

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'container-label';
        labelDiv.textContent = `${type} - ${d.floorType}`;
        Object.assign(labelDiv.style, {
            background: '#ccc', padding: '4px 8px',
            borderRadius: '4px', fontSize: '12px',
            border: '1px solid #aaa', color: '#000'
        });
        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(L / 2, H + 0.1, W / 2);
        g.add(labelObj);

        scene.add(g);

        return {
            mesh: g,
            dimensions: d
        };
    };
      

    const drawContainer3 = (scene, type) => {
        if (!containers[type]) {
            console.warn(`Container type '${type}' not defined.`);
            return;
        }

        const d = containers[type];
        const L = d.length / 100;
        const W = d.width / 100;
        const H = d.height / 100;

        removeContainer(scene); // Clear previous

        const g = new THREE.Group();
        g.name = "containerBox";

        const sideColor = getRandomUniqueColor();
        const floorColor = d.floorType.toLowerCase().includes("steel") ? 0x888888 : 0xdeb887;

        const corrugationAmplitude = 0.02;
        const corrugationWaves = 10;

        // Helper: corrugated side plane
        const createCorrugatedPlane = (w, h, color, pos, rot) => {
            const segs = 60;
            const geo = new THREE.PlaneGeometry(w, h, segs, 1);
            const posAttr = geo.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i) + w / 2;
                const offset = Math.sin((x / w) * Math.PI * corrugationWaves) * corrugationAmplitude;
                posAttr.setZ(i, offset);
            }
            geo.computeVertexNormals();
            const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.rotation.set(rot.x, rot.y, rot.z);
            return mesh;
        };

        // BOTTOM
        g.add(new THREE.Mesh(
            new THREE.PlaneGeometry(L, W).rotateX(-Math.PI / 2).translate(L / 2, 0, W / 2),
            new THREE.MeshStandardMaterial({ color: sideColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
        ));

        // FLOOR PLATFORM
        g.add(new THREE.Mesh(
            new THREE.PlaneGeometry(L, W).rotateX(-Math.PI / 2).translate(L / 2, 0.02, W / 2),
            new THREE.MeshStandardMaterial({ color: floorColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
        ));

        if (!d.loadingTypes.includes("open")){
        // BACK (X = 0)
        g.add(createCorrugatedPlane(W, H, sideColor,
            { x: 0, y: H / 2, z: W / 2 }, { x: 0, y: Math.PI / 2, z: 0 }
        ));
        }

        if (!d.loadingTypes.includes("front") && !d.loadingTypes.includes("open")){ 
        // FRONT (X = L)
        g.add(createCorrugatedPlane(W, H, sideColor,
            { x: L, y: H / 2, z: W / 2 }, { x: 0, y: -Math.PI / 2, z: 0 }
        ));
        }
        if (!d.loadingTypes.includes("open")){
        // LEFT (Z = 0)
        g.add(createCorrugatedPlane(L, H, sideColor,
            { x: L / 2, y: H / 2, z: 0 }, { x: 0, y: 0, z: 0 }
        ));

        // RIGHT (Z = W)
        g.add(createCorrugatedPlane(L, H, sideColor,
            { x: L / 2, y: H / 2, z: W }, { x: 0, y: Math.PI, z: 0 }
        ));
        }

        // TOP
        if (!d.loadingTypes.includes("top") && !d.loadingTypes.includes("open")) {
            g.add(new THREE.Mesh(
                new THREE.PlaneGeometry(L, W).rotateX(Math.PI / 2).translate(L / 2, H, W / 2),
                new THREE.MeshStandardMaterial({ color: sideColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
            ));
        }

        // FRONT DOORS
        if (d.loadingTypes.includes("front") && d.doorWidth > 0 && d.doorHeight > 0) {
            const doorH = d.doorHeight / 100;
            const doorW = d.doorWidth / 100;
            const halfW = doorW / 2;
            const L = d.length / 100;
            const W = d.width / 100;
            const H = d.height / 100
            const verticalOffset = (H - doorH) / 2;

            const doorMat = new THREE.MeshStandardMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            // LEFT DOOR (hinged at front-left)
            const geoLeft = new THREE.PlaneGeometry(halfW, doorH);
            geoLeft.translate(halfW / 2, doorH / 2, 0); // pivot at left edge

            const leftDoor = new THREE.Mesh(geoLeft, doorMat);
            leftDoor.position.set(L + 0.001, verticalOffset, 0); // front-left-bottom
            leftDoor.rotation.y = THREE.MathUtils.degToRad(45); // opens outward
            g.add(leftDoor);

            // RIGHT DOOR (hinged at front-right)
            const geoRight = new THREE.PlaneGeometry(halfW, doorH);
            geoRight.translate(-halfW / 2, doorH / 2, 0); // pivot at right edge

            const rightDoor = new THREE.Mesh(geoRight, doorMat);
            rightDoor.position.set(L + 0.001, verticalOffset, W); // front-right-bottom
            rightDoor.rotation.y = THREE.MathUtils.degToRad(130); // opens outward
            g.add(rightDoor);
        }

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'container-label';
        labelDiv.textContent = `${type} - ${d.floorType}`;
        Object.assign(labelDiv.style, {
            background: '#ccc', padding: '4px 8px',
            borderRadius: '4px', fontSize: '12px',
            border: '1px solid #aaa', color: '#000'
        });
        const labelObj = new THREE.CSS2DObject(labelDiv);
        labelObj.position.set(L / 2, H + 0.1, W / 2);
        g.add(labelObj);

        scene.add(g);

        return {
            mesh: g,
            dimensions: d
        };
      };

    const drawContainer2 = (scene, type) => {
        if (!containers[type]) {
            console.warn(`Container type '${type}' not defined.`);
            return;
        }

        const dims = containers[type];

        // Main container box with translated geometry to align (0,0,0) to front-left-bottom
        const boxGeo = new THREE.BoxGeometry(dims.length / 100, dims.height / 100, dims.width / 100);
        boxGeo.translate(dims.length / 200, dims.height / 200, dims.width / 200);

        const boxMat = new THREE.MeshStandardMaterial({
            color: getRandomUniqueColor(),
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });

        const containerMesh = new THREE.Mesh(boxGeo, boxMat);
        containerMesh.name = "containerBox";
        scene.add(containerMesh);

        // ✅ Add visual floor plane
        const floorGeometry = new THREE.PlaneGeometry(dims.length / 100, dims.width / 100);
        floorGeometry.rotateX(-Math.PI / 2); // horizontal
        floorGeometry.translate(dims.length / 200, 0.005, dims.width / 200);

        const floorMaterial = new THREE.MeshStandardMaterial({
            color: dims.floorType.toLowerCase().includes("steel") ? 0x888888 : 0xdeb887,
            side: THREE.DoubleSide
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        containerMesh.add(floor);

        // ✅ front Doors (if applicable)
        if (dims.doorWidth > 0 && dims.doorHeight > 0 && dims.loadingTypes.includes("front")) {
            const doorH = dims.doorHeight / 100;
            const halfDoorW = (dims.doorWidth / 2) / 100;

            const doorMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });

            const leftDoorGeo = new THREE.PlaneGeometry(halfDoorW, doorH);
            leftDoorGeo.translate(halfDoorW / 2, doorH / 2, 0); // shift origin to left-bottom

            const leftDoor = new THREE.Mesh(leftDoorGeo, doorMaterial);
            leftDoor.position.set(0, 0, 0); // front-left-bottom corner
            leftDoor.rotation.y = rotateDoor(45); // open outward
            containerMesh.add(leftDoor);

            // --- RIGHT DOOR ---
            const rightDoorGeo = new THREE.PlaneGeometry(halfDoorW, doorH);
            rightDoorGeo.translate(-halfDoorW / 2, doorH / 2, 0); // shift origin to right-bottom

            const rightDoor = new THREE.Mesh(rightDoorGeo, doorMaterial);
            rightDoor.position.set(0, 0, dims.width / 100); // front-right-bottom corner
            rightDoor.rotation.y = rotateDoor(130); // open outward
            containerMesh.add(rightDoor);
          }

        // ✅ Label (via CSS2DRenderer)
        const label = document.createElement('div');
        label.className = 'container-label';
        label.textContent = `${type} - ${dims.floorType}`;
        label.style.background = '#cccccc';
        label.style.color = '#000';
        label.style.padding = '4px 8px';
        label.style.fontSize = '12px';
        label.style.borderRadius = '4px';
        label.style.border = '1px solid #aaa';

        const labelObj = new THREE.CSS2DObject(label);
        labelObj.position.set(dims.length / 200, dims.height / 100 + 0.05, dims.width / 200);
        containerMesh.add(labelObj);

        return {
            mesh: containerMesh,
            dimensions: dims
        };
    }; 


    const removeContainer = (scene) => {
        if (!scene) {
            console.warn("Scene not ready when trying to remove container.");
            return;
        }
        const old = scene.getObjectByName("containerBox");
        if (old) {
            old.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
                if (child instanceof THREE.CSS2DObject && child.element?.parentNode) {
                    child.element.parentNode.removeChild(child.element);
                }
            });
            scene.remove(old);
        }
    };

    return {
        drawContainer,
        removeContainer,
        getContainerTypes,
        getAllContainers,
        getContainerConfig
    };
})();
