import { Text, Cylinder, Cone } from "@react-three/drei";
import { Truck } from "../../lib/types";
import * as THREE from 'three'; // Importamos THREE para usar Vector3

interface CustomArrowProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

// Creamos nuestro propio componente de flecha
function CustomArrow({ start, end, color }: CustomArrowProps) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  
  // Usamos un cuaternión para orientar la flecha correctamente
  const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <group>
      {/* Línea de la flecha */}
      <Cylinder 
        args={[0.01, 0.01, length, 8]} 
        position={new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(0.5))}
        quaternion={orientation}
      >
        <meshBasicMaterial color={color} />
      </Cylinder>
      {/* Punta de la flecha */}
      <Cone 
        args={[0.05, 0.2, 8]} 
        position={end}
        quaternion={orientation}
      >
        <meshBasicMaterial color={color} />
      </Cone>
    </group>
  );
}

// --- Componente principal ---
interface DimensionHelpersProps {
  truck: Truck;
}

export default function DimensionHelpers({ truck }: DimensionHelpersProps) {
  const { width, length, height } = truck;
  const textColor = "#FFFFFF";
  const arrowColor = "#06B6D4"; // Cyan color

  return (
    <group>
      {/* Guía para el ANCHO (Eje X) */}
      <CustomArrow
        start={new THREE.Vector3(0, -0.2, length)}
        end={new THREE.Vector3(width, -0.2, length)}
        color={arrowColor}
      />
      <Text
        position={[width / 2, -0.2, length + 0.3]}
        fontSize={0.15}
        color={textColor}
        anchorX="center"
      >
        Ancho: {width.toFixed(2)}m
      </Text>

      {/* Guía para el LARGO (Eje Z en Three.js) */}
      <CustomArrow
        start={new THREE.Vector3(width + 0.2, -0.2, 0)}
        end={new THREE.Vector3(width + 0.2, -0.2, length)}
        color={arrowColor}
      />
      <Text
        position={[width + 0.3, -0.2, length / 2]}
        fontSize={0.15}
        color={textColor}
        anchorX="center"
        rotation={[0, Math.PI / 2, 0]}
      >
        Largo: {length.toFixed(2)}m
      </Text>

      {/* Guía para el ALTO (Eje Y en Three.js) */}
      <CustomArrow
        start={new THREE.Vector3(width + 0.2, 0, 0)}
        end={new THREE.Vector3(width + 0.2, height, 0)}
        color={arrowColor}
      />
      <Text
        position={[width + 0.3, height / 2, 0]}
        fontSize={0.15}
        color={textColor}
        anchorX="center"
        rotation={[0, Math.PI / 2, 0]}
      >
        Alto: {height.toFixed(2)}m
      </Text>
    </group>
  );
}