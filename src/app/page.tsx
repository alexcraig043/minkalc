import Canvas from "@/components/Canvas";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center p-8 gap-2 bg-honeydew">
      <h1 className="text-3xl font-bold-md text-center text-primary">
        Minkowski Spacetime Calculator ⌛
      </h1>
      <div className="flex flex-row gap-2 items-center">
        <p className="text-center text-primary text-lg">Made by Alex Craig</p>
        <Link href="https://github.com/alexcraig043" target="_blank">
          <Image src="/github-mark.png" alt="Github" width={24} height={24} />
        </Link>
      </div>
      <Canvas />
    </main>
  );
}
