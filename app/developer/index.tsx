import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Image, ScrollView, StatusBar, Linking } from "react-native"

import Github from "../../assets/github.png"
import Linkedin from "../../assets/linkedin.png"
import SumanImage from "../../assets/suman.jpeg"
import SuvanImage from "../../assets/suvan.jpeg"
import VijayImage from "../../assets/vijay.jpeg"

interface DeveloperDetails {
  name: string
  status: string
  image: any // Change to 'any' type for local asset
  details: string
  gitHub: string
  linkDin: string
}

const DeveloperCard: React.FC<DeveloperDetails> = ({ name, status, image, details, gitHub, linkDin }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <TouchableOpacity
      className={`w-[280px] h-[380px] m-2 bg-[#333] rounded-lg p-4 overflow-hidden ${
        isFlipped ? "border-2 border-[#FDB623]" : ""
      }`}
      onPress={() => setIsFlipped(!isFlipped)}
    >
      {!isFlipped ? (
        <View className="flex-1 items-center justify-between py-2">
          <Text className="text-xl font-bold text-white mb-1">{name}</Text>
          <Text className="text-sm text-[#6c757d] mb-2">{status}</Text>
          <Image source={image} className="w-[220px] h-[220px] rounded-xl" resizeMode="cover" />
          <TouchableOpacity className="bg-[#FDB623] py-2 px-6 rounded mt-4" onPress={() => setIsFlipped(true)}>
            <Text className="text-black text-sm">Details</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 items-center justify-between py-2">
          <Text className="text-xl font-bold text-white mb-2">Details</Text>
          <Text className="text-sm text-white text-center px-2">{details}</Text>
          <View className="flex-row justify-center mt-4">
            <TouchableOpacity onPress={() => Linking.openURL(gitHub)}>
              <Image source={Github} className="w-[50px] h-[50px] mx-3" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(linkDin)}>
              <Image source={Linkedin} className="w-[50px] h-[50px] mx-3" resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="bg-[#FDB623] py-2 px-6 rounded mt-4" onPress={() => setIsFlipped(false)}>
            <Text className="text-black text-sm">Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

const DeveloperScreen: React.FC = () => {
  const router = useRouter()

  const developers: DeveloperDetails[] = [
    {
      name: "Suvan GS",
      status: "Geek",
      image: SuvanImage,
      details: "Technical Lead",
      linkDin: "https://www.linkedin.com/in/suman-s-7b1313211/",
      gitHub: "https://github.com/greeenboi/",
    },
    {
      name: "Vijay Makkad",
      status: "Geek",
      image: VijayImage,
      details: "Associate Technical Lead",
      linkDin: "https://www.linkedin.com/in/vijay-makkad-1573681b3/",
      gitHub: "https://github.com/VijayMakkad",
    },
    {
      name: "Suman S Harshvardhan",
      status: "Geek",
      image: SumanImage,
      details: "Technical Member",
      linkDin: "https://www.linkedin.com/in/suman-s-7b1313211/",
      gitHub: "https://github.com/snugtroller",
    },
  ]

  return (
    <View className="flex-1 bg-[#333] ">
      <StatusBar barStyle="light-content" backgroundColor="#333" />
      <View className="absolute top-12 mt-5 left-5 z-10 bg-[#333] p-2 rounded-xl shadow-lg shadow-black">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingTop: 80, paddingBottom: 20, marginTop:10 }}>
        <Text className="text-[#FDB623] text-3xl font-bold mb-5">Our Developers</Text>
        <View className="flex-row flex-wrap justify-center px-4">
          {developers.map((dev, index) => (
            <DeveloperCard
              key={index}
              name={dev.name}
              status={dev.status}
              image={dev.image}
              details={dev.details}
              gitHub={dev.gitHub}
              linkDin={dev.linkDin}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default DeveloperScreen

