"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Undo2, Save, Trash2 } from 'lucide-react';

const SignatureCanvas = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [ctx, setCtx] = useState(null);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      
      // Set canvas to be responsive
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Set line style
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = 'black';
      
      setCtx(context);
      
      // Handle window resize
      const handleResize = () => {
        const currentDrawing = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Restore styles after resize
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = 'black';
        
        // Restore the drawing
        context.putImageData(currentDrawing, 0, 0);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (event.touches && event.touches[0]) {
      // Touch event
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    }
    
    // Mouse event
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    if (!ctx) return;
    const coordinates = getCoordinates(event);
    
    ctx.beginPath();
    ctx.moveTo(coordinates.x, coordinates.y);
    
    setIsDrawing(true);
    setLastPoint(coordinates);
    setIsEmpty(false);
  };

  const draw = (event) => {
    if (!isDrawing || !ctx) return;
    
    const coordinates = getCoordinates(event);
    
    ctx.lineTo(coordinates.x, coordinates.y);
    ctx.stroke();
    
    setLastPoint(coordinates);
  };

  const stopDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
  };

  const saveSignature = () => {
    if (!canvasRef.current || isEmpty) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="w-full">
      <div className="border border-emerald-300 dark:border-emerald-500 rounded-lg p-1 bg-white dark:bg-gray-800">
        <motion.canvas
          ref={canvasRef}
          className="w-full h-48 rounded cursor-crosshair touch-none bg-white dark:bg-gray-700"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        <motion.button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-md flex items-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isEmpty}
        >
          <Trash2 size={16} className="mr-1" /> Clear
        </motion.button>
        <motion.button
          type="button"
          onClick={saveSignature}
          className={`px-4 py-2 text-white rounded-md flex items-center ${
            isEmpty ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          whileHover={!isEmpty ? { scale: 1.03 } : {}}
          whileTap={!isEmpty ? { scale: 0.97 } : {}}
          disabled={isEmpty}
        >
          <Save size={16} className="mr-1" /> Save Signature
        </motion.button>
      </div>
      <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
        Sign within the box above and click "Save Signature"
      </div>
    </div>
  );
};

export default SignatureCanvas;
