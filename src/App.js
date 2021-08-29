import "./App.css";
import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import { Canvas, extend , useFrame } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import { useSpring, animated } from '@react-spring/three'
import img1 from "../src/img/img1.jpg";
import img2 from "../src/img/img2.jpg";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {uTime: 0 , uColor: new THREE.Color(1.0,0.0,0.0), uTexture: new THREE.Texture()},
  // Vertex Shader
  glsl`

    precision mediump float;

    uniform float uTime;
    varying vec2 vUv; 
    varying float vWave;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d) ;

    void main() {

      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 3.5;
      float noiseAmp = 0.55; 
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
       vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);  
    }
  `,
  // Fragment Shader
  glsl`

    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;


    void main() {
      float wave = vWave * 0.1;
      float r = texture2D(uTexture, vUv).r;
      float g = texture2D(uTexture, vUv).g;
      float b = texture2D(uTexture, vUv + wave).b;
      vec3 texture = vec3(r, g, b);
     gl_FragColor = vec4(texture,1.0); 
    }
  `
);

extend({ WaveShaderMaterial });

const KingFrame = () => {

  const [active, setActive] = useState(false);
  const { scale } = useSpring({ scale: active ? 1.2 : 1 })


  const ref = useRef();
  
  useFrame(({clock})=>(
    ref.current.uTime = clock.getElapsedTime()
  ));

  const [imgg1 , imgg2] = useTexture([img1,img2]);

  return (
    <animated.mesh onClick={() => setActive(!active)} scale={scale}>
      <planeBufferGeometry args={[0.9, 0.6, 16, 16]} />
      <waveShaderMaterial ref={ref} uColor={"gold"} uTexture={active? imgg1 : imgg2} />
    </animated.mesh>
  );
};

function App() {
  return (
    <div className="app">
      <Canvas camera={{fov:10}}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <KingFrame />
        </Suspense>
      </Canvas>
      <div className="text">
      <h1>
      Custom Shader
      </h1>
      </div>
    </div>
  );
}

export default App;
