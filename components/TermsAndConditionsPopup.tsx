import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface TermsAndConditionsPopupProps {
  isOpen: boolean
  onClose: () => void
}

const TermsAndConditionsPopup: React.FC<TermsAndConditionsPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/90 backdrop-blur-md max-w-3xl sm:h-full md:max-h-[80vh] sm:w-[80%] md:w-full overflow-y-auto my-2">
        <DialogHeader>
          <DialogTitle className="sm:text-3xl md:text-2xl font-bold text-purple-900 mb-4">Conditions Générales</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-purple-800 space-y-4 flex flex-col sm:text-base md:text-base">
          <span>1. Réservation et paiement : La réservation est confirmée après le paiement d&apos;un acompte de 30% du montant total. Le solde doit être réglé au plus tard 30 jours avant la date d&apos;arrivée.</span>
          <span>2. Annulation : En cas d&apos;annulation plus de 30 jours avant la date d&apos;arrivée, l&apos;acompte est remboursé à 50%. Pour une annulation entre 15 et 30 jours avant l&apos;arrivée, l&apos;acompte est conservé. Pour une annulation moins de 15 jours avant l&apos;arrivée, le montant total de la réservation est dû.</span>
          <span>3. Arrivée et départ : L&apos;arrivée se fait à partir de 15h et le départ avant 11h, sauf accord préalable.</span>
          <span>4. Utilisation des lieux : Le locataire s&apos;engage à utiliser les lieux paisiblement et à les maintenir en bon état.</span>
          <span>5. Capacité : Le nombre de personnes utilisant le logement ne doit pas excéder la capacité indiquée lors de la réservation.</span>
          <span>6. Animaux : Les animaux ne sont pas acceptés, sauf accord préalable du propriétaire.</span>
          <span>7. Responsabilité : Le propriétaire décline toute responsabilité en cas de vol ou de dommage personnel pendant le séjour.</span>
          <span>8. Litiges : En cas de litige, seul le tribunal de la juridiction de la location sera compétent.</span>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default TermsAndConditionsPopup
