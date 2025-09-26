import { PlacedPallet } from "../../lib/types";
import { Box, Text } from "@react-three/drei";

interface PalletModelProps {
  pallet: PlacedPallet;
}

export default function PalletModel({ pallet }: PalletModelProps) {
  // Calculamos la posición central del mesh. R3F posiciona los objetos desde su centro.
  const position: [number, number, number] = [
    pallet.x + pallet.width / 2,
    pallet.z + pallet.height / 2, // Eje Z de Three.js es el eje Y en nuestro sistema (altura)
    pallet.y + pallet.length / 2, // Eje Y de Three.js es el eje Z en nuestro sistema (profundidad)
  ];

  return (
    <Box
      args={[pallet.width, pallet.height, pallet.length]} // Ancho, Alto, Profundidad
      position={position}
    >
      <meshStandardMaterial 
        color={pallet.isFragile ? '#FFD700' : '#06B6D4'} // Dorado si es frágil, cyan si no
        transparent 
        opacity={0.8}
      />
      {/* Mostramos el ID de la tarima sobre ella */}
      <Text
        position={[0, pallet.height / 2 + 0.1, 0]} // Un poco por encima del centro superior
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]} // Rotar el texto para que quede plano
      >
        {pallet.id}
      </Text>
    </Box>
  );
}