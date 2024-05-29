"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas() {
  function sketch(p5) {
    const circleDiameter = 15;
    const numGridLines = 24;
    const padding = circleDiameter / 2;
    const canvasSize = 600;
    const gridSize = canvasSize - 2 * padding;

    const verticalGridSpacing = gridSize / numGridLines;
    const horizontalGridSpacing = gridSize / numGridLines;

    let paths = [];
    let currentPathIndex = null;
    let draggingIndex = null;
    let hasDragged = false;
    let shouldDrawLightCones = false;

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

    const opacity = 0.25;

    const colorsTrans = [
      `rgba(255, 0, 0, ${opacity})`,
      `rgba(0, 0, 255, ${opacity})`,
      `rgba(0, 128, 0, ${opacity})`,
      `rgba(128, 0, 128, ${opacity})`,
      `rgba(255, 165, 0, ${opacity})`,
      `rgba(255, 192, 203, ${opacity})`,
      `rgba(165, 42, 42, ${opacity})`,
      `rgba(255, 127, 80, ${opacity})`,
      `rgba(0, 255, 255, ${opacity})`,
    ];

    class Path {
      constructor(pos, colorIndex = 0) {
        this.events = [{ x: pos.x, y: pos.y }];
        this.intervals = [];
        this.color = getColor(colorIndex);
        this.colorTrans = getColor(colorIndex, true);
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
        p5.push();
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

        p5.pop();
      }

      drawHyperPlanes(p5) {
        p5.push();
        p5.translate(padding, padding);
        p5.angleMode(p5.DEGREES);

        for (let i = 0; i < this.events.length; i++) {
          if (this.events.length < 2) {
            break;
          }

          let event1 = this.events[i];
          let event2 = this.events[i - 1];

          if (i === 0) {
            event2 = this.events[i + 1];
          }

          if (!event2) {
            continue;
          }

          let dx = event2.x - event1.x;
          let dy = event2.y - event1.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            // If traveling faster the speed of light
            if (i < this.events.length - 1) {
              // If not the last event, then check the next event
              event2 = this.events[i + 1];

              dx = event2.x - event1.x;
              dy = event2.y - event1.y;

              if (Math.abs(dx) > Math.abs(dy)) {
                continue;
              }
            } else {
              continue;
            }
          }

          const angle = p5.degrees(Math.atan2(dy, dx));

          console.log("index", i, "angle", angle);

          let bisectorAngle = null;

          if (angle <= 0 && angle > -90) {
            bisectorAngle = -45;
          } else if (angle <= -90 && angle > -180) {
            bisectorAngle = -135;
          } else if (angle >= 0 && angle < 90) {
            bisectorAngle = 45;
          } else if (angle >= 90 && angle < 180) {
            bisectorAngle = 135;
          }

          console.log("index", i, "bisectorAngle", bisectorAngle);

          // Calculate the bisected angle with 45-degree line
          const bisectedAngle = angle - (angle - bisectorAngle) * 2;

          console.log("index", i, "bisectedAngle", bisectedAngle);

          p5.push();
          p5.translate(event1.x, event1.y);
          p5.stroke(this.color);
          p5.strokeWeight(3);
          p5.drawingContext.setLineDash([5, 15]);

          p5.rotate(bisectedAngle);
          p5.line(0, 0, gridSize, 0);
          p5.rotate(180);
          p5.line(0, 0, gridSize, 0);
          p5.pop();
        }

        p5.pop();
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

    function getColor(index, transparent = false) {
      if (transparent) {
        return colorsTrans[index % colorsTrans.length];
      }

      return colors[index % colors.length];
    }

    function getNearestGridPoint(p5, mousePos) {
      const nearestX =
        Math.round(mousePos.x / verticalGridSpacing) * verticalGridSpacing;
      const nearestY =
        Math.round(mousePos.y / horizontalGridSpacing) * horizontalGridSpacing;

      return { x: nearestX, y: nearestY };
    }

    function getGridPointEventIndex(p5, gridPoint) {
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

    function drawHover(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos) {
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);
        const gridPointEventIndex = getGridPointEventIndex(
          p5,
          nearestGridPoint
        );

        let shouldDrawEvent = false;
        let shouldDrawLightCone = false;

        let color;
        if (currentPathIndex !== null) {
          color = getColor(currentPathIndex);
          shouldDrawEvent = true;
        } else if (gridPointEventIndex !== null) {
          color = getColor(gridPointEventIndex.pathIndex, true);
          shouldDrawLightCone = true;
        } else {
          color = getColor(paths.length);
          shouldDrawEvent = true;
        }

        p5.push();
        p5.translate(padding, padding);

        if (shouldDrawEvent) {
          p5.noStroke();
          p5.fill(color);
          p5.ellipse(nearestGridPoint.x, nearestGridPoint.y, circleDiameter);
        } else if (shouldDrawLightCones && shouldDrawLightCone) {
          drawLightCone(p5, nearestGridPoint, color);
        }

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

        p5.pop();
      }
    }

    function drawLightCone(p5, gridPoint, color) {
      p5.push();
      p5.noStroke();
      p5.fill(color);

      // Calculate the maximum distance to the grid boundaries from the current point
      const distanceToTop = gridPoint.y;
      const distanceToBottom = gridSize - gridPoint.y;
      const distanceToLeft = gridPoint.x;
      const distanceToRight = gridSize - gridPoint.x;

      // Top triangle
      p5.beginShape();
      p5.vertex(gridPoint.x, gridPoint.y);
      p5.vertex(
        gridPoint.x - Math.min(distanceToLeft, distanceToTop),
        gridPoint.y - Math.min(distanceToLeft, distanceToTop)
      );
      p5.vertex(
        gridPoint.x - Math.min(distanceToLeft, distanceToTop),
        gridPoint.y - distanceToTop
      );
      p5.vertex(
        gridPoint.x + Math.min(distanceToRight, distanceToTop),
        gridPoint.y - distanceToTop
      );
      p5.vertex(
        gridPoint.x + Math.min(distanceToRight, distanceToTop),
        gridPoint.y - Math.min(distanceToRight, distanceToTop)
      );
      p5.endShape();

      // Bottom triangle
      p5.beginShape();
      p5.vertex(gridPoint.x, gridPoint.y);
      p5.vertex(
        gridPoint.x - Math.min(distanceToLeft, distanceToBottom),
        gridPoint.y + Math.min(distanceToLeft, distanceToBottom)
      );
      p5.vertex(
        gridPoint.x - Math.min(distanceToLeft, distanceToBottom),
        gridPoint.y + distanceToBottom
      );
      p5.vertex(
        gridPoint.x + Math.min(distanceToRight, distanceToBottom),
        gridPoint.y + distanceToBottom
      );
      p5.vertex(
        gridPoint.x + Math.min(distanceToRight, distanceToBottom),
        gridPoint.y + Math.min(distanceToRight, distanceToBottom)
      );
      p5.endShape();

      p5.pop();
    }

    function handleLightCones(p5) {
      const mousePos = getMouseInsideGrid(p5);
    }

    function drawPaths(p5) {
      paths.forEach((path) => path.draw(p5));
    }

    function drawHyperPlanes(p5) {
      paths.forEach((path) => path.drawHyperPlanes(p5));
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
          const gridPointEventIndex = getGridPointEventIndex(
            p5,
            nearestGridPoint
          );
          if (gridPointEventIndex !== null) {
            // If the nearest point is an existing point, then start dragging
            draggingIndex = gridPointEventIndex;
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
      }

      draggingIndex = null;
      hasDragged = false;
    }

    function handleMouseDragged(p5) {
      const mousePos = getMouseInsideGrid(p5);

      if (mousePos && draggingIndex !== null && currentPathIndex === null) {
        // If mouse pressed inside the grid and in dragging mode
        const nearestGridPoint = getNearestGridPoint(p5, mousePos);

        const draggingPath = paths[draggingIndex.pathIndex];
        const draggingEvent = draggingPath.events[draggingIndex.eventIndex];

        if (
          draggingEvent.x !== nearestGridPoint.x ||
          draggingEvent.y !== nearestGridPoint.y
        ) {
          // If draggingEvent !== nearestGridPoint, then drag the event
          draggingPath.dragPoint(nearestGridPoint, draggingIndex.eventIndex);
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
      drawHyperPlanes(p5);
      drawHover(p5);
      handleLightCones(p5);
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
