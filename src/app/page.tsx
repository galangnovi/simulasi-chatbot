import ChatTemplate from "@/components/chat";

export default function Home() {
  return (
    <div className="w-full flex justify-center px-4 py-4 sm:px-0 sm:py-0">
      <img src="/background.png" alt="" className="fixed top-0 left-0 w-screen h-screen object-cover z-0 blur-xl"/>
      <div className="relative z-10 w-full h-full flex justify-center items-center">
        <ChatTemplate />
      </div>
    </div>
    
  );
}
