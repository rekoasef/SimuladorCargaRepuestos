import { Box, Edges } from "@react-three/drei";
import { Truck } from "../../lib/types";
import * as THREE from 'three';

interface TruckModelProps {
  truck: Truck;
}

export default function TruckModel({ truck }: TruckModelProps) {
  const { width, length, height } = truck;

  // Los objetos en Three.js se posicionan desde su centro,
  // por lo que movemos la caja a la mitad de sus dimensiones para que su base comience en (0,0,0).
  const position: [number, number, number] = [
    width / 2,
    height / 2,
    length / 2,
  ];

  return (
    <Box args={[width, height, length]} position={position}>
      {/* Este material crea las paredes semitransparentes */}
      <meshStandardMaterial
        color="#888888" // Un color gris
        transparent={true}
        opacity={0.25} // Nivel de transparencia
        side={THREE.BackSide} // Renderiza solo las caras internas, creando un efecto de "habitación"
      />
      {/* Esto dibuja los bordes del camión para definir mejor su forma */}
      <Edges color="white" />
    </Box>
  );
}