const formatTiempo = (totalSegundos) => {
  if (isNaN(totalSegundos) || totalSegundos === null) return "00:00.0";
  const min = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
  const sec = String(Math.floor(totalSegundos % 60)).padStart(2, '0');
  const dec = String(Math.floor((totalSegundos % 1) * 10));
  return `${min}:${sec}.${dec}`;
};

export default formatTiempo;