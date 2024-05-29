"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas() {
  function sketch(p5) {
    let paths = [];
    let currentPathIndex = null;
    let dragging = null;
    let hasDragged = false;

    const circleDiameter = 15;
    const numGridLines = 24;
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
      "coral",
      "cyan",
    ];

    class Path {
      constructor(pos, colorIndex = 0) {
        this.events = [{ x: pos.x, y: pos.y }];
        this.intervals = [];
        this.color = getColor(colorIndex);
      }

      addPoint(pos) {
        // Make sure this pos is not the same as the last point
        const lastPoint = this.events[this.events.length - 1];
        if (lastPoint.x === pos.x && lastPoint.y === pos.y) {
          return;
        }

        this.events.push({ x: pos.x, y: pos.y });
      }

      dragPoint(pos, index) {
        // If this isn't the first point, make sure this pos is not the same as the last or next point
        if (index > 0) {
          const lastPoint = this.events[index - 1];
          if (lastPoint.x === pos.x && lastPoint.y === pos.y) {
            return;
          }
        }

        // If this isn't the last point, make sure the next point isn't the same
        if (index < this.events.length - 1) {
          const nextPoint = this.events[index + 1];
          if (nextPoint.x === pos.x && nextPoint.y === pos.y) {
            return;
          }
        }

        this.events[index] = { x: pos.x, y: pos.y };
      }

      draw(p5) {
        p5.translate(padding, padding);

        p5.fill(this.color);

        for (let i = 0; i < this.events.length; i++) {
          p5.noStroke();
          const point = this.events[i];
          p5.ellipse(point.x, point.y, circleDiameter);

          if (i > 0 && i < this.events.length) {
            p5.stroke(this.color);
            p5.strokeWeight(3);

            const prevPoint = this.events[i - 1];
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

    function getNearestEvent(p5, gridPoint) {
      for (let i = paths.length - 1; i >= 0; i--) {
        const path = paths[i];

        for (let j = 0; j < path.events.length; j++) {
          const point = path.events[j];

          if (point.x === gridPoint.x && point.y === gridPoint.y) {
            return { pathIndex: i, eventIndex: j };
          }
        }
      }

      return null;
    }

    function getClickedOnLastEvent(p5, gridPoint) {
      if (currentPathIndex !== null) {
        return null;
      }

      for (let i = paths.length - 1; i >= 0; i--) {
        const path = paths[i];

        const lastPoint = path.events[path.events.length - 1];
        if (lastPoint.x === gridPoint.x && lastPoint.y === gridPoint.y) {
          return i;
        }
      }

      return null;
    }

    function drawGrid(p5) {
      // Draw the horizontal grid lines

      p5.translate(padding, padding);
      p5.strokeWeight(1);
      p5.stroke(0, 0, 0);

      // Draw vertical grid lines
      for (let x = 0; x <= gridSize; x += verticalGridSpacing) {
        if (x === 0) {
          p5.line(x, 0, x, gridSize);
          continue;
        } else if (x >= gridSize) {
          p5.line(x, 0, x, gridSize);
          continue;
        }

        p5.line(x, 0, x, gridSize);
      }

      // Draw horizontal grid lines
      for (let y = 0; y <= gridSize; y += horizontalGridSpacing) {
        if (y === 0) {
          p5.line(0, y, gridSize, y);
          continue;
        } else if (y >= gridSize) {
          p5.line(0, y, gridSize, y);
          continue;
        }

        p5.line(0, y, gridSize, y);
      }

      p5.translate(-padding, -padding);
    }

    function handleMouseHover(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos) {
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);

        const nearestEvent = getNearestEvent(p5, nearestGridPoint);

        let color;
        if (currentPathIndex !== null) {
          color = getColor(currentPathIndex);
        } else if (nearestEvent !== null) {
          color = getColor(nearestEvent.pathIndex);
        } else {
          color = getColor(paths.length);
        }

        p5.translate(padding, padding);
        p5.noStroke();
        p5.fill(color);
        p5.ellipse(nearestGridPoint.x, nearestGridPoint.y, circleDiameter);

        // Draw line to the last point in the current path
        if (currentPathIndex !== null) {
          const currentPath = paths[currentPathIndex];

          if (currentPath.events.length > 0) {
            const lastPoint = currentPath.events[currentPath.events.length - 1];
            p5.stroke(color);
            p5.strokeWeight(3);
            p5.line(
              lastPoint.x,
              lastPoint.y,
              nearestGridPoint.x,
              nearestGridPoint.y
            );
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

      if (mousePos) {
        // If mouse pressed inside the grid
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);

        if (currentPathIndex !== null) {
          // If currently drawing a path, then add the point to the path
          const currentPath = paths[currentPathIndex];
          currentPath.addPoint(nearestGridPoint);

          let pathsCopy = [...paths];
          pathsCopy[currentPathIndex] = currentPath;
          paths = pathsCopy;
        } else {
          // If not currently drawing a path
          const nearestEvent = getNearestEvent(p5, nearestGridPoint);
          if (nearestEvent !== null) {
            // If the nearest point is an existing point, then start dragging
            dragging = nearestEvent;
          } else {
            // If the nearest point is not an existing point, then start a new path
            currentPathIndex = paths.length;
            const newPath = new Path(nearestGridPoint, currentPathIndex);
            paths = [...paths, newPath];
          }
        }
      }
      // else {
      //   currentPathIndex = null;
      // }
    }

    function handleMouseReleased(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos && !hasDragged && currentPathIndex === null) {
        // If mouse released without dragging and not currently drawing a path
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);
        const clickedOnLastEvent = getClickedOnLastEvent(p5, nearestGridPoint);

        if (clickedOnLastEvent !== null) {
          // If clicked on the last event of a path, then set the current path to that path
          currentPathIndex = clickedOnLastEvent;
        }

        console.log(clickedOnLastEvent);
      }

      dragging = null;
      hasDragged = false;
    }

    function handleMouseDragged(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos && dragging !== null && currentPathIndex === null) {
        // If mouse pressed inside the grid and in dragging mode
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);

        const draggingPath = paths[dragging.pathIndex];
        const draggingEvent = draggingPath.events[dragging.eventIndex];

        if (
          draggingEvent.x !== nearestGridPoint.x ||
          draggingEvent.y !== nearestGridPoint.y
        ) {
          // If draggingEvent !== nearestGridPoint, then drag the event
          draggingPath.dragPoint(nearestGridPoint, dragging.eventIndex);
          hasDragged = true;
        }
      }
    }

    function handleKeyPressed(p5, key) {
      if (key === "Escape") {
        currentPathIndex = null;
      } else if (key === "x") {
        paths = [];
        currentPathIndex = null;
      } else if (key === "z") {
        // Remove the last event of the last path
        // If the path is now empty, remove it
        if (paths.length > 0) {
          const lastPath = paths[paths.length - 1];
          lastPath.events.pop();

          if (lastPath.events.length === 0) {
            currentPathIndex = null;
            paths.pop();
          } else {
            paths[paths.length - 1] = lastPath;
          }
        }
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
      handleMouseHover(p5);
    };

    p5.mousePressed = () => {
      handleMousePressed(p5);
    };

    p5.mouseDragged = () => {
      handleMouseDragged(p5);
    };

    p5.mouseReleased = () => {
      handleMouseReleased(p5);
    };

    p5.keyPressed = () => {
      handleKeyPressed(p5, p5.key);
    };
  }

  return <NextReactP5Wrapper sketch={sketch} />;
}
