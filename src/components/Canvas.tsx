"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas() {
  function sketch(p5) {
    function drawGrid() {}

    p5.setup = () => {
      p5.createCanvas(600, 600);

      const numGridLines = 20;
      const verticalGridSpacing = p5.width / numGridLines;
      const horizontalGridSpacing = p5.height / numGridLines;

      // Draw the horizontal grid lines
      p5.strokeWeight(1);
      p5.stroke(0, 0, 0);

      // Draw vertical grid lines
      for (let x = 0; x <= p5.width; x += verticalGridSpacing) {
        if (x === 0) {
          p5.line(x + 1, 1, x + 1, p5.height - 1);
          continue;
        } else if (x >= p5.width) {
          p5.line(x - 1, 1, x - 1, p5.height - 1);
          continue;
        }

        p5.line(x, 1, x, p5.height - 1);
      }

      // Draw horizontal grid lines
      for (let y = 0; y <= p5.height; y += horizontalGridSpacing) {
        if (y === 0) {
          p5.line(1, y + 1, p5.width - 1, y + 1);
          continue;
        } else if (y >= p5.height) {
          p5.line(1, y - 1, p5.width - 1, y - 1);
          continue;
        }

        p5.line(1, y, p5.width - 1, y);
      }
    };

    p5.draw = () => {};
  }

  return <NextReactP5Wrapper sketch={sketch} />;
}
