import { PlacedPallet } from "../../lib/types";
import { Box, Text } from "@react-three/drei";
import { useSpring, a } from '@react-spring/three'; // <-- IMPORTAR

interface PalletModelProps {
  pallet: PlacedPallet;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

export default function PalletModel({ pallet, isSelected, onSelect }: PalletModelProps) {
  const position: [number, number, number] = [
    pallet.x + pallet.width / 2,
    pallet.z + pallet.height / 2,
    pallet.y + pallet.length / 2,
  ];

  const baseColor = pallet.isFragile ? '#FFD700' : '#06B6D4';

  // Animación de "pop-in"
  const { scale } = useSpring({
    from: { scale: [0.3, 0.3, 0.3] },
    to: { scale: [1, 1, 1] },
    config: { tension: 220, friction: 20 },
  });

  return (
    // Usamos a.group para aplicar la animación de escala
    // @ts-ignore
    <a.group scale={scale} position={position}>
      <Box
        args={[pallet.width, pallet.height, pallet.length]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(pallet.id);
        }}
      >
        <meshStandardMaterial
          color={baseColor}
          emissive={isSelected ? baseColor : '#000000'}
          emissiveIntensity={isSelected ? 1.5 : 0}
          toneMapped={false}
          transparent
          opacity={0.85}
        />
        <Text
          position={[0, pallet.height / 2 + 0.1, 0]}
          fontSize={0.15}
          color="black"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {pallet.id}
        </Text>
      </Box>
    </a.group>
  );
}
