import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-glow-cyan tracking-widest">
          Visual AI Trading Journal
        </h1>
        <div className="border border-magenta/50 bg-magenta/10 text-magenta p-3 mt-4 rounded-md max-w-4xl mx-auto text-xs md:text-sm" role="alert">
          <p className="font-bold text-base uppercase">Advertencia de Riesgo Crítico</p>
          <p>Esta es una herramienta de análisis y registro SÓLO para fines educativos. **No** se conecta a ningún bróker real. El trading implica un riesgo extremadamente alto. El rendimiento pasado, analizado o registrado no es un indicador de resultados futuros. Utiliza esta herramienta para aprender, no como asesoramiento financiero.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;