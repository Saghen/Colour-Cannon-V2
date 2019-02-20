# Colour-Cannon-V2
https://saghen.github.io/Colour-Cannon-V2/

The goal of this project was to take the original Colour Cannon project inspired by Josh Bragg and optimize it via OffscreenCanvases and transferring the image pixel by pixel within the GPU. However, the constant buffer switching within the GPU proved to cause large spikes in CPU usage with high particle counts. I had to come up with a new solution. As a result, I switched over to WebGL for the rendering of the particles and by using a simple sprite rendered on the GPU, the expense of displaying large numbers of particles vastly decreased.

The solution uses a custom version of Pixi's container and particle container classes optimized to reduce overhead and use double ended queues for optimizing the removal and addition of particles to the scene (due to the expense of the shift operation). Approximately 10-20x faster than 2d canvas implementations.

# Further Optimizations

Scripting time is still the largest bottleneck at high particle counts. 

- HSLtoHex function needs to be heavily optimized
- Switch to WASM for certain number crunching operations (such as the calculation of vectors for the particles)
- Further optimizations to the render function
- Instancing
