"use client";

import { NextReactP5Wrapper } from "@p5-wrapper/next";

export default function Canvas({ getColor }) {
  const circleDiameter = 15;
  const numGridLines = 24;
  const padding = circleDiameter / 2;
  const canvasSize = 600;
  const canvasWidth = canvasSize * 1.625;
  const gridSize = canvasSize - 2 * padding;

  const verticalGridSpacing = gridSize / numGridLines;
  const horizontalGridSpacing = gridSize / numGridLines;

  let paths = [];
  let avoidLineIndices = null;
  let currentPathIndex = null;
  let draggingIndex = null;
  let hasDragged = false;
  let shouldDrawLightCones = true;
  let shouldDrawHyperPlanes = true;
  let shouldPulseHyperPlanes = true;
  let pulseHyperPlanesY = canvasSize;
  const pulseDelta = 1;

  class Path {
    constructor(pos, colorIndex = 0) {
      this.events = [{ x: pos.x, y: pos.y }];
      this.timeIntervals = [];
      this.color = getColor(colorIndex);
      this.colorTrans = getColor(colorIndex, true);
    }

    calculateTimeIntervals(p5) {
      if (this.events.length < 2) {
        return;
      }

      this.timeIntervals = [];

      for (let i = 0; i < this.events.length - 1; i++) {
        const event1 = this.events[i];
        const event2 = this.events[i + 1];

        let dx = event2.x - event1.x;
        let dy = event2.y - event1.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          this.timeIntervals.push(null);
          continue;
        }

        // Scale the distance by the grid spacing
        dx = dx / verticalGridSpacing;
        dy = dy / horizontalGridSpacing;

        const interval = dy * dy - dx * dx;

        const timeInterval = Math.sqrt(interval);

        this.timeIntervals.push(timeInterval);
      }

      return this.timeIntervals;
    }

    addPoint(pos) {
      // Make sure we are not adding a point on top of another point
      for (let i = 0; i < this.events.length; i++) {
        const testPoint = this.events[i];
        if (testPoint.x == pos.x && testPoint.y == pos.y) {
          // Start dragging testPoint
          draggingIndex = { pathIndex: currentPathIndex, eventIndex: i };
          currentPathIndex = null;

          return;
        }
      }

      this.events.push({ x: pos.x, y: pos.y });

      // Reorder events in descending order of y
      this.events.sort((a, b) => b.y - a.y);
    }

    dragEvent(pos, index) {
      // If this isn't the first event, make sure this pos is not the same as the last or next event
      if (index > 0) {
        const lastEvent = this.events[index - 1];
        if (lastEvent.x === pos.x && lastEvent.y === pos.y) {
          return index;
        }
      }

      // If this isn't the last event, make sure the next event isn't the same
      if (index < this.events.length - 1) {
        const nextEvent = this.events[index + 1];
        if (nextEvent.x === pos.x && nextEvent.y === pos.y) {
          return index;
        }
      }

      // Make sure we are not dragging on top of another event
      for (let i = 0; i < this.events.length; i++) {
        const testEvent = this.events[i];
        if (i != index && testEvent.x == pos.x && testEvent.y == pos.y) {
          return index;
        }
      }

      this.events[index] = { x: pos.x, y: pos.y };

      // Reorder events in descending order of y
      this.events.sort((a, b) => b.y - a.y);

      // Return the new index of the dragged event
      return this.events.findIndex(
        (event) => event.x === pos.x && event.y === pos.y
      );
    }

    draw(p5) {
      p5.push();
      p5.translate(padding, padding);

      p5.fill(this.color);

      for (let i = 0; i < this.events.length; i++) {
        p5.noStroke();
        const event = this.events[i];
        p5.ellipse(event.x, event.y, circleDiameter);

        if (i > 0 && i < this.events.length) {
          const thisPathIndex = paths.findIndex((path) => path === this);

          if (
            avoidLineIndices !== null &&
            thisPathIndex === avoidLineIndices?.[0] &&
            i === avoidLineIndices?.[1]
          ) {
            continue;
          }

          p5.stroke(this.color);
          p5.strokeWeight(3);

          const prevEvent = this.events[i - 1];
          p5.line(prevEvent.x, prevEvent.y, event.x, event.y);
        }
      }

      p5.pop();
    }

    drawHyperPlanes(p5) {
      if (this.events.length < 2) {
        return;
      }

      p5.push();
      p5.translate(padding, padding);
      p5.angleMode(p5.DEGREES);

      for (let i = 0; i < this.events.length; i++) {
        const [event1, event2] = this.getHyperPlaneEvents(i);

        if (!event1 || !event2) {
          continue;
        }

        const bisectedAngle = this.getHyperPlaneAngle(p5, event1, event2);

        p5.push();
        p5.translate(event1.x, event1.y);
        p5.stroke(this.color);
        p5.strokeWeight(3);
        p5.drawingContext.setLineDash([5, 15]);

        p5.rotate(bisectedAngle);
        p5.line(0, 0, 2 * gridSize, 0);
        p5.rotate(180);
        p5.line(0, 0, 2 * gridSize, 0);
        p5.pop();
      }
      p5.pop();
    }

    pulseHyperPlane(p5, y) {
      if (this.events.length < 2) {
        return;
      }

      let eventIndex = null;

      for (let i = 0; i < this.events.length; i++) {
        const event = this.events[i];

        if (event.y > y) {
          eventIndex = i;
        }
      }

      if (eventIndex === null) {
        return;
      }

      const [event1, event2] = this.getHyperPlaneEvents(eventIndex, true);

      if (!event1 || !event2) {
        return;
      }

      p5.push();
      p5.translate(padding, padding);
      p5.angleMode(p5.DEGREES);

      const intersectX =
        event2.x +
        ((y - event2.y) * (event1.x - event2.x)) / (event1.y - event2.y);

      const intersectEvent = { x: intersectX, y: y };

      const bisectedAngle = this.getHyperPlaneAngle(p5, intersectEvent, event2);

      p5.push();
      p5.translate(intersectEvent.x, intersectEvent.y);
      p5.stroke(this.color);
      p5.strokeWeight(3);
      p5.drawingContext.setLineDash([5, 15]);

      p5.rotate(bisectedAngle);
      p5.line(0, 0, 2 * gridSize, 0);
      p5.rotate(180);
      p5.line(0, 0, 2 * gridSize, 0);

      // Draw a transparent circle
      p5.fill(this.color);
      p5.noStroke();
      p5.ellipse(0, 0, circleDiameter);

      p5.pop();

      p5.pop();
    }

    getHyperPlaneEvents(i, forPulse = false) {
      let event1 = this.events[i];
      let event2 = this.events[i - 1];

      if (i === 0) {
        event2 = this.events[i + 1];
      }

      if (forPulse) {
        event2 = this.events[i + 1];

        if (i === this.events.length - 1) {
          return [null, null];
        }
      }

      if (!event2) {
        return [null, null];
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
            return [null, null];
          }
        } else {
          return [null, null];
        }
      }

      return [event1, event2];
    }

    getHyperPlaneAngle(p5, event1, event2) {
      const dy = event2.y - event1.y;
      const dx = event2.x - event1.x;

      const angle = p5.degrees(Math.atan2(dy, dx));

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

      // Calculate the bisected angle with 45-degree line
      return angle - (angle - bisectorAngle) * 2;
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

  function getClickedOnPath(p5, gridPoint) {
    if (currentPathIndex !== null) {
      return null;
    }

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];

      for (let j = 0; j < path.events.length; j++) {
        const event = path.events[j];

        if (event.x === gridPoint.x && event.y === gridPoint.y) {
          return i;
        }
      }
    }

    return null;
  }

  function drawGrid(p5) {
    // Draw the horizontal grid lines
    p5.push();
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
    p5.pop();
  }

  function drawHover(p5) {
    const mousePos = getMouseInsideGrid(p5);

    if (mousePos) {
      const nearestGridPoint = getNearestGridPoint(p5, mousePos);
      const gridPointEventIndex = getGridPointEventIndex(p5, nearestGridPoint);

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

        if (currentPath.events.length < 1) {
          p5.pop();
          return;
        }

        function drawLineToMouse(event1, event2 = null) {
          if (event2 === null) {
            p5.stroke(color);
            p5.strokeWeight(3);
            p5.line(event1.x, event1.y, nearestGridPoint.x, nearestGridPoint.y);
          } else {
            p5.stroke(color);
            p5.strokeWeight(3);
            p5.line(event1.x, event1.y, nearestGridPoint.x, nearestGridPoint.y);
            p5.line(event2.x, event2.y, nearestGridPoint.x, nearestGridPoint.y);
          }
        }

        for (let i = 0; i < currentPath.events.length; i++) {
          if (i === 0 && nearestGridPoint.y >= currentPath.events[i].y) {
            drawLineToMouse(currentPath.events[i]);
            avoidLineIndices = null;

            break;
          } else if (
            i === currentPath.events.length - 1 &&
            nearestGridPoint.y <= currentPath.events[i].y
          ) {
            drawLineToMouse(currentPath.events[i]);
            avoidLineIndices = null;

            break;
          }

          if (
            nearestGridPoint.y <= currentPath.events[i].y &&
            nearestGridPoint.y > currentPath.events[i + 1].y
          ) {
            drawLineToMouse(currentPath.events[i], currentPath.events[i + 1]);
            avoidLineIndices = [currentPathIndex, i + 1];

            break;
          }
        }
      } else {
        avoidLineIndices = null;
      }

      p5.pop();
    } else {
      avoidLineIndices = null;
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

  function pulseHyperPlanes(p5) {
    pulseHyperPlanesY -= pulseDelta;

    if (pulseHyperPlanesY < 0) {
      pulseHyperPlanesY = gridSize;
    }

    paths.forEach((path) => {
      path.pulseHyperPlane(p5, pulseHyperPlanesY);
    });

    p5.push();
    p5.translate(padding, padding);

    p5.stroke(0, 0, 0);
    p5.strokeWeight(1);
    p5.drawingContext.setLineDash([5, 15]);
    p5.line(0, pulseHyperPlanesY, gridSize, pulseHyperPlanesY);

    p5.pop();
  }

  function drawPaths(p5) {
    paths.forEach((path) => path.draw(p5));
  }

  function calculateTimeIntervalsAllPaths() {
    paths.forEach((path) => path.calculateTimeIntervals());
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
  }

  function handleMouseReleased(p5) {
    const mousePos = getMouseInsideGrid(p5);

    if (mousePos && !hasDragged && currentPathIndex === null) {
      // If mouse released without dragging and not currently drawing a path
      const nearestGridPoint = getNearestGridPoint(p5, mousePos);
      const clickedOnPath = getClickedOnPath(p5, nearestGridPoint);

      if (clickedOnPath !== null) {
        // If clicked on the last event of a path, then set the current path to that path
        currentPathIndex = clickedOnPath;
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
        draggingIndex.eventIndex = draggingPath.dragEvent(
          nearestGridPoint,
          draggingIndex.eventIndex
        );
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

  function drawTimeIntervals(p5) {
    p5.push();
    p5.translate(2 * padding + gridSize, padding);

    p5.rectMode(p5.CORNER);
    p5.fill("#F1FAEE");
    p5.noStroke();
    p5.rect(-padding / 2, -padding, canvasSize, canvasSize);

    // Write a title called "Time Intervals"
    p5.textSize(20);
    p5.textAlign(p5.LEFT, p5.TOP);
    // Make font thin
    p5.fill("black");
    p5.textStyle(p5.NORMAL);
    p5.text("Time Intervals", 0, 0);

    // Write the time intervals
    p5.textSize(16);

    const intervalPadding = 30;
    let numLines = 0;

    for (let i = 0; i < paths.length; i++) {
      p5.translate(0, intervalPadding);
      p5.translate(0, (numLines * intervalPadding) / 2);

      numLines = 0;

      p5.push();

      const path = paths[i];

      if (path.timeIntervals.length === 0) {
        continue;
      }

      p5.fill(path.color);
      p5.ellipse(circleDiameter / 2, circleDiameter / 2, circleDiameter);
      p5.fill("black");
      p5.translate(circleDiameter * 1.5, 0);

      let horizontalWidth = 0;

      path.timeIntervals.forEach((timeInterval, j) => {
        let formattedTimeInterval;

        if (timeInterval === null) {
          formattedTimeInterval = "NA";
        } else {
          formattedTimeInterval =
            (Math.round(timeInterval * 100) / 100).toString() + " yrs";
        }

        if (j < path.timeIntervals.length - 1) {
          formattedTimeInterval += " → ";
        }

        const textWidth = p5.textWidth(formattedTimeInterval);

        if (
          2 * padding +
            gridSize +
            2.5 * circleDiameter +
            horizontalWidth +
            textWidth >
          canvasWidth
        ) {
          p5.translate(-1 * horizontalWidth, intervalPadding / 2);
          horizontalWidth = 0;
          numLines++;
        } else {
          horizontalWidth += textWidth;
        }

        p5.text(formattedTimeInterval, 0, 0);
        p5.translate(textWidth, 0);
      });

      p5.pop();
    }

    p5.pop();
  }

  function sketch(p5) {
    p5.setup = () => {
      p5.createCanvas(canvasWidth, canvasSize);

      drawGrid(p5);
    };

    p5.draw = () => {
      p5.clear();
      drawGrid(p5);
      if (shouldDrawHyperPlanes) {
        drawHyperPlanes(p5);
      }
      if (shouldPulseHyperPlanes) {
        pulseHyperPlanes(p5);
      }
      calculateTimeIntervalsAllPaths();
      drawPaths(p5);
      drawHover(p5);
      drawTimeIntervals(p5);
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
