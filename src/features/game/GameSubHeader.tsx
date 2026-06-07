export function GameSubHeader() {
  return (
    <div className="w-full flex items-center relative mb-8 text-accent font-afacad tracking-[0.02em]">
      <button className="flex items-center gap-2 text-lg hover:text-white transition-colors z-10 font-bold">
        <span>&lt;</span> Zurück
      </button>

      <h1 className="absolute w-full text-center text-2xl font-bold uppercase z-0">
        LOBBY #42
      </h1>
    </div>
  );
}
