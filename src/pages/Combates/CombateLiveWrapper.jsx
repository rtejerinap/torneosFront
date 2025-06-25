import { useSearchParams } from 'react-router-dom';
import CombateLive from './CombateLive';

const CombateLiveWrapper = () => {
  const [params] = useSearchParams();

  const combateId = params.get('combateId');
  const nombreRojo = params.get('rojo');
  const nombreAzul = params.get('azul');

  if (!combateId || !nombreRojo || !nombreAzul) {
    return <p style={{ color: 'white', padding: '1rem' }}>Faltan datos del combate.</p>;
  }

  return (
    <CombateLive
      combateId={combateId}
      nombreRojo={nombreRojo}
      nombreAzul={nombreAzul}
    />
  );
};

export default CombateLiveWrapper;
