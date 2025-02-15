"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DropzoneComponent from "./DropzoneComponent"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, User, User2, CreditCard, StampIcon as Passport } from "lucide-react"
import TermsAndConditionsPopup from "./TermsAndConditionsPopup"
import SignatureCanvas from "./signature-canvas"

interface Country {
  name: string
  code: string
  flag: string
}

const guestSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom complet doit comporter au moins 2 caractères" }),
  sex: z.enum(["male", "female"], { required_error: "Veuillez sélectionner un sexe" }),
  nationality: z.string().min(1, { message: "Veuillez sélectionner une nationalité" }),
  identificationType: z.enum(["CIN", "Passport"], { required_error: "Veuillez sélectionner un type d'identification" }),
  identificationFiles: z.array(z.any()).refine(files => files.length > 0, { message: "L'identification est requise" }),
})

const formSchema = z.object({
  numberOfGuests: z.string().min(1, { message: "Veuillez sélectionner le nombre d'invités" }),
  guests: z.array(guestSchema),
  marriageCertificate: z.array(z.any()).optional(),
  termsAccepted: z.enum(["accepted"], { required_error: "Vous devez accepter les conditions générales" }),
  signature: z.string().min(1, { message: "Veuillez fournir votre signature" }),
})

export function AirbnbMoroccoForm2() {
  const [requiresMarriageCertificate, setRequiresMarriageCertificate] = useState(false)
  const [signature, setSignature] = useState("")
  const [expandedGuests, setExpandedGuests] = useState<number[]>([])
  const [cardHeight, setCardHeight] = useState("auto")
  const [countries, setCountries] = useState<Country[]>([])
  const [countrySearch, setCountrySearch] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isTermsPopupOpen, setIsTermsPopupOpen] = useState(false)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const countryList: Country[] = data.map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
          flag: country.flags.svg || country.flags.png,
        }))
        setCountries(countryList)
        setFilteredCountries(countryList)
      } catch (error) {
        console.error("Error fetching countries:", error)
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    const filterCountries = () => {
      const searchTerm = countrySearch.toLowerCase()
      const filtered = countries.filter((country) => country.name.toLowerCase().startsWith(searchTerm))
      setFilteredCountries(filtered)
    }

    filterCountries()
  }, [countrySearch, countries])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfGuests: "1",
      guests: [{ fullName: "", sex: "male", nationality: "", identificationType: "CIN", identificationFiles: [] }],
      marriageCertificate: [],
      termsAccepted: undefined,
      signature: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "guests",
    control: form.control,
  })

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "numberOfGuests" || name?.startsWith("guests")) {
        const numGuests = Number.parseInt(value.numberOfGuests as string, 10)
        const currentGuests = value.guests || []

        if (currentGuests.length < numGuests) {
          for (let i = currentGuests.length; i < numGuests; i++) {
            append({ fullName: "", sex: "male", nationality: "", identificationType: "CIN", identificationFiles: [] })
          }
        } else if (currentGuests.length > numGuests) {
          for (let i = currentGuests.length - 1; i >= numGuests; i--) {
            remove(i)
          }
        }

        const hasMoroccanFemale = currentGuests.some(
          (guest) => guest?.nationality === "Morocco" && guest?.sex === "female",
        )
        const hasMoroccanMale = currentGuests.some((guest) => guest?.nationality === "Morocco" && guest?.sex === "male")
        const hasNonMoroccanFemale = currentGuests.some(
          (guest) => guest?.nationality !== "Morocco" && guest?.sex === "female",
        )
        const hasNonMoroccanMale = currentGuests.some(
          (guest) => guest?.nationality !== "Morocco" && guest?.sex === "male",
        )

        setRequiresMarriageCertificate(
          (hasMoroccanFemale && hasMoroccanMale) ||
            (hasMoroccanFemale && hasNonMoroccanMale) ||
            (hasMoroccanMale && hasNonMoroccanFemale),
        )
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch, append, remove])

  const toggleGuestExpansion = (index: number) => {
    setExpandedGuests((prev) => {
      if (prev.includes(index)) {
        setCardHeight("auto")
        return prev.filter((i) => i !== index)
      } else {
        const newExpanded = [index]
        const numGuests = Number.parseInt(form.getValues("numberOfGuests"), 10)
        const screenWidth = window.innerWidth

        if (screenWidth < 640) {
          // Small devices
          if (numGuests <= 2) {
            setCardHeight("150vh")
          } else if (numGuests <= 4) {
            if (index < 2) {
              setCardHeight("150vh")
            } else {
              setCardHeight("160vh")
            }
          } else if (numGuests <= 6) {
            if (index < 2) {
              setCardHeight("150vh")
            } else if (index < 4) {
              setCardHeight("160vh")
            } else {
              setCardHeight("180vh")
            }
          }
        } else if (screenWidth >= 641 && screenWidth <= 1024) {
          // Medium devices
          if (numGuests <= 2) {
            setCardHeight("140vh")
          } else if (numGuests <= 4) {
            if (index < 2) {
              setCardHeight("140vh")
            } else {
              setCardHeight("150vh")
            }
          } else if (numGuests <= 6) {
            if (index < 2) {
              setCardHeight("140vh")
            } else if (index < 4) {
              setCardHeight("150vh")
            } else {
              setCardHeight("160vh")
            }
          }
        } else {
          // Large devices (laptops and above)
          if (numGuests <= 2) {
            setCardHeight("165vh")
          } else if (numGuests <= 4) {
            if (index < 2) {
              setCardHeight("165vh")
            } else {
              setCardHeight("180vh")
            }
          } else if (numGuests <= 6) {
            if (index < 2) {
              setCardHeight("165vh")
            } else if (index < 4) {
              setCardHeight("180vh")
            } else {
              setCardHeight("195vh")
            }
          }
        }

        return newExpanded
      }
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white/30 backdrop-blur-md shadow-xl rounded-xl border border-white/20 overflow-hidden">
        <CardContent className="p-6 max-h-[95vh] overflow-y-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center text-white font-moroccan">
            Location d&apos;Appartement au Maroc
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-[90%] md:w-[50%]">
                    <FormLabel className="text-sm sm:text-md md:text-lg font-semibold text-white">
                      Nombre d&apos;invités
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/20 text-white border border-white/30 rounded-md p-3">
                          <SelectValue placeholder="Sélectionnez le nombre d'invités" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-violet-950 text-white">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-4 sm:my-8 bg-white/30" />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">Informations des invités</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`guests.${index}`}
                      render={({ field }) => (
                        <FormItem className="relative">
                          <div
                            className="w-full bg-white/20 text-white border border-white/30 rounded-md p-3 flex justify-between items-center cursor-pointer"
                            onClick={() => toggleGuestExpansion(index)}
                          >
                            <span>Invité {index + 1}</span>
                            {expandedGuests.includes(index) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                          {expandedGuests.includes(index) && (
                            <Card className="absolute left-0 w-full mt-2 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 z-10">
                              <CardContent className="p-2 sm:p-4 space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`guests.${index}.fullName`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-800">Nom complet</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Entrez votre nom complet"
                                          className="bg-white/50 text-gray-800 border-gray-300 focus:ring-purple-400 w-full"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`guests.${index}.sex`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-800">Sexe</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                          className="flex space-x-4"
                                        >
                                          <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                              <RadioGroupItem value="male" className="peer hidden" />
                                            </FormControl>
                                            <FormLabel
                                              className={`flex items-center space-x-2 cursor-pointer text-gray-800 p-2 rounded-lg border ${
                                                field.value === "male"
                                                  ? "bg-purple-600 border-purple-600 text-white" // Selected style
                                                  : "bg-white/50 border-gray-300" // Unselected style
                                              }`}
                                            >
                                              <User className="h-5 w-5" />
                                              <span className="pr-2">Homme</span>
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                              <RadioGroupItem value="female" className="peer hidden" />
                                            </FormControl>
                                            <FormLabel
                                              className={`flex items-center space-x-2 cursor-pointer text-gray-800 p-2 rounded-lg border ${
                                                field.value === "female"
                                                  ? "bg-purple-600 border-purple-600 text-white" // Selected style
                                                  : "bg-white/50 border-gray-300" // Unselected style
                                              }`}
                                            >
                                              <User2 className="h-5 w-5" />
                                              <span className="pr-2">Femme</span>
                                            </FormLabel>
                                          </FormItem>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`guests.${index}.nationality`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-800">Nationalité</FormLabel>
                                      <div className="relative">
                                        <FormControl>
                                          <div className="flex items-center">
                                            <Input
                                              type="text"
                                              placeholder="Rechercher une nationalité..."
                                              className="bg-white/50 text-gray-800 border-gray-300 focus:ring-purple-400 w-full"
                                              value={field.value ? field.value : countrySearch}
                                              onChange={(e) => {
                                                setCountrySearch(e.target.value)
                                                field.onChange(e.target.value)
                                                setShowDropdown(true)
                                                setSelectedCountry(null)
                                              }}
                                              ref={inputRef}
                                              onFocus={() => setShowDropdown(true)}
                                            />
                                            {showDropdown && (
                                              <button
                                                className="bg-transparent border-none p-2 cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setShowDropdown(false)
                                                }}
                                              >
                                                <ChevronUp className="h-5 w-5 text-gray-800" />
                                              </button>
                                            )}
                                          </div>
                                        </FormControl>
                                        {showDropdown && filteredCountries.length > 0 && (
                                          <ul className="absolute top-full left-0 w-full z-10 bg-white text-gray-800 max-h-48 overflow-y-auto border border-gray-300 rounded-md mt-1">
                                            {filteredCountries.map((country) => (
                                              <li
                                                key={country.code}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setCountrySearch("")
                                                  field.onChange(country.name)
                                                  setSelectedCountry(country)
                                                  setShowDropdown(false)
                                                }}
                                              >
                                                <img
                                                  src={country.flag || "/placeholder.svg"}
                                                  alt={`${country.name} flag`}
                                                  className="h-5 w-auto mr-2"
                                                />
                                                <span>{country.name}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`guests.${index}.identificationType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-800">Type d'identification</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                          className="flex space-x-4"
                                        >
                                          <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                              <RadioGroupItem value="CIN" className="peer hidden" />
                                            </FormControl>
                                            <FormLabel
                                              className={`flex items-center space-x-2 cursor-pointer text-gray-800 p-2 rounded-lg border ${
                                                field.value === "CIN"
                                                  ? "bg-purple-600 border-purple-600 text-white"
                                                  : "bg-white/50 border-gray-300"
                                              }`}
                                            >
                                              <CreditCard className="h-5 w-5" />
                                              <span className="pr-2">CIN</span>
                                            </FormLabel>
                                          </FormItem>
                                          <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                              <RadioGroupItem value="Passport" className="peer hidden" />
                                            </FormControl>
                                            <FormLabel
                                              className={`flex items-center space-x-2 cursor-pointer text-gray-800 p-2 rounded-lg border ${
                                                field.value === "Passport"
                                                  ? "bg-purple-600 border-purple-600 text-white"
                                                  : "bg-white/50 border-gray-300"
                                              }`}
                                            >
                                              <Passport className="h-5 w-5" />
                                              <span className="pr-2">Passeport</span>
                                            </FormLabel>
                                          </FormItem>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`guests.${index}.identificationFiles`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-800">
                                        {field.value === "CIN" ? "CIN (Recto/Verso)" : "Passeport"}
                                      </FormLabel>
                                      <FormControl>
                                        <DropzoneComponent
                                          onChange={(files) => field.onChange(files)}
                                          maxFiles={field.value === "CIN" ? 2 : 1}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-gray-600">
                                        {field.value === "CIN"
                                          ? "Veuillez télécharger une copie recto et verso de votre CIN."
                                          : "Veuillez télécharger une copie de votre passeport."}
                                        Taille maximale du fichier : 5 Mo par image.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </CardContent>
                            </Card>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <Separator className="my-4 sm:my-8 bg-white/30" />

              {requiresMarriageCertificate && (
                <FormField
                  control={form.control}
                  name="marriageCertificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-md md:text-lg font-semibold text-white font-moroccan">
                        Certificat de mariage
                      </FormLabel>
                      <FormControl>
                        <DropzoneComponent onChange={(files) => field.onChange(files)} />
                      </FormControl>
                      <FormDescription className="text-gray-300">
                        Comme il y a des invités masculins et féminins, dont une femme marocaine, veuillez télécharger
                        votre certificat de mariage. Taille maximale du fichier : 5 Mo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm sm:text-md md:text-lg font-semibold text-white font-moroccan">
                      Conditions générales
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="accepted" className="border-white text-purple-600" />
                          </FormControl>
                          <FormLabel className="font-normal text-white">
                            J&apos;accepte les{" "}
                            <span
                              className="underline cursor-pointer text-yellow-300 hover:text-yellow-400"
                              onClick={() => setIsTermsPopupOpen(true)}
                            >
                              conditions générales
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-8">
                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-md md:text-lg font-semibold text-white">
                        Signature
                      </FormLabel>
                      <FormControl>
                        <SignatureCanvas
                          onChange={(sig) => {
                            setSignature(sig)
                            field.onChange(sig)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-purple-900 font-bold py-3 px-10 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Soumettre la Demande
                </Button>
              </div>
            </form>
          </Form>

          <TermsAndConditionsPopup isOpen={isTermsPopupOpen} onClose={() => setIsTermsPopupOpen(false)} />
        </CardContent>
      </Card>
    </div>
  )
}

