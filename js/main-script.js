import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";


////////////////////// JUST TO KNOW THIS THE CHANGE MARK

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, renderer;

var cameras = [];
var currentCamera = 0;
var cam2 = createAuxCamera();
var materials = [];
var flowers = [];
var trees = [];
var house;

// Material switching constants
const LAMBERT_MATERIAL = 0;
const PHONG_MATERIAL = 1;
const TOON_MATERIAL = 2;
const BASIC_MATERIAL = 3;

const WIREFRAME_VALUE = false;

// Current material state
let currMaterial = LAMBERT_MATERIAL;
let currMaterialLightState = true;
let lightState = true;

// Ground and Sky
var ground;
var skyDome;
var bufferTexture;

// Moon
var moon;
var textureLoaderMoon = new THREE.TextureLoader();
var textureMoon = textureLoaderMoon.load('MoonTexture.jpg');
const EMISSIVE = 0xFFFFAA;
const EMISSIVEINTENSITY = 0.3;

// 3D Objects
let ovni;

// OVNI Movement
let clock = new THREE.Clock();                  // relógio para medir delta
let vectorUpdateOvni = new THREE.Vector3();     // vetor reutilizável para direção

let processedToggle = {
    "P": false,
    "S": false,
    "Q": false,
    "W": false,
    "E": false,
    "R": false,
    "D": false,
    "7": false,
    "1": false,
    "2": false
};

let keyStates = {
    "P": false,
    "S": false,
    "Q": false,
    "W": false,
    "E": false,
    "R": false,
    "D": false,
    "7": false,
    "LEFT": false,
    "BACK": false,
    "RIGHT": false,
    "FRONT": false,
    "1": false,
    "2": false
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1313);   

    // Ambient light mais suave para noite
    const ambientLight = new THREE.AmbientLight(0xf9f8d2, 0.2); 
    scene.add(ambientLight);

    ground = createGround();
    skyDome = createSkyDome(0, 0, 0);
    
    // Posição da lua mais adequada (mais alta e visível)
    moon = createMoon(30, 55, -50);

    ovni = createOvni(ovniPositionX, ovniPositionY, ovniPositionZ);
    house = createHouse(HousePositionX, HousePositionY, HousePositionZ);

    trees.push(createTree(50, 0, 10, 0));
    trees.push(createTree(-50, 0, 10, Math.PI/2));
    trees.push(createTree(-45, 0, -60, Math.PI/3));
    trees.push(createTree(40, 0, -35, Math.PI/4));
    trees.forEach(tree => { scene.add(tree); });

    scene.add(ground);
    scene.add(skyDome);
    scene.add(moon);
    scene.add(ovni);
    scene.add(house);

    scene.position.z = -50;

    return scene;
}

// Criar textura para campo
function generateGrass(){

    var grass = new THREE.Scene();

    bufferTexture = new THREE.WebGLRenderTarget(1600, 1600, 
        {magFilter: THREE.nearestFilter,
        wrapS: THREE.RepeatWrapping, 
        wrapT: THREE.RepeatWrapping});


    grass.background = new THREE.Color(0xC1E685);
    const geometry = new THREE.CylinderGeometry(2,2,2,20);

    for( let i = 0 ; i < 2500; i ++){
        const cil = new THREE.Mesh(geometry, flowers[Math.floor(Math.random()*4)]);
        cil.position.set((Math.random() - 0.5)*800, 0,(Math.random() - 0.5)*800);
        grass.add(cil);
    }

    
    renderer.setRenderTarget(bufferTexture);
    renderer.render(grass,cam2);
    renderer.setSize(window.innerWidth, window.innerHeight); //Tamanho da janela
    renderer.setRenderTarget(null); //renderizar para ecra


    bufferTexture.texture.repeat.set(4,4); //repetir 4 vezes
    ground.material.map = bufferTexture.texture;
    ground.material.needsUpdate = true; //atualizar as alteracoes
}

