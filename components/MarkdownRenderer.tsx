import React from 'react';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderContent = () => {
    // Este es un parser muy básico. En una aplicación real, usa una librería como 'react-markdown'.
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
      }
      if (line.startsWith('* ')) {
        return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      // Negrita y cursiva básicas
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return <div className="space-y-2 text-gray-300">{renderContent()}</div>;
};

export default MarkdownRenderer;
