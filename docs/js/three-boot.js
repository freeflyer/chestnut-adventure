/* Chestnut Adventure 2.5D — hands three.js (an ES module) to the classic game scripts.
   This module is deferred like the scripts after it and runs first, so by the time
   the engine boots, window.THREE and window.THREE_X are there. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

window.THREE = THREE;
window.THREE_X = { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, OutputPass, SVGLoader, RoundedBoxGeometry, BufferGeometryUtils };