// Criar cores gradientes
function gradientPlane(){
    const width = 800;
    const height = 800;
    const widthSeg = 1;
    const heightSeg = 20; // Dividir vertical em 20 "linhas"

    let planeGeo = new THREE.PlaneGeometry(width, height, widthSeg, heightSeg);

    const color = new THREE.Color(0x5D3FD3)
    const color_final = new THREE.Color(0xBF40BF)
    const colors = []

    const dif_r = (color_final.r - color.r)/heightSeg;
    const dif_g = (color_final.g - color.g)/heightSeg;
    const dif_b = (color_final.b - color.b)/heightSeg;

    // Passa de azul para roxo
    for (let y = 0; y <= heightSeg; y++) {
        color.setRGB(color.r + dif_r, color.g + dif_g, color.b + dif_b);
        for (let x = 0; x <= widthSeg; x++) {
          colors.push(color.r, color.g, color.b);
        }
      }

    planeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true // Uso de cores por vertice
    })
    const gradientPlane = new THREE.Mesh(planeGeo, planeMat);
    gradientPlane.rotation.x = -Math.PI/2;
    return gradientPlane;

}

// Criar textura para ceu
function createSkyTexture(){
    var sky = new THREE.Scene();

    var bufferTexture = new THREE.WebGLRenderTarget(800, 800, 
        {magFilter: THREE.nearestFilter, 
        wrapS: THREE.RepeatWrapping, 
        wrapT: THREE.RepeatWrapping});
    
    sky.background = new THREE.Color(0x005555);
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 20);

    sky.add(gradientPlane());
    
    for( let i = 0 ; i < 2500; i++){
        const cil = new THREE.Mesh(geometry, flowers[0]);
        cil.position.set((Math.random() - 0.5)*800, 0 ,(Math.random() - 0.5)*800);
        sky.add(cil);
    }

    renderer.setRenderTarget(bufferTexture);
    renderer.render(sky,cam2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setRenderTarget(null);

    skyDome.material.map = bufferTexture.texture;
    skyDome.material.map.repeat.set(4,1);
    skyDome.material.needsUpdate = true;
    
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    const aspect = window.innerWidth / window.innerHeight;

    // Camera 0: Original perspective camera
    const cameraPerspectiva = new THREE.PerspectiveCamera(70, aspect, 1, 2000);
    cameraPerspectiva.position.set(60, 50, 75);
    // cameraPerspectiva.position.set(100, 250, 200); // Para mostrar que a terra e redonda
    cameraPerspectiva.lookAt(scene.position);
    cameras.push(cameraPerspectiva);

    // Camera 1: activated with key '7'
    const cameraOverview = new THREE.PerspectiveCamera(60, aspect, 1, 5000);
    cameraOverview.position.set(0, 2, 100);
    cameraOverview.lookAt(scene.position);
    cameras.push(cameraOverview);
}

// Camara auxiliar para texturas
function createAuxCamera(){
    var newCam = new THREE.OrthographicCamera(-800/2, 800/2, 800/2, -800/2, 1, 1000);
    newCam.position.set(0, 100, 0);
    newCam.lookAt(0, 0, 0);

    return newCam;  
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createPointLight(x, y, z) {
    let light = new THREE.PointLight(pointLightColor, pointLightIntensity, pointLightDistance, pointLightDecay);
    light.position.set(x, y, z);
    return light;
}

function createSpotLight(x, y, z) {
    let light = new THREE.SpotLight(spotLightColor, spotLightIntensity, spotLightDistance, spotLightAngle, spotLightPenumbra, spotLightDecay);
    light.position.set(x, y, z);
    return light;
}

function createSpotLightTarget(light) {
    light.target.position.set(0, -0.1, 0);
    return light.target;
}

// Moon
function createDirectionalLight(x, y, z) {
    let light = new THREE.DirectionalLight(0xFBFEAA, 0.5);
    light.position.set(x, y, z);
    light.target.position.set(0, 0, 0);
    return light;
}

////////////////////////
/* MATERIAL FUNCTIONS */
////////////////////////
function changeSceneMaterials(newMaterial) {
    if (!lightState) {
        changeMaterials(BASIC_MATERIAL);
    } else {
        changeMaterials(newMaterial);
    }
    currMaterialLightState = lightState;
}

function changeMaterials(materialRequest) { 
    // Always allow changes when switching to/from BASIC_MATERIAL or when lighting state changes
    if (currMaterial == materialRequest && materialRequest != BASIC_MATERIAL && currMaterialLightState == lightState) return;

    // Update OVNI materials
    ovni.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material = createNewMaterial(materialRequest, node.material);
        }
    });

    // Update House materials
    house.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material = createNewMaterial(materialRequest, node.material);
        }
    });

    // Update Trees materials
    trees.forEach(tree => {
        tree.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
                node.material = createNewMaterial(materialRequest, node.material);
            }
        });
    });

    moon.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
            node.material = changeMoonMaterial(materialRequest, node.material);
        }
    });

    // Only update currMaterial if we're not using BASIC_MATERIAL (lighting off)
    if (materialRequest != BASIC_MATERIAL) {
        currMaterial = materialRequest;
    }
}

function createNewMaterial(materialRequest, currMaterial) {
    var material;

    switch (materialRequest) {
        case LAMBERT_MATERIAL:
            material = new THREE.MeshLambertMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE 
            }); 
            break;
        case PHONG_MATERIAL:
            material = new THREE.MeshPhongMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE,
                shininess: 100
            }); 
            break;
        case TOON_MATERIAL: 
            material = new THREE.MeshToonMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE
            }); 
            break;
        case BASIC_MATERIAL: 
            material = new THREE.MeshBasicMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE
            }); 
            break;
    }

    return material;
}

function changeMoonMaterial(materialRequest, currMaterial){

    switch (materialRequest) {
        case LAMBERT_MATERIAL:
            return  new THREE.MeshLambertMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE, 
                emissive: EMISSIVE, 
                emissiveIntensity: EMISSIVEINTENSITY,
                map: textureMoon
            }); 

        case PHONG_MATERIAL:
            return new THREE.MeshPhongMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE, 
                emissive: EMISSIVE, 
                emissiveIntensity: EMISSIVEINTENSITY,
                map: textureMoon
            }); 

        case TOON_MATERIAL: 
            return new THREE.MeshToonMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE, 
                map: textureMoon
            }); 

        case BASIC_MATERIAL: 
            return new THREE.MeshBasicMaterial({ 
                color: currMaterial.color,
                wireframe: WIREFRAME_VALUE, 
                map: textureMoon
            }); 
    }

}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createMaterials() {
    // 0 - Material para tronco e ramo (castanho-alaranjado) - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0x964B00, wireframe: false }));
    // 1 - Material para a copa (verde-escuro) - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0x00DD00, wireframe: false }));

    //********************** OVNI **********************//
    // 2 - Ovni cockpit - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0x00AAEE, wireframe: false }));
    // 3 - Ovni body - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0x00FFAA, wireframe: false }));
    // 4 - Ovni cylinder - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0xFFAA00, wireframe: false }));
    // 5 - Ovni sphere - Lambert por padrão
    materials.push(new THREE.MeshLambertMaterial({ color: 0xFF0000, wireframe: false }));

    //********************** Flowers and Stars **********************//
    // 0 - blank - flowers and stars
    flowers.push(new THREE.MeshBasicMaterial({ color: 0xFFFFFF })); 
    // 1 - yellow - flowers
    flowers.push(new THREE.MeshBasicMaterial({ color: 0xFFFF00 }));
    // 2 - violet - flowers
    flowers.push(new THREE.MeshBasicMaterial({ color: 0xC8A2C8 }));
    // 3 - blue - flowers
    flowers.push(new THREE.MeshBasicMaterial({ color: 0xADD8E6 }));
}

//////////
/* TREE */
//////////
function createTree(x, y, z, alpha) {
    var tree = new THREE.Object3D();
    var trunk1, trunk2, trunk3;
    var leaves1, leaves2, leaves3;

    trunk1 = createTrunk1(trunk_1_CylinderPositionX, trunk_1_CylinderPositionY, trunk_1_CylinderPositionZ);
    trunk2 = createTrunk2(trunk_2_CylinderPositionX, trunk_2_CylinderPositionY, trunk_2_CylinderPositionZ);
    trunk3 = createTrunk3(trunk_3_CylinderPositionX, trunk_3_CylinderPositionY, trunk_3_CylinderPositionZ);

    leaves1 = createLeaves(leaveSphere_1_PositionX, leaveSphere_1_PositionY, leaveSphere_1_PositionZ);
    leaves2 = createLeaves(leaveSphere_2_PositionX, leaveSphere_2_PositionY, leaveSphere_2_PositionZ);
    leaves3 = createLeaves(leaveSphere_3_PositionX, leaveSphere_3_PositionY, leaveSphere_3_PositionZ);

    tree.add(trunk1); 
    tree.add(trunk2);
    tree.add(trunk3);
    leaves1.rotation.set(0, 0, Math.PI/4);
    tree.add(leaves1);
    tree.add(leaves2);
    tree.add(leaves3);

    const scale = 0.7 + Math.random()/3;
    tree.scale.set(scale, scale, scale);

    //tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(x, y, z);

    tree.rotation.y += alpha;
    // add some rotation for tree em relação a referencial x e z

    return tree;
}

