import { AirbnbMoroccoForm2 } from "@/components/airbnb-morocco";


export default function Home() {
  return (
    <main className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('/images/6349232.jpg')" }}>
      <div className="min-h-screen overflow-y-auto">
        <AirbnbMoroccoForm2 />
      </div>
    </main>
  )
}
