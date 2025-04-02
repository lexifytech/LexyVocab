import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFireworksPreset } from "tsparticles-preset-fireworks";
import { Engine } from "tsparticles-engine";

export const CelebrationOverlay = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFireworksPreset(engine);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <Particles
        init={particlesInit}
        options={{
          preset: "fireworks",
          particles: {
            number: {
              value: 0
            },
            color: {
              value: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
            },
            shape: {
              type: "circle"
            },
            opacity: {
              value: { min: 0.3, max: 0.8 }
            },
            size: {
              value: { min: 1, max: 3 }
            },
            move: {
              enable: true,
              speed: 3,
              direction: "none",
              random: true,
              straight: false,
              outMode: "destroy"
            }
          },
          background: {
            opacity: 0
          },
          emitters: [
            {
              direction: "top",
              rate: {
                delay: 0.1,
                quantity: 3
              },
              position: {
                x: 45,
                y: 90
              },
              size: {
                width: 0,
                height: 0
              },
              life: {
                duration: 0.1,
                count: 1
              }
            },
            {
              direction: "top",
              rate: {
                delay: 0.1,
                quantity: 3
              },
              position: {
                x: 55,
                y: 90
              },
              size: {
                width: 0,
                height: 0
              },
              life: {
                duration: 0.1,
                count: 1
              }
            }
          ],
          detectRetina: true
        }}
      />
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 px-8 py-4 rounded-lg shadow-lg text-center z-[51]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Amazing! 🎉</h2>
        <p className="text-gray-600">You're doing great!</p>
      </div>
    </div>
  );
}; 