function createTrunk1(x, y, z) {
    var geometry = new THREE.CylinderGeometry(trunkCylinderRadius, trunkCylinderRadius, trunkCylinderHeight, 6);

    let mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.scale.set(2, 24, 2);
    mesh.position.set(x, y, z);

    return mesh;
}

function createTrunk2(x, y, z) {
    var geometry = new THREE.CylinderGeometry(trunkCylinderRadius, trunkCylinderRadius, trunkCylinderHeight, 6);

    let mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.set(0, 0, Math.PI/4);
    mesh.scale.set(2, 14, 2);
    mesh.position.set(x, y, z);

    return mesh;
}

function createTrunk3(x, y, z) {
    var geometry = new THREE.CylinderGeometry(trunkCylinderRadius, trunkCylinderRadius, trunkCylinderHeight, 6);

    let mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.set(0, 0, -Math.PI/4);
    mesh.scale.set(2, 8, 2);
    mesh.position.set(x, y, z);

    return mesh;
}

function createLeaves(x, y, z) {
    var geometry = new THREE.SphereGeometry(leaveSphereRadius, 16, 16);
    var leaves = new THREE.Mesh(geometry, materials[1]);

    leaves.scale.set(leaveSphereScaleX, leaveSphereScaleY, leaveSphereScaleZ);
    leaves.position.set(x, y, z);

    return leaves;
}

///////////
/* HOUSE */
///////////
function createHouse(x, y, z) {
    var house = new THREE.Object3D();

    var rightWall = createRightLateralWall(RightLateralWallPositionX, RightLateralWallPositionY, RightLateralWallPositionZ);
    var leftWall = createLeftLateralWall(LeftLateralWallPositionX, LeftLateralWallPositionY, LeftLateralWallPositionZ);
    var backWall = createBackWall(BackWallPositionX, BackWallPositionY, BackWallPositionZ);
    var frontWall = createFrontWall(FrontWallPositionX, FrontWallPositionY, FrontWallPositionZ);
    var window1 = createWindow(Window_1_PositionX, Window_1_PositionY, Window_1_PositionZ);
    var window2 = createWindow(Window_2_PositionX, Window_2_PositionY, Window_2_PositionZ);
    var door = createDoor(DoorPositionX, DoorPositionY, DoorPositionZ);
    var roof = createRoof(RoofPositionX, RoofPositionY, RoofPositionZ);
    var chimney = createChimney(ChimneyPositionX, ChimneyPositionY, ChimneyPositionZ);

    house.add(rightWall);
    house.add(leftWall);
    house.add(backWall);
    house.add(frontWall);
    house.add(window1);
    house.add(window2);
    house.add(door);
    house.add(roof);
    house.add(chimney);

    var box = new THREE.Box3().setFromObject(house);
    var height = box.max.y - box.min.y;
    var minY = box.min.y;

    console.log("Altura da casa:", height);
    console.log("Mínimo Y:", minY);

    house.position.set(x, y - minY, z); // Alinha a base da casa ao chão
    house.scale.set(1.5, 1.5, 1.5);
    //house.rotateY(Math.PI/4);
    return house;
}


function createRightLateralWall(x, y, z) {
    const vertices = new Float32Array([
        0,4.5,5,   0,4.5,-5,     //top points
        0,-4.5,5,   0,-4.5,-5   //bottom points
    ]);

    const indicesOfFaces = [
        0,2,1,  	1,2,3
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();

    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);

    return wall; 
}

function createLeftLateralWall(x, y, z) {
    const vertices = new Float32Array([
        0,4.5,5,   0,4.5,-5,     //top points
        0,-4.5,5,   0,-4.5,-5   //bottom points
    ]);

    const indicesOfFaces = [
        0,1,2,  	1,3,2
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();

    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);

    return wall; 
}

