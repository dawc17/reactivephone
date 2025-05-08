import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line as KonvaLine } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { io, Socket } from 'socket.io-client';
import Konva from 'konva'; // Import Konva namespace for types like Konva.Stage

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  brushColor: string;
  brushRadius: number;
  tool?: string; // Added tool to differentiate lines from erasers if needed later
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  brushColor?: string;
  brushRadius?: number;
  // Forwarded ref is not directly used by react-konva's Stage in the same way as react-canvas-draw
  // We'll manage the stage instance internally if needed for methods like toDataURL.
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = 800,
  height = 600,
  brushColor = '#000000',
  brushRadius = 2,
}) => {
  const [lines, setLines] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null); // Ref for Konva Stage

  // Socket.IO connection and event listeners
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      newSocket.emit('requestInitialCanvas');
    });

    newSocket.on('initialCanvas', (initialLines: Stroke[] | null) => {
      if (initialLines) {
        setLines(initialLines);
      }
    });

    newSocket.on('newStrokeBroadcast', (strokeData: Stroke) => {
      setLines((prevLines) => [...prevLines, strokeData]);
    });

    newSocket.on('clearCanvasBroadcast', () => {
      setLines([]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getRelativePointerPosition = (stage: Konva.Stage | null): Point | null => {
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    // Transform pointer position to be relative to the stage
    // Needed if stage has scaling or offset, but for simple case it might be direct
    // For now, assuming simple direct coordinates. If pan/zoom is added, this needs adjustment.
    return { x: pos.x, y: pos.y };
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    setIsDrawing(true);
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;
    const newLine: Stroke = { points: [pos], brushColor, brushRadius, tool: 'pen' };
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) {
      return;
    }
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos || lines.length === 0) return;

    setLines((prevLines) =>
      prevLines.map((line, index) => {
        if (index === prevLines.length - 1) { // Update the last line
          return {
            ...line,
            points: [...line.points, pos],
          };
        }
        return line;
      })
    );
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (socketRef.current && lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      // Only emit if the line has more than one point (not just a click)
      if (lastLine && lastLine.points.length > 1) {
        socketRef.current.emit('newStroke', lastLine);
      }
    }
  };

  const clearCanvas = () => {
    setLines([]);
    if (socketRef.current) {
      socketRef.current.emit('clearCanvas');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden"> {/* Added overflow-hidden for stage */}
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} // Stop drawing if mouse leaves canvas
          ref={stageRef}
          style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
        >
          <Layer>
            {/* Draw existing lines */}
            {lines.map((line, i) => (
              <KonvaLine
                key={i}
                points={line.points.flatMap(p => [p.x, p.y])}
                stroke={line.brushColor}
                strokeWidth={line.brushRadius}
                tension={0.5} // Makes lines smoother
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default DrawingCanvas; 