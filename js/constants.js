const OvniHeight = 39;

// Point Lights
const pointLightColor = 0xFFFFFF;      // luz branca padrão
const pointLightIntensity = 5;       // intensidade realista para lâmpadas
const pointLightDistance = 48;         // até onde a luz alcança com atenuação
const pointLightDecay = 0.8;             // decaimento físico realista (quadrático)

// Spot Lights
const spotLightColor = 0xE4A4D9;       // tom quente, pode ser branco ou colorido
const spotLightIntensity = 10;          // intensidade realista para um holofote
const spotLightDistance = 200;         // alcance da luz
const spotLightAngle = Math.PI / 6;     // foco mais estreito que um terço do círculo
const spotLightPenumbra = 0.5;         // bordas suaves (0 a 1)
const spotLightDecay = 0.8;              // decaimento físico realista

// OVNI
const ovniScaleX = 1.5;   
const ovniScaleY = 1.5;
const ovniScaleZ = 1.5;
const ovniPositionX = 0;
const ovniPositionY = OvniHeight;
const ovniPositionZ = 0;
const ovniRotationSpeed = 0.5;  // radianos por segundo
const ovniMovementSpeed = 30;   // velocidade em unidades por segundo

//OVNI's cockpit
const cockpitRadius = 1;
const cockpitScaleX = 3;
const cockpitScaleY = 2.5;
const cockpitScaleZ = 3;
const cockpitPositionX = 0;
const cockpitPositionY = 1;
const cockpitPositionZ = 0;

//OVNI's body
const bodyRadius = 1; 
const bodyScaleX = 6;
const bodyScaleY = 1.5;
const bodyScaleZ = 6;
const bodyPositionX = 0;
const bodyPositionY = 0;
const bodyPositionZ = 0;

//ONVI's cilinder
const cylinderRadius = 1;
const cylinderHeight = 1;
const cylinderScaleX = 1;
const cylinderScaleY = 1;
const cylinderScaleZ = 1;
const cylinderPositionX = 0;
const cylinderPositionY = -1.2; 
const cylinderPositionZ = 0;

//OVNI's spheres
const sphereRadius = 0.7;
const sphereNumber = 8;
const sphereDist = 4.1; 
const sphereScaleX = 1;
const sphereScaleY = 1;
const sphereScaleZ = 1;
const spherePositionX = 0;
const spherePositionY = -0.9;
const spherePositionZ = 0;

//TREE trunck
const trunkCylinderRadius = 1;
const trunkCylinderHeight = 1;
const trunkCylinderScaleX = 1;
const trunkCylinderScaleY = 1;
const trunkCylinderScaleZ = 1;
const trunk_1_CylinderPositionX = 0;
const trunk_1_CylinderPositionY = 8; 
const trunk_1_CylinderPositionZ = 0;
const trunk_2_CylinderPositionX = -5;
const trunk_2_CylinderPositionY = 14; 
const trunk_2_CylinderPositionZ = 0;
const trunk_3_CylinderPositionX = 3;
const trunk_3_CylinderPositionY = 16; 
const trunk_3_CylinderPositionZ = 0;

//TREE leave
const leaveSphereRadius = 1;
const leaveSphereNumber = 1;
const leaveSphereDist = 1; 
const leaveSphereScaleX = 10;
const leaveSphereScaleY = 5;
const leaveSphereScaleZ = 10;
const leaveSphere_1_PositionX = -12;
const leaveSphere_1_PositionY = 18;
const leaveSphere_1_PositionZ = 1;
const leaveSphere_2_PositionX = 1;
const leaveSphere_2_PositionY = 24;
const leaveSphere_2_PositionZ = 1;
const leaveSphere_3_PositionX = 8;
const leaveSphere_3_PositionY = 22;
const leaveSphere_3_PositionZ = 1;


//HOUSE
const HousePositionX = 0;
const HousePositionY = 0;
const HousePositionZ = 0;


const RightLateralWallPositionX = 10;
const RightLateralWallPositionY = 0;
const RightLateralWallPositionZ = 0;

const LeftLateralWallPositionX = -10;
const LeftLateralWallPositionY = 0;
const LeftLateralWallPositionZ = 0;

const BackWallPositionX = 0;
const BackWallPositionY = 0;
const BackWallPositionZ = -5;

const FrontWallPositionX = 0;
const FrontWallPositionY = 0;
const FrontWallPositionZ = 5;

const Window_1_PositionX = -6;
const Window_1_PositionY = 0;
const Window_1_PositionZ = 5;

const Window_2_PositionX = 6;
const Window_2_PositionY = 0;
const Window_2_PositionZ = 5;

const DoorPositionX = 0;
const DoorPositionY = -1.5;
const DoorPositionZ = 5;

const RoofPositionX = 0;
const RoofPositionY = 6;
const RoofPositionZ = 0;

const ChimneyPositionX = 6;
const ChimneyPositionY = 7.5;
const ChimneyPositionZ = 3;

const offset = -50;