function createBackWall(x, y, z) {
    const vertices = new Float32Array([
        -10,4.5,0,   10,4.5,0,     //top points
        -10,-4.5,0,   10,-4.5,0   //bottom points
    ]);

    const indicesOfFaces = [
        0,1,2,  	1,3,2
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);

    return wall; 
}

function createFrontWall(x, y, z) {
    const vertices = new Float32Array([
        -10,4.5,0,   -8,4.5,0,    //top points    - component 1
        -10,-4.5,0,  -8,-4.5,0,   //bottom points - component 1

        -8,4.5,0,    -4,4.5,0,    //top points    - component 2: top
        -8,1.5,0,    -4,1.5,0,    //bottom points - component 2: top

        -8,-1.5,0,   -4,-1.5,0,   //top points    - component 2: bottom
        -8,-4.5,0,   -4,-4.5,0,   //bottom points - component 2: bottom

        -4,4.5,0,    -2,4.5,0,    //top points    - component 3
        -4,-4.5,0,   -2,-4.5,0,   //bottom points - component 3

        -2,4.5,0,    2,4.5,0,     //top points    - component 4
        -2,1.5,0,    2,1.5,0,     //bottom points - component 4
        
        2,4.5,0,     4,4.5,0,     //top points    - component 5
        2,-4.5,0,    4,-4.5,0,    //bottom points - component 5

        4,4.5,0,     8,4.5,0,     //top points    - component 6: top
        4,1.5,0,     8,1.5,0,     //bottom points - component 6: top

        4,-1.5,0,    8,-1.5,0,    //top points    - component 6: bottom
        4,-4.5,0,    8,-4.5,0,    //bottom points - component 6: bottom

        8,4.5,0,    10,4.5,0,     //top points    - component 7
        8,-4.5,0,   10,-4.5,0    //bottom points - component 7
    ]);

    const indicesOfFaces = [
        0,2,1,  	1,2,3,           //C1
        4,6,5,  	5,6,7,           //C2
        8,10,9,  	9,10,11,         //C2
        12,14,13,  	13,14,15,        //C3
        16,18,17,  	17,18,19,        //C4
        20,22,21,  	21,22,23,        //C5
        24,26,25,  	25,26,27,        //C6
        28,30,29,  	29,30,31,        //C6
        32,34,33,  	33,34,35         //C7
    ];

    var material = new THREE.MeshLambertMaterial({color: 0xCCCCCC, wireframe: WIREFRAME_VALUE});
    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, y, z);

    return wall; 
}

