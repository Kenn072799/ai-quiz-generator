import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
