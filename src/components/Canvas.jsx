"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas() {
  function sketch(p5) {
    let paths = [];
    let currentPathIndex = null;

    const circleDiameter = 15;
    const numGridLines = 25;
    const padding = circleDiameter / 2;
    const canvasSize = 600;
    const gridSize = canvasSize - 2 * padding;

    const verticalGridSpacing = gridSize / numGridLines;
    const horizontalGridSpacing = gridSize / numGridLines;

    const colors = [
      "red",
      "blue",
      "green",
      "purple",
      "orange",
      "pink",
      "brown",
    ];
    class Path {
      constructor(pos, colorIndex = 0) {
        this.points = [{ x: pos.x, y: pos.y }];
        this.intervals = [];
        this.color = getColor(colorIndex);
      }

      addPoint(pos) {
        this.points.push({ x: pos.x, y: pos.y });
      }

      draw(p5) {
        p5.translate(padding, padding);

        p5.fill(this.color);

        for (let i = 0; i < this.points.length; i++) {
          p5.noStroke();
          const point = this.points[i];
          p5.ellipse(point.x, point.y, circleDiameter);

          if (i > 0 && i < this.points.length) {
            p5.stroke(this.color);
            p5.strokeWeight(3);

            const prevPoint = this.points[i - 1];
            p5.line(prevPoint.x, prevPoint.y, point.x, point.y);
          }
        }

        p5.translate(-padding, -padding);
      }
    }

    function getMouseInsideGrid(p5) {
      const mouseX = p5.mouseX - padding;
      const mouseY = p5.mouseY - padding;

      if (
        mouseX >= 0 &&
        mouseX <= gridSize &&
        mouseY >= 0 &&
        mouseY <= gridSize
      ) {
        return { x: mouseX, y: mouseY };
      }

      return null;
    }

    function getColor(index) {
      return colors[index % colors.length];
    }

    function getNearestGridPoint(p5, mousePos) {
      const nearestX =
        Math.round(mousePos.x / verticalGridSpacing) * verticalGridSpacing;
      const nearestY =
        Math.round(mousePos.y / horizontalGridSpacing) * horizontalGridSpacing;

      return { x: nearestX, y: nearestY };
    }

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

    function drawHover(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos) {
        const nearestPoint = getNearestGridPoint(p5, mousePos);

        p5.translate(padding, padding);

        let color;

        if (currentPathIndex !== null) {
          color = getColor(currentPathIndex);
        } else {
          color = getColor(paths.length);
        }

        p5.noStroke();
        p5.fill(color);
        p5.ellipse(nearestPoint.x, nearestPoint.y, circleDiameter);

        // Draw line to the last point in the current path
        if (currentPathIndex !== null) {
          const currentPath = paths[currentPathIndex];

          if (currentPath.points.length > 0) {
            const lastPoint = currentPath.points[currentPath.points.length - 1];
            p5.stroke(color);
            p5.strokeWeight(3);
            p5.line(lastPoint.x, lastPoint.y, nearestPoint.x, nearestPoint.y);
          }
        }

        p5.translate(-padding, -padding);
      }
    }

    function drawPaths(p5) {
      paths.forEach((path) => path.draw(p5));
    }

    function handleMousePressed(p5) {
      const mousePos = getMouseInsideGrid(p5);

      // If mouse pressed inside the grid
      if (mousePos) {
        const nearestPoint = getNearestGridPoint(p5, mousePos);

        if (currentPathIndex !== null) {
          const currentPath = paths[currentPathIndex];
          currentPath.addPoint(nearestPoint);

          let pathsCopy = [...paths];
          pathsCopy[currentPathIndex] = currentPath;
          paths = pathsCopy;
        } else {
          currentPathIndex = paths.length;
          const newPath = new Path(nearestPoint, currentPathIndex);
          paths = [...paths, newPath];
        }
      } else {
        currentPathIndex = null;
      }
    }

    function handleKeyPressed(p5, key) {
      if (key === "Escape") {
        currentPathIndex = null;
      } else if (key === "x") {
        paths = [];
        currentPathIndex = null;
      }
    }

    p5.setup = () => {
      p5.createCanvas(canvasSize, canvasSize);

      drawGrid(p5);
    };

    p5.draw = () => {
      p5.clear();
      drawGrid(p5);
      drawPaths(p5);
      drawHover(p5);
    };

    p5.mousePressed = () => {
      handleMousePressed(p5);
    };

    p5.keyPressed = () => {
      console.log(p5.key);
      handleKeyPressed(p5, p5.key);
    };
  }

  return <NextReactP5Wrapper sketch={sketch} />;
}
