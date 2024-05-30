"use client";

import Canvas from "@/components/Canvas";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [paths, setPaths] = useState([]);

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
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <motion.div
          className="flex flex-col flex-1 items-start h-full"
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
          <ul className="list-disc p-2 text-primary pl-6">
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
              <span className="font-bold">Click</span> on the last event of a
              worldline to add more events (cannot be in drawing mode).
            </li>
            <li>
              <span className="font-bold">Hover</span> on an event to show its
              lightcone (cannot be in drawing mode).
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
          className="flex-1"
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
          <Canvas paths={paths} setPaths={setPaths} />
        </motion.div>
        <motion.div
          className="flex flex-col flex-1 items-start h-full"
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
            Information
          </h2>
          <ul className="list-disc p-2 text-primary pl-6">
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
              <span className="font-bold">Click</span> on the last event of a
              worldline to add more events (cannot be in drawing mode).
            </li>
            <li>
              <span className="font-bold">Hover</span> on an event to show its
              lightcone (cannot be in drawing mode).
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
      </div>
    </main>
  );
}
