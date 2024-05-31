"use client";

import Canvas from "@/components/Canvas";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import CheckedControl from "@/components/CheckedControl";
import ControlButton from "@/components/ControlButton";

export default function Home() {
  const [timeIntervals, setTimeIntervals] = useState([]);
  const [currentTimes, setCurrentTimes] = useState([]);
  const [paused, setPaused] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [checked, setChecked] = useState(true);

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

  function getColor(index, transparent = false) {
    if (transparent) {
      return colorsTrans[index % colorsTrans.length];
    }

    return colors[index % colors.length];
  }

  return (
    <main className="container flex h-screen flex-col items-center p-8 gap-2">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold-md text-center text-primary">
          Minkowski Spacetime Calculator ⌛
        </h1>
        <div className="flex flex-row gap-2 items-center">
          <p className="text-center text-primary text-lg">
            Made by Alex Craig {"'"}25
          </p>
          <Link href="https://github.com/alexcraig043/minkalc" target="_blank">
            <Image src="/github-mark.png" alt="Github" width={24} height={24} />
          </Link>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-2">
        <motion.div
          className="flex flex-col flex-1 items-start w-full h-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 1],
            y: [10, 0],
          }}
          transition={{
            duration: 0.2,
            delay: 0.3,
          }}
        >
          <h2 className="text-xl font-bold-md text-center text-primary">
            Instructions
          </h2>
          <ul className="list-disc p-2 text-primary pl-4">
            <li>
              <span className="font-bold">Click</span> to add an event and enter
              drawing mode.
            </li>
            <li>
              Press <span className="font-bold">escape</span> to exit drawing
              mode.
            </li>
            <li>
              <span className="font-bold">Drag</span> an event to move it.
            </li>
            <li>
              <span className="font-bold">Click</span> on a worldline{"'"}s
              event to add more events.
            </li>
            <li>
              <span className="font-bold">Hover</span> on an event to show its
              lightcone.
            </li>
            <li>
              Press <span className="font-bold">z</span> to undo last event.
            </li>
            <li>
              Press <span className="font-bold">x</span> to clear all
              worldlines.
            </li>
          </ul>
        </motion.div>
        <motion.div
          className="flex-1 flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 1],
            y: [10, 0],
          }}
          transition={{
            duration: 0.1,
            delay: 0.5,
          }}
        >
          <Canvas
            getColor={getColor}
            setTimeIntervalsState={setTimeIntervals}
            setCurrentTimesState={setCurrentTimes}
            shouldDrawHyperPlanesProp={checked}
            shouldPulseProp={!paused}
            showShowPulseProp={showPulse}
          />
          <div className="flex flex-row items-center gap-4">
            <ControlButton
              on={paused}
              setOn={setPaused}
              onText="Play"
              offText="Pause"
            />
            <ControlButton
              on={showPulse}
              setOn={setShowPulse}
              onText="Hide"
              offText="Show"
            />
            <CheckedControl checked={checked} setChecked={setChecked} />
          </div>
        </motion.div>
        <motion.div
          className="flex flex-col flex-1 items-start w-full h-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 1],
            y: [10, 0],
          }}
          transition={{
            duration: 0.2,
            delay: 0.7,
          }}
        >
          <h2 className="text-xl font-bold-md text-center text-primary">
            Time Intervals
          </h2>
          <ul className="list-disc p-2 text-primary">
            {timeIntervals.map((pathIntervals, index) => {
              let totalTime = null;

              if (pathIntervals.length > 0) {
                return (
                  <>
                    <li
                      key={index}
                      className="flex flex-row items-start gap-1.5"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 mt-1"
                        style={{
                          backgroundColor: getColor(index),
                        }}
                      />
                      <p className="text-primary">
                        {pathIntervals.map((interval, i) => {
                          let roundedInterval;

                          if (interval === null) {
                            roundedInterval = "NA";
                          } else {
                            totalTime += interval;
                            roundedInterval =
                              (Math.round(interval * 10) / 10).toString() +
                              " years";
                          }

                          return (
                            <span key={i}>
                              {roundedInterval}
                              {i < pathIntervals.length - 1 && " → "}
                            </span>
                          );
                        })}
                        {totalTime !== null && (
                          <span>
                            {" "}
                            = {Math.round(totalTime * 10) / 10} years
                          </span>
                        )}
                      </p>
                    </li>
                    <span>
                      {"Currently: "}
                      {currentTimes[index] === null
                        ? "NA"
                        : Math.round(currentTimes[index] * 10) / 10}{" "}
                      years
                    </span>
                  </>
                );
              }
            })}
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