function createWindow(x, y, z) {
    const vertices = new Float32Array([
        -2,1.5,0,   2,1.5,0,     //top points
        -2,-1.5,0,   2,-1.5,0   //bottom points
    ]);

    const indicesOfFaces = [
        0,2,1,  	1,2,3
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0x69E1F9, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var window = new THREE.Mesh(geometry, material);
    window.position.set(x, y, z);

    return window;
}

function createDoor(x, y, z) {
    const vertices = new Float32Array([
        -2,3,0,   2,3,0,     //top points
        -2,-3,0,   2,-3,0   //bottom points
    ]);

    const indicesOfFaces = [
        0,2,1,  	1,2,3
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0x964B00, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var door = new THREE.Mesh(geometry, material);
    door.position.set(x, y, z);

    return door;
}

function createRoof(x, y, z) {
    const vertices = new Float32Array([
        -10,1.5,0,   10,1.5,0,                                  //top points
        -10,-1.5,5, 10,-1.5,5,  -10,-1.5,-5,    10,-1.5,-5      //bottom points
    ]);

    const indicesOfFaces = [
        0,4,2,  1,3,5,      //lateral faces
        0,2,1,  1,2,3,      //front face
        0,1,4,  1,5,4       //back face  
    ];

    var material = new THREE.MeshLambertMaterial({ color: 0xFA8B4B, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BufferGeometry();
    
    geometry.setIndex(indicesOfFaces);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    geometry.normalizeNormals();

    var roof = new THREE.Mesh(geometry, material);
    roof.position.set(x, y, z);

    return roof; 
}

function createChimney(x, y, z) {
    'use strict';

    var chimney;

    var material = new THREE.MeshLambertMaterial({ color: 0x226644, wireframe: WIREFRAME_VALUE });
    var geometry = new THREE.BoxGeometry(1, 1, 1);

    chimney = new THREE.Mesh(geometry, material);
    chimney.position.set(x, y, z);

    chimney.scale.set(3, 6, 4);

    return chimney;
}


//////////
/* OVNI */
//////////
function createOvni(x, y, z) {
    var ovni = new THREE.Object3D();
    var ovniCockpit, ovniBody, ovniCylinder, ovniSpheres;

    ovniCockpit = createOvniCockpit(cockpitPositionX, cockpitPositionY, cockpitPositionZ);
    ovniBody = createOvniBody(bodyPositionX, bodyPositionY, bodyPositionZ);
    ovniCylinder = createOvniCylinderLight(cylinderPositionX, cylinderPositionY, cylinderPositionZ);
    ovniSpheres = createOvniSpheresLight(spherePositionX, spherePositionY, spherePositionZ);

    ovni.add(ovniCockpit);
    ovni.add(ovniBody);
    ovni.add(ovniCylinder);
    ovni.add(ovniSpheres);
    
    ovni.scale.set(ovniScaleX, ovniScaleY, ovniScaleZ);
    ovni.position.set(x, y, z);

    return ovni;
}

function createOvniCockpit(x, y, z) {
    var geometry = new THREE.SphereGeometry(cockpitRadius, 16, 16);
    var material = materials[2];
    var cockpit = new THREE.Mesh(geometry, material);

    cockpit.scale.set(cockpitScaleX, cockpitScaleY, cockpitScaleZ);
    cockpit.position.set(x, y, z);

    return cockpit;
}

function createOvniBody(x, y, z) {
    var geometry = new THREE.SphereGeometry(bodyRadius, 16, 16);
    var material = materials[3];
    var body = new THREE.Mesh(geometry, material);

    body.scale.set(bodyScaleX, bodyScaleY, bodyScaleZ);
    body.position.set(x, y, z);

    return body;
}

function createOvniCylinderLight(x, y, z) {
    var cylinder = new THREE.Object3D();
    var geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 16);
    var material = materials[4];
    var mesh = new THREE.Mesh(geometry, material);

    cylinder.add(mesh);

    cylinder.scale.set(cylinderScaleX, cylinderScaleY, cylinderScaleZ);
    cylinder.position.set(x, y, z);

    var light = createSpotLight(0, 0, 0);
    light.name = "ovniSpotLight";
    var lightTarget = createSpotLightTarget(light);

    cylinder.add(light);
    cylinder.add(lightTarget);

    return cylinder;
}

function createOvniSpheresLight(x, y, z) {
    const spheres = new THREE.Object3D();

    for (let i = 0; i < sphereNumber; i++) {
        const angle = (2 * Math.PI * i) / sphereNumber;
        const xPos = Math.cos(angle) * sphereDist;
        const zPos = Math.sin(angle) * sphereDist;

        const sphereWithLight = createSphereLight(xPos, 0, zPos, i);
        spheres.add(sphereWithLight);
    }

    spheres.position.set(x, y, z);

    return spheres;
}

function createSphereLight(x, y, z, index) {
    const sphere = new THREE.Object3D();
    sphere.name = 'ovniSphere_${index}';
    
    const geometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
    const material = materials[5];
    const mesh = new THREE.Mesh(geometry, material);
    sphere.add(mesh);
    
    const light = createPointLight(0, -2, 0);
    light.name = "ovniPointLight_" + index;
    sphere.add(light);
    
    sphere.scale.set(sphereScaleX, sphereScaleY, sphereScaleZ);
    sphere.position.set(x, y, z);

    return sphere;
}

///////////////////////////
/* GROUND, SKYDOME, MOON */
///////////////////////////

// ground
function createGround() {
    // Cria a geometria do terreno com alta subdivisão (necessário para displacement map)
    const groundGeometry = new THREE.PlaneGeometry(800, 800, 500, 500);

    // Carrega o heightmap
    const disMap = new THREE.TextureLoader().load('heightmap_opc (1).png');
    disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;

    // Cria o material com mapa de relevo
    const groundMat = new THREE.MeshPhongMaterial({
        color: 0x88A04B, // opcional: dá cor básica ao terreno
        displacementMap: disMap,
        displacementScale: 850,   // define a altura máxima do relevo
        displacementBias: -192  // desloca o relevo para baixo (base alinhada ao chão)
    });

    // Cria o mesh com geometria + material
    const groundMesh = new THREE.Mesh(groundGeometry, groundMat);
    groundMesh.rotation.x = -Math.PI / 2; // rotaciona para o plano XZ (horizontal)
    groundMesh.position.y = 0;            // garante que está no nível do chão
    groundMesh.receiveShadow = true;

    return groundMesh;
}


// skydome
function createSkyDome(x, y, z){
    var skyGeo = new THREE.SphereGeometry(400, 32, 32 ); 

    const material = new THREE.MeshPhongMaterial(); 
    var mesh = new THREE.Mesh(skyGeo, material); 
    mesh.material.side = THREE.BackSide;
    mesh.position.set(x, y, z);
    mesh.rotation.z = Math.PI/2;

    return mesh;
}

// moon
function createMoon(x, y, z) {
    var moon = new THREE.Object3D();

    // Material da lua com emissão própria
    var material = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFAA,
        wireframe: WIREFRAME_VALUE, 
        emissive: EMISSIVE, 
        emissiveIntensity: EMISSIVEINTENSITY,
        map: textureMoon ,
    });

    var geometry = new THREE.SphereGeometry(1, 16, 16);
    var mesh = new THREE.Mesh(geometry, material);

    moon.add(mesh);
    moon.scale.set(9, 9, 9);
    moon.position.set(x, y, z);

    var light = createDirectionalLight(0, 0, 0);
    light.target.position.set(0, 0, 0);
    moon.add(light);

    return moon;
}

////////////
/* UPDATE */
////////////
function update() {
    const delta = clock.getDelta();
    
    rotateOvni(delta);
    updateOvni(delta);

    checkToggleLights();
    checkMaterialSwitching();
    checkCameraSwitch();
    changeTexture();
    checkToggleMoonLight();
}

///////////////////
/* Ovni Moviment */
///////////////////
function rotateOvni(delta) {
    if(ovni) {
        ovni.rotation.y += ovniRotationSpeed * delta;
    }
}

function updateOvni(delta) {
    if (ovni) {
        // reset vetor direção
        vectorUpdateOvni.set(0, 0, 0);  

        // Preenche vetor direção baseado nas teclas pressionadas
        if(keyStates["LEFT"]) {
            vectorUpdateOvni.x -= 1;
        }
        if(keyStates["BACK"]) {
            vectorUpdateOvni.z -= 1;
        }
        if(keyStates["RIGHT"]) {
            vectorUpdateOvni.x += 1;
        }
        if(keyStates["FRONT"]) {
            vectorUpdateOvni.z += 1;
        }

        if (vectorUpdateOvni.length() > 0) {
            vectorUpdateOvni.normalize();
            vectorUpdateOvni.multiplyScalar(ovniMovementSpeed * delta);
            ovni.position.add(vectorUpdateOvni);
        }
    }
}

///////////////////////////////
/* COMMAND 7 - change camera */
///////////////////////////////
function checkCameraSwitch() {
    if (keyStates["7"] && !processedToggle["7"]) {
        // Toggle between camera 0 and camera 1 (overview)
        currentCamera = currentCamera === 0 ? 1 : 0;
        processedToggle["7"] = true;
    }
}


/////////////////////////////////////////
/* COMMAND Q & W & E - change material */
/////////////////////////////////////////
function checkMaterialSwitching() {
    // Check for material switching
    if (keyStates["Q"] && !processedToggle["Q"]) {
        changeSceneMaterials(LAMBERT_MATERIAL);
        processedToggle["Q"] = true;
    }
    
    if (keyStates["W"] && !processedToggle["W"]) {
        changeSceneMaterials(PHONG_MATERIAL);
        processedToggle["W"] = true;
    }
    
    if (keyStates["E"] && !processedToggle["E"]) {
        changeSceneMaterials(TOON_MATERIAL);
        processedToggle["E"] = true;
    }
    
    if (keyStates["R"] && !processedToggle["R"]) {
        lightState = !lightState;
        changeSceneMaterials(currMaterial);
        processedToggle["R"] = true;
    }
}


////////////////////////////////////////
/* COMMAND P & S - change ovni lights */
////////////////////////////////////////
function checkToggleLights() {
    checkTogglePointLights();
    checkToggleSpotLight();
}

function checkTogglePointLights() {
    if (keyStates["P"] && !processedToggle["P"]) {
        ovni.traverse((child) => {
            if (child instanceof THREE.PointLight && child.name && child.name.startsWith("ovniPointLight_")) {
                child.visible = !child.visible;
            }
        });
        processedToggle["P"] = true;
    }
}

function checkToggleSpotLight() {
    if (keyStates["S"] && !processedToggle["S"]) {
        ovni.traverse((child) => {
            if (child instanceof THREE.SpotLight && child.name === "ovniSpotLight") {
                child.visible = !child.visible;
            }
        });
        processedToggle["S"] = true;
    }
}

///////////////////
/* COMMAND 1 & 2 */
///////////////////
function changeTexture(){
    if(keyStates["1"] && !processedToggle["1"]){
        generateGrass();
        processedToggle["1"] = true;
    }
    if(keyStates["2"] && !processedToggle["2"]){
        createSkyTexture();
        processedToggle["2"] = true;
    }
}

///////////////////////////
/* COMMAND D - Moon Light*/
///////////////////////////
function checkToggleMoonLight() {
    if (keyStates["D"] && !processedToggle["D"]) {
        moon.traverse((child) => {
            if (child instanceof THREE.DirectionalLight) {
                child.visible = !child.visible;
            }
        });
        processedToggle["D"] = true;
    }
}


/////////////
/* DISPLAY */
/////////////
function render() {
    // WebXR gerencia automaticamente renderização estereoscópica
    renderer.render(scene, cameras[currentCamera]);

    renderer.setAnimationLoop( function () {
        renderer.render(scene, cameras[activeCamera]);
    }); 

    update();
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    // Inicializar renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Configurar VR
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    // Criar cena e câmeras
    createMaterials();
    scene = createScene();
    createCamera();
    
    // Event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    update();
    render();
    renderer.setAnimationLoop(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        cameras[activeCamera].aspect = window.innerWidth / window.innerHeight;
        cameras[activeCamera].updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    switch (e.key) {
        case "p":
        case "P":
            keyStates["P"] = true;
            break;
        case "s":
        case "S":
            keyStates["S"] = true;
            break;
        case "q":
        case "Q":
            keyStates["Q"] = true;
            break;
        case "w":
        case "W":
            keyStates["W"] = true;
            break;
        case "e":
        case "E":
            keyStates["E"] = true;
            break;
        case "r":
        case "R":
            keyStates["R"] = true;
            break;
        case "d":
        case "D":
            keyStates["D"] = true;
            break;
        case "7":
            keyStates["7"] = true;
            break;

        // Arrow keys - movement ovni
        case "ArrowLeft":
            keyStates["LEFT"] = true;
            break;
        case "ArrowUp":
            keyStates["BACK"] = true;
            break;
        case "ArrowRight":
            keyStates["RIGHT"] = true;
            break;
        case "ArrowDown":
            keyStates["FRONT"] = true;
            break;

        // Change texture
        case "1":
            keyStates["1"] = true;
            break;

        case "2":
            keyStates["2"] = true; 
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    switch (e.key) {
        case "p":
        case "P":
            keyStates["P"] = false;
            processedToggle["P"] = false;
            break;
        case "s":
        case "S":
            keyStates["S"] = false;
            processedToggle["S"] = false;
            break;
        case "q":
        case "Q":
            keyStates["Q"] = false;
            processedToggle["Q"] = false;
            break;
        case "w":
        case "W":
            keyStates["W"] = false;
            processedToggle["W"] = false;
            break;
        case "e":
        case "E":
            keyStates["E"] = false;
            processedToggle["E"] = false;
            break;
        case "r":
        case "R":
            keyStates["R"] = false;
            processedToggle["R"] = false;
            break;
        case "d":
        case "D":
            keyStates["D"] = false;
            processedToggle["D"] = false;
            break;
        case "7":
            keyStates["7"] = false;
            processedToggle["7"] = false;
            break;

        // Arrow keys - movement ovni
        case "ArrowLeft":
            keyStates["LEFT"] = false;
            break;
        case "ArrowUp":
            keyStates["BACK"] = false;
            break;
        case "ArrowRight":
            keyStates["RIGHT"] = false;
            break;
        case "ArrowDown":
            keyStates["FRONT"] = false;
            break;

        case "1":
            keyStates["1"] = false;
            processedToggle["1"] = false;
            break;

        case "2":
            keyStates["2"] = false;
            processedToggle["2"] = false;
            break;
    }
}

init();
animate();