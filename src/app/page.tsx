import Canvas from "@/components/Canvas";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center p-8 gap-8">
      <h1 className="text-3xl font-bold text-center text-primary">
        Minkowski Spacetime Calculator
      </h1>
      <Canvas />
    </main>
  );
}
