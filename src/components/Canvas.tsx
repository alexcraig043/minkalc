"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas() {
  function sketch(p5) {
    const numGridLines = 20;
    const circleDiameter = 15;
    const padding = circleDiameter / 2;
    const canvasSize = 600;
    const gridSize = canvasSize - 2 * padding;

    const verticalGridSpacing = gridSize / numGridLines;
    const horizontalGridSpacing = gridSize / numGridLines;

    function drawGrid(p5) {
      // Draw the horizontal grid lines

      p5.translate(padding, padding);
      p5.strokeWeight(1);
      p5.stroke(0, 0, 0);

      // Draw vertical grid lines
      for (let x = 0; x <= gridSize; x += verticalGridSpacing) {
        if (x === 0) {
          p5.line(x + 1, 1, x + 1, gridSize - 1);
          continue;
        } else if (x >= gridSize) {
          p5.line(x - 1, 1, x - 1, gridSize - 1);
          continue;
        }

        p5.line(x, 1, x, gridSize - 1);
      }

      // Draw horizontal grid lines
      for (let y = 0; y <= gridSize; y += horizontalGridSpacing) {
        if (y === 0) {
          p5.line(1, y + 1, gridSize - 1, y + 1);
          continue;
        } else if (y >= gridSize) {
          p5.line(1, y - 1, gridSize - 1, y - 1);
          continue;
        }

        p5.line(1, y, gridSize - 1, y);
      }

      p5.translate(-padding, -padding);
    }

    function drawHoverCircle(p5) {
      p5.translate(padding, padding);

      const mouseX = p5.mouseX - padding;
      const mouseY = p5.mouseY - padding;

      if (
        mouseX >= 0 &&
        mouseX <= gridSize &&
        mouseY >= 0 &&
        mouseY <= gridSize
      ) {
        const nearestX =
          Math.round(mouseX / verticalGridSpacing) * verticalGridSpacing;
        const nearestY =
          Math.round(mouseY / horizontalGridSpacing) * horizontalGridSpacing;

        p5.noStroke();
        p5.fill("red");
        p5.ellipse(nearestX, nearestY, circleDiameter);
      }

      p5.translate(-padding, -padding);
    }

    p5.setup = () => {
      p5.createCanvas(canvasSize, canvasSize);

      drawGrid(p5);
    };

    p5.draw = () => {
      p5.clear();
      drawGrid(p5);
      drawHoverCircle(p5);
    };
  }

  return <NextReactP5Wrapper sketch={sketch} />;
}
