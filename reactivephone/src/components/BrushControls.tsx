import React from 'react';

interface BrushControlsProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushRadius: number;
  setBrushRadius: (radius: number) => void;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#808080', '#A52A2A', '#008000', '#FFA500',
  '#800080', '#FFC0CB', '#E6E6FA', '#FFD700',
];

const BrushControls: React.FC<BrushControlsProps> = ({
  brushColor,
  setBrushColor,
  brushRadius,
  setBrushRadius,
}) => {
  return (
    <div className="p-4 bg-gray-200 rounded-lg shadow-md space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Brush Color</h3>
        <div className="grid grid-cols-8 gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              title={color}
              onClick={() => setBrushColor(color)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                brushColor === color ? 'border-blue-500 scale-110' : 'border-gray-400 hover:border-gray-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="customColor" className="text-sm text-gray-600">Custom:</label>
          <input
            type="color"
            id="customColor"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-8 h-8 p-0 border-none rounded-md"
          />
           <span className="text-xs text-gray-500 p-1 rounded bg-white shadow-sm">{brushColor}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Brush Size</h3>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="50"
            value={brushRadius}
            onChange={(e) => setBrushRadius(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-md shadow-sm w-10 text-center">
            {brushRadius}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrushControls; 