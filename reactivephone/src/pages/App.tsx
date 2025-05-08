import { useRef, useState } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';
import BrushControls from '../components/BrushControls';
import type CanvasDraw from 'react-canvas-draw';

function App() {
  const canvasRef = useRef<CanvasDraw>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushRadius, setBrushRadius] = useState(2);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Reactive Drawing Pad
      </h1>
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6 justify-center items-start">
        <div className="flex flex-col gap-6 w-full lg:w-auto">
          <BrushControls
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            brushRadius={brushRadius}
            setBrushRadius={setBrushRadius}
          />
        </div>
        <div className="flex-grow flex justify-center lg:justify-start">
          <DrawingCanvas
            ref={canvasRef}
            brushColor={brushColor}
            brushRadius={brushRadius}
            width={canvasWidth}
            height={canvasHeight}